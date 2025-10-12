//go:build wasm

package main

import (
	"fmt"

	"github.com/extism/go-pdk"
)

type NewOriginTokenRequest struct {
	AudienceDID  string           `json:"audience_did"`
	Attenuations []map[string]any `json:"attenuations,omitempty"`
	Facts        []string         `json:"facts,omitempty"`
	NotBefore    int64            `json:"not_before,omitempty"`
	ExpiresAt    int64            `json:"expires_at,omitempty"`
}

type NewAttenuatedTokenRequest struct {
	ParentToken  string           `json:"parent_token"`
	AudienceDID  string           `json:"audience_did"`
	Attenuations []map[string]any `json:"attenuations,omitempty"`
	Facts        []string         `json:"facts,omitempty"`
	NotBefore    int64            `json:"not_before,omitempty"`
	ExpiresAt    int64            `json:"expires_at,omitempty"`
}

type UCANTokenResponse struct {
	Token   string `json:"token"`
	Issuer  string `json:"issuer"`
	Address string `json:"address"`
	Error   string `json:"error,omitempty"`
}

type SignDataRequest struct {
	Data []byte `json:"data"`
}

type SignDataResponse struct {
	Signature []byte `json:"signature"`
	Error     string `json:"error,omitempty"`
}

type VerifyDataRequest struct {
	Data      []byte `json:"data"`
	Signature []byte `json:"signature"`
}

type VerifyDataResponse struct {
	Valid bool   `json:"valid"`
	Error string `json:"error,omitempty"`
}

type GetIssuerDIDResponse struct {
	IssuerDID string `json:"issuer_did"`
	Address   string `json:"address"`
	ChainCode string `json:"chain_code"`
	Error     string `json:"error,omitempty"`
}

var svc *EnclaveService

func main() {
	var err error
	svc, err = NewEnclaveService()
	if err != nil {
		pdk.SetError(fmt.Errorf("failed to initialize enclave service: %w", err))
		return
	}
	pdk.Log(pdk.LogInfo, "Motor plugin initialized as MPC-based UCAN source")
	newAttenuatedToken()
	newOriginToken()
	signData()
	verifyData()
	getIssuerDID()
}

//go:wasmexport new_origin_token
func newOriginToken() int32 {
	req := &NewOriginTokenRequest{}
	if err := pdk.InputJSON(req); err != nil {
		pdk.SetError(fmt.Errorf("failed to parse request: %w", err))
		return 1
	}

	resp := handleNewOriginToken(svc, req)
	pdk.OutputJSON(resp)

	if resp.Error != "" {
		return 1
	}
	return 0
}

//go:wasmexport new_attenuated_token
func newAttenuatedToken() int32 {
	req := &NewAttenuatedTokenRequest{}
	if err := pdk.InputJSON(req); err != nil {
		pdk.SetError(fmt.Errorf("failed to parse request: %w", err))
		return 1
	}

	resp := handleNewAttenuatedToken(svc, req)
	pdk.OutputJSON(resp)

	if resp.Error != "" {
		return 1
	}
	return 0
}

//go:wasmexport sign_data
func signData() int32 {
	req := &SignDataRequest{}
	if err := pdk.InputJSON(req); err != nil {
		pdk.SetError(fmt.Errorf("failed to parse request: %w", err))
		return 1
	}

	resp := handleSignData(svc, req)
	pdk.OutputJSON(resp)

	if resp.Error != "" {
		return 1
	}
	return 0
}

//go:wasmexport verify_data
func verifyData() int32 {
	req := &VerifyDataRequest{}
	if err := pdk.InputJSON(req); err != nil {
		pdk.SetError(fmt.Errorf("failed to parse request: %w", err))
		return 1
	}

	resp := handleVerifyData(svc, req)
	pdk.OutputJSON(resp)

	if resp.Error != "" {
		return 1
	}
	return 0
}

//go:wasmexport get_issuer_did
func getIssuerDID() int32 {
	resp := handleGetIssuerDID(svc)
	pdk.OutputJSON(resp)

	if resp.Error != "" {
		return 1
	}
	return 0
}
