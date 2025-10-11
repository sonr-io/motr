//go:build wasm

package main

import (
	"crypto/sha256"
	"encoding/json"
	"fmt"
	"time"

	"github.com/extism/go-pdk"
	"github.com/golang-jwt/jwt/v5"
	"github.com/sonr-io/crypto/mpc"
)

const (
	KeyChainID       = "chain_id"
	KeyEnclave       = "enclave"
	KeyEnclaveConfig = "vault_config"
)

type EnclaveService struct {
	enclave   mpc.Enclave
	issuerDID string
	address   string
	chainID   string
}

func NewEnclaveService() (*EnclaveService, error) {
	svc := &EnclaveService{}

	chainID := pdk.GetVar(KeyChainID)
	if chainID == nil {
		svc.chainID = "sonr-testnet-1"
	} else {
		svc.chainID = string(chainID)
	}

	enclaveData, err := svc.loadEnclaveData()
	if err != nil {
		return nil, fmt.Errorf("failed to load enclave data: %w", err)
	}

	svc.enclave, err = mpc.ImportEnclave(mpc.WithEnclaveData(enclaveData))
	if err != nil {
		return nil, fmt.Errorf("failed to import enclave: %w", err)
	}

	pubKeyBytes := svc.enclave.PubKeyBytes()
	svc.issuerDID, svc.address, err = svc.deriveIssuerDID(pubKeyBytes)
	if err != nil {
		return nil, fmt.Errorf("failed to derive issuer DID: %w", err)
	}

	pdk.Log(pdk.LogInfo, fmt.Sprintf("EnclaveService initialized: DID=%s, Address=%s", svc.issuerDID, svc.address))
	return svc, nil
}

func (s *EnclaveService) loadEnclaveData() (*mpc.EnclaveData, error) {
	v := pdk.GetVar(KeyEnclave)
	if v == nil {
		return nil, fmt.Errorf("enclave data not provided in environment")
	}

	var data mpc.EnclaveData
	if err := json.Unmarshal(v, &data); err != nil {
		return nil, fmt.Errorf("failed to unmarshal enclave data: %w", err)
	}

	return &data, nil
}

func (s *EnclaveService) GetConfig() map[string]any {
	v := pdk.GetVar(KeyEnclaveConfig)
	if v == nil {
		return make(map[string]any)
	}

	var config map[string]any
	if err := json.Unmarshal(v, &config); err != nil {
		pdk.Log(pdk.LogWarn, fmt.Sprintf("Failed to parse vault config: %v", err))
		return make(map[string]any)
	}

	return config
}

func (s *EnclaveService) IsValid() bool {
	return s.enclave.IsValid()
}

func (s *EnclaveService) GetIssuerDID() string {
	return s.issuerDID
}

func (s *EnclaveService) GetAddress() string {
	return s.address
}

func (s *EnclaveService) GetChainID() string {
	return s.chainID
}

func (s *EnclaveService) Sign(data []byte) ([]byte, error) {
	if !s.enclave.IsValid() {
		return nil, fmt.Errorf("enclave is not valid")
	}
	return s.enclave.Sign(data)
}

func (s *EnclaveService) Verify(data, signature []byte) (bool, error) {
	if !s.enclave.IsValid() {
		return false, fmt.Errorf("enclave is not valid")
	}
	return s.enclave.Verify(data, signature)
}

func (s *EnclaveService) GetChainCode() ([]byte, error) {
	if !s.enclave.IsValid() {
		return nil, fmt.Errorf("enclave is not valid")
	}

	sig, err := s.enclave.Sign([]byte(s.address))
	if err != nil {
		return nil, fmt.Errorf("failed to sign address for chain code: %w", err)
	}

	hasher := sha256.New()
	hasher.Write(sig)
	hash := hasher.Sum(nil)

	return hash[:32], nil
}

func (s *EnclaveService) CreateUCANToken(
	audienceDID string,
	proofs []string,
	attenuations []map[string]any,
	facts []string,
	notBefore, expiresAt time.Time,
) (string, error) {
	if !s.enclave.IsValid() {
		return "", fmt.Errorf("enclave is not valid")
	}

	if audienceDID == "" {
		return "", fmt.Errorf("audience DID is required")
	}

	signingMethod := &MPCSigningMethod{
		Name:    "MPC256",
		enclave: s.enclave,
	}

	token := jwt.New(signingMethod)
	token.Header["ucv"] = "0.9.0"

	var nbfUnix, expUnix int64
	if !notBefore.IsZero() {
		nbfUnix = notBefore.Unix()
	}
	if !expiresAt.IsZero() {
		expUnix = expiresAt.Unix()
	}

	claims := jwt.MapClaims{
		"iss": s.issuerDID,
		"aud": audienceDID,
	}

	if len(attenuations) > 0 {
		claims["att"] = attenuations
	}

	if len(proofs) > 0 {
		claims["prf"] = proofs
	}

	if len(facts) > 0 {
		claims["fct"] = facts
	}

	if nbfUnix > 0 {
		claims["nbf"] = nbfUnix
	}
	if expUnix > 0 {
		claims["exp"] = expUnix
	}

	token.Claims = claims

	tokenString, err := token.SignedString(nil)
	if err != nil {
		return "", fmt.Errorf("failed to sign token with MPC: %w", err)
	}

	return tokenString, nil
}

func (s *EnclaveService) deriveIssuerDID(pubKeyBytes []byte) (string, string, error) {
	if len(pubKeyBytes) == 0 {
		return "", "", fmt.Errorf("empty public key bytes")
	}

	address := fmt.Sprintf("sonr1%x", pubKeyBytes[:20])
	issuerDID := fmt.Sprintf("did:sonr:%s", address)

	return issuerDID, address, nil
}

type MPCSigningMethod struct {
	Name    string
	enclave mpc.Enclave
}

func (m *MPCSigningMethod) Alg() string {
	return m.Name
}

func (m *MPCSigningMethod) Sign(signingString string, key any) ([]byte, error) {
	hasher := sha256.New()
	hasher.Write([]byte(signingString))
	digest := hasher.Sum(nil)

	sig, err := m.enclave.Sign(digest)
	if err != nil {
		return nil, fmt.Errorf("failed to sign with MPC: %w", err)
	}

	return sig, nil
}

func (m *MPCSigningMethod) Verify(signingString string, sig []byte, key any) error {
	hasher := sha256.New()
	hasher.Write([]byte(signingString))
	digest := hasher.Sum(nil)

	valid, err := m.enclave.Verify(digest, sig)
	if err != nil {
		return fmt.Errorf("failed to verify signature: %w", err)
	}

	if !valid {
		return fmt.Errorf("signature verification failed")
	}

	return nil
}
