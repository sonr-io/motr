// Package main implements a WebAssembly module for secure enclave operations
// using the Extism PDK. It provides functionality for importing, signing, and
// verifying data with MPC (Multi-Party Computation) enclaves.
package main

import (
	"errors"
	"os"
	"strings"

	"github.com/extism/go-pdk"
	"github.com/sonr-io/crypto/mpc"
)

// Storage key constants used for persistent state
const (
	configKey = "sonr-enclave-config"
	dataKey   = "sonr-enclave-data"
	stateKey  = "sonr-enclave-state"
)

// Error definitions
var (
	ErrInvalidArgument = errors.New("invalid argument")
	ErrInvalidConfig   = errors.New("invalid config")
	ErrInvalidState    = errors.New("invalid state")
	ErrMissingConfig   = errors.New("missing config")
	ErrMissingEnclave  = errors.New("missing enclave")
)

// EnclaveState represents the current state of the enclave
type EnclaveState int

const (
	EnclaveStateNone     EnclaveState = iota // No enclave loaded
	EnclaveStateImported               // Enclave imported but not stored
	EnclaveStateStored                 // Enclave fully stored
)

// ExtractionMethod defines how enclave data will be retrieved
type ExtractionMethod int

const (
	ExtractionMethodNone ExtractionMethod = iota // No extraction method defined
	ExtractionMethodIPFS                         // Retrieve from IPFS
	ExtractionMethodFile                         // Retrieve from local file
)

// EnclaveConfig holds configuration for enclave retrieval
type EnclaveConfig struct {
	CID        string           `json:"cid"`
	GatewayURL string           `json:"gateway_url"`
	FilePath   string           `json:"file_path"`
	Raw        bool             `json:"raw"`
	Method     ExtractionMethod `json:"extraction_method"`
}

// Request/Response types
type SignRequest struct {
	Data []byte `json:"message"`
}

type VerifyRequest struct {
	Message   []byte `json:"message"`
	Signature []byte `json:"signature"`
}

// getURL returns the full IPFS URL for retrieval
func (e EnclaveConfig) getURL() string {
	if e.GatewayURL == "" {
		return "https://ipfs.io/ipfs/" + e.CID
	}
	return e.GatewayURL + "/ipfs/" + e.CID
}

// Resolve retrieves the enclave data based on the configured method
func (e EnclaveConfig) Resolve() ([]byte, error) {
	switch e.Method {
	case ExtractionMethodIPFS:
		req := pdk.NewHTTPRequest(pdk.MethodGet, e.getURL())
		res := req.Send()
		bz := res.Body()
		return bz, nil
	case ExtractionMethodFile:
		content, err := os.ReadFile(e.FilePath)
		if err != nil {
			logError(err)
		}
		return content, nil
	default:
		return nil, ErrInvalidArgument
	}
}

// State management functions

// getState retrieves the current enclave state
func getState() EnclaveState {
	state := pdk.GetVarInt(stateKey)
	if state == 0 {
		return EnclaveStateNone
	}
	return EnclaveState(state)
}

// setState updates the enclave state
func setState(state EnclaveState) {
	pdk.SetVarInt(stateKey, int(state))
}

// loadConfig loads configuration from plugin parameters
func loadConfig() EnclaveConfig {
	config := EnclaveConfig{}
	var (
		hasCID        bool
		hasGatewayURL bool
		hasFilePath   bool
		hasRaw        bool
	)
	cid, ok := pdk.GetConfig("cid")
	if ok {
		hasCID = true
		config.CID = cid
	}
	gatewayURL, ok := pdk.GetConfig("gateway")
	if ok {
		hasGatewayURL = true
		config.GatewayURL = gatewayURL
	}
	filePath, ok := pdk.GetConfig("file")
	if ok {
		hasFilePath = true
		config.FilePath = filePath
	}
	raw, ok := pdk.GetConfig("raw")
	if ok {
		hasRaw = true
		if strings.ToLower(raw) == "true" {
			config.Raw = true
		} else {
			config.Raw = false
		}
	}
	if !hasCID || !hasGatewayURL || !hasFilePath || !hasRaw {
		logError(ErrMissingConfig)
		return config
	}
	return config
}

// Enclave operations

// fetchEnclave retrieves the enclave from storage
func fetchEnclave() (mpc.Enclave, error) {
	if getState() != EnclaveStateImported {
		return nil, ErrInvalidState
	}
	bz := pdk.GetVar(dataKey)
	if bz == nil {
		return nil, ErrInvalidState
	}
	e, err := mpc.ImportEnclave(mpc.WithEnclaveJSON(bz))
	if err != nil {
		return nil, err
	}
	return e, nil
}

// storeEnclave persists the enclave to storage
func storeEnclave(e mpc.Enclave) error {
	bz, err := e.Serialize()
	if err != nil {
		return err
	}
	pdk.SetVar(dataKey, bz)
	setState(EnclaveStateStored)
	return nil
}

// Exported WebAssembly functions

//go:wasmexport import
// importEnclave loads an enclave from its configured source
func importEnclave() int32 {
	config := loadConfig()
	bz, err := config.Resolve()
	if err != nil {
		logError(err)
		return 1
	}
	e, err := mpc.ImportEnclave(mpc.WithEnclaveJSON(bz))
	if err != nil {
		logError(err)
		return 1
	}
	storeEnclave(e)
	pdk.Log(pdk.LogInfo, "Enclave imported successfully")
	pdk.OutputJSON(e)
	return 0
}

//go:wasmexport sign
// sign uses the enclave to sign input data
func sign() int32 {
	req := SignRequest{}
	err := pdk.InputJSON(req)
	if err != nil {
		logError(err)
		return 1
	}

	e, err := fetchEnclave()
	if err != nil {
		logError(err)
		return 1
	}

	sig, err := e.Sign(req.Data)
	if err != nil {
		logError(err)
		return 1
	}
	pdk.Log(pdk.LogInfo, "Signature successful")
	pdk.OutputJSON(sig)
	return 0
}

//go:wasmexport verify
// verify checks if a signature is valid for the given data
func verify() int32 {
	req := VerifyRequest{}
	err := pdk.InputJSON(req)
	if err != nil {
		logError(err)
		return 1
	}
	e, err := fetchEnclave()
	if err != nil {
		logError(err)
		return 1
	}
	sig, err := e.Verify(req.Message, req.Signature)
	if err != nil {
		logError(err)
		return 1
	}
	if sig {
		logInfo("Signature verified successfully")
		return 0
	}
	logInfo("Signature verification failed")
	return -1
}

// Logging utilities

// logDebug logs a debug message
func logDebug(msg string) {
	pdk.Log(pdk.LogDebug, msg)
}

// logInfo logs an info message
func logInfo(msg string) {
	pdk.Log(pdk.LogInfo, msg)
}

// logError logs an error message
func logError(err error) {
	pdk.Log(pdk.LogError, err.Error())
}

// main is required but not used in WebAssembly modules
func main() {}
