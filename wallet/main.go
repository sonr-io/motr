package main

import (
	"github.com/extism/go-pdk"
	"github.com/sonr-io/crypto/mpc"
	"github.com/sonr-io/crypto/random"
)

const (
	nonceSize = 32
)

var nonce []byte

//go:wasmexport new_enclave
func newEnclave() int32 {
	if len(nonce) == 0 {
		nonce = random.GenerateNonce()
		pdk.Log(pdk.LogInfo, "Generated nonce")
	}
	input := pdk.Input()
	e, err := mpc.GenEnclave(nonce)
	if err != nil {
		pdk.Log(pdk.LogError, err.Error())
		return 1
	}
	pdk.Log(pdk.LogInfo, "Enclave created")
	bz, err := e.Export(input)
	if err != nil {
		pdk.Log(pdk.LogError, err.Error())
		return 1
	}
	pdk.Log(pdk.LogInfo, "Enclave export successful")
	pdk.OutputJSON(bz)
	return 0
}
