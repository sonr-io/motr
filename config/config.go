//go:build js && wasm
// +build js,wasm

package config

import (
	"database/sql"

	"github.com/syumai/workers/cloudflare"
)

type MotrMode string

const (
	ControllerMode MotrMode = "controller"
	ResolverMode   MotrMode = "resolver"
)

func (m MotrMode) String() string {
	return string(m)
}

type Config struct {
	Sonr SonrConfig `json:"sonr"`
	IPFS IPFSConfig `json:"ipfs"`
	Mode MotrMode   `json:"mode"`
	DB   DBConfig   `json:"db"`
}

func GetConfig() Config {
	c := Config{
		Sonr: GetSonrConfig(),
		IPFS: GetIPFSConfig(),
		Mode: GetMotrMode(),
		DB:   GetDBConfig(),
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

func GetMotrMode() MotrMode {
	mode := cloudflare.Getenv("MOTR_MODE")
	if mode == "" {
		return ControllerMode
	}
	return MotrMode(mode)
}

type DBConfig struct {
	CommonDBName   string `json:"common_db_name"`
	ResolverDBName string `json:"resolver_db_name"`
	VaultDBName    string `json:"vault_db_name"`
}

func GetDBConfig() DBConfig {
	return DBConfig{
		CommonDBName:   "COMMON_DB",
		ResolverDBName: "RESOLVER_DB",
		VaultDBName:    "CONTROLLER_DB",
	}
}

func (c DBConfig) GetCommon() (*sql.DB, error) {
	return sql.Open("d1", c.CommonDBName)
}

func (c DBConfig) GetResolver() (*sql.DB, error) {
	return sql.Open("d1", c.ResolverDBName)
}

func (c DBConfig) GetVault() (*sql.DB, error) {
	return sql.Open("d1", c.VaultDBName)
}
