//go:build js && wasm
// +build js,wasm

package config

import "encoding/json"

// MotrConfig is the configuration for the Motr application assumed to be in the same directory as the dwn index
type MotrConfig struct {
	CID        string `json:"cid"`
	Address    string `json:"address"`
	GatewayURL string `json:"gateway_url"`
	APIURL     string `json:"api_url"`
	RPCURL     string `json:"rpc_url"`
	ChainID    string `json:"chain_id"`
	Version    string `json:"version"`
}

// LoardFromString loads the config from the given JSON string
func LoardFromString(configString string) (*MotrConfig, error) {
	var config MotrConfig
	err := json.Unmarshal([]byte(configString), &config)
	return &config, err
}
