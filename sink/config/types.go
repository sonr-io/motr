//go:build js && wasm
// +build js,wasm

package config

import (
	_ "github.com/syumai/workers/cloudflare/d1"
)

type CloudflareConfig struct {
	Database string `json:"database"`
	Sessions string `json:"sessions"`
	Handles  string `json:"handles"`
}

type NetworkConfig struct {
	SonrChainID string `json:"sonr_chain_id"`
	SonrAPIURL  string `json:"sonr_api_url"`
	SonrRPCURL  string `json:"sonr_rpc_url"`
	IPFSGateway string `json:"ipfs_gateway"`
}

// CacheConfig defines the configuration for Cloudflare cache
type CacheConfig struct {
	Enabled               bool     `json:"enabled"`
	DefaultMaxAge         int      `json:"default_max_age"`
	BypassHeader          string   `json:"bypass_header"`
	BypassValue           string   `json:"bypass_value"`
	CacheableStatusCodes  []int    `json:"cacheable_status_codes"`
	CacheableContentTypes []string `json:"cacheable_content_types"`
}
