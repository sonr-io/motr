package main

import (
	"github.com/extism/go-pdk"
	"github.com/sonr-io/crypto/mpc"
)

type SignRequest struct {
	Message []byte `json:"message"`
	Enclave []byte `json:"enclave"`
}

type SignResponse struct {
	Signature []byte `json:"signature"`
}

func main() {}

//go:wasmexport sign
func sign() int32 {
	req := SignRequest{}
	err := pdk.InputJSON(req)
	if err != nil {
		pdk.Log(pdk.LogError, err.Error())
		return 1
	}
	e, err := mpc.ImportEnclave(mpc.WithEnclaveJSON(req.Enclave))
	if err != nil {
		pdk.Log(pdk.LogError, err.Error())
		return 1
	}
	sig, err := e.Sign(req.Message)
	if err != nil {
		pdk.Log(pdk.LogError, err.Error())
		return 1
	}
	pdk.Log(pdk.LogInfo, "Signature successful")
	sigJSON := SignResponse{Signature: sig}
	pdk.OutputJSON(sigJSON)
	return 0
}
