//go:build js && wasm
// +build js,wasm

package config

import "github.com/syumai/workers/cloudflare"

type Config struct {
	Sonr SonrConfig `json:"sonr"`
	IPFS IPFSConfig `json:"ipfs"`
	DB   DBConfig   `json:"db"`
}

func GetConfig() Config {
	c := Config{
		Sonr: GetSonrConfig(),
		IPFS: GetIPFSConfig(),
		DB:   connectDBs(),
	}
	return c
}

type SonrConfig struct {
	ChainID string `json:"chain_id"`
	APIURL  string `json:"api_url"`
	RPCURL  string `json:"rpc_url"`
}

func GetSonrConfig() SonrConfig {
	return SonrConfig{
		ChainID: cloudflare.Getenv("SONR_CHAIN_ID"),
		APIURL:  cloudflare.Getenv("SONR_API_URL"),
		RPCURL:  cloudflare.Getenv("SONR_RPC_URL"),
	}
}

type IPFSConfig struct {
	GatewayURL string `json:"gateway_url"`
}

func GetIPFSConfig() IPFSConfig {
	return IPFSConfig{
		GatewayURL: cloudflare.Getenv("IPFS_GATEWAY"),
	}
}
