//go:build wasm

package main

import (
	"time"
)

func handleNewOriginToken(svc *EnclaveService, req *NewOriginTokenRequest) *UCANTokenResponse {
	if !svc.IsValid() {
		return &UCANTokenResponse{Error: "enclave not initialized"}
	}

	var notBefore, expiresAt time.Time
	if req.NotBefore > 0 {
		notBefore = time.Unix(req.NotBefore, 0)
	}
	if req.ExpiresAt > 0 {
		expiresAt = time.Unix(req.ExpiresAt, 0)
	}

	tokenString, err := svc.CreateUCANToken(
		req.AudienceDID,
		nil,
		req.Attenuations,
		req.Facts,
		notBefore,
		expiresAt,
	)
	if err != nil {
		return &UCANTokenResponse{Error: err.Error()}
	}

	return &UCANTokenResponse{
		Token:   tokenString,
		Issuer:  svc.GetIssuerDID(),
		Address: svc.GetAddress(),
	}
}

func handleNewAttenuatedToken(svc *EnclaveService, req *NewAttenuatedTokenRequest) *UCANTokenResponse {
	if !svc.IsValid() {
		return &UCANTokenResponse{Error: "enclave not initialized"}
	}

	var notBefore, expiresAt time.Time
	if req.NotBefore > 0 {
		notBefore = time.Unix(req.NotBefore, 0)
	}
	if req.ExpiresAt > 0 {
		expiresAt = time.Unix(req.ExpiresAt, 0)
	}

	proofs := []string{req.ParentToken}

	tokenString, err := svc.CreateUCANToken(
		req.AudienceDID,
		proofs,
		req.Attenuations,
		req.Facts,
		notBefore,
		expiresAt,
	)
	if err != nil {
		return &UCANTokenResponse{Error: err.Error()}
	}

	return &UCANTokenResponse{
		Token:   tokenString,
		Issuer:  svc.GetIssuerDID(),
		Address: svc.GetAddress(),
	}
}

func handleSignData(svc *EnclaveService, req *SignDataRequest) *SignDataResponse {
	if !svc.IsValid() {
		return &SignDataResponse{Error: "enclave not initialized"}
	}

	signature, err := svc.Sign(req.Data)
	if err != nil {
		return &SignDataResponse{Error: err.Error()}
	}

	return &SignDataResponse{Signature: signature}
}

func handleVerifyData(svc *EnclaveService, req *VerifyDataRequest) *VerifyDataResponse {
	if !svc.IsValid() {
		return &VerifyDataResponse{Error: "enclave not initialized"}
	}

	valid, err := svc.Verify(req.Data, req.Signature)
	if err != nil {
		return &VerifyDataResponse{Error: err.Error()}
	}

	return &VerifyDataResponse{Valid: valid}
}

func handleGetIssuerDID(svc *EnclaveService) *GetIssuerDIDResponse {
	if !svc.IsValid() {
		return &GetIssuerDIDResponse{Error: "enclave not initialized"}
	}

	chainCode, err := svc.GetChainCode()
	if err != nil {
		return &GetIssuerDIDResponse{Error: err.Error()}
	}

	return &GetIssuerDIDResponse{
		IssuerDID: svc.GetIssuerDID(),
		Address:   svc.GetAddress(),
		ChainCode: string(chainCode),
	}
}
