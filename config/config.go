//go:build js && wasm
// +build js,wasm

package config

import (
	"time"

	"github.com/syumai/workers/cloudflare"
)

type Config struct {
	Cache         CacheSettings `json:"cache"` // Added Cache configuration
	Sonr          NetworkParams `json:"network"`
	DefaultExpiry time.Duration `json:"expiry"`
}

type NetworkParams struct {
	SonrChainID string `json:"sonr_chain_id"`
	SonrAPIURL  string `json:"sonr_api_url"`
	SonrRPCURL  string `json:"sonr_rpc_url"`
	IPFSGateway string `json:"ipfs_gateway"`
}

// CacheSettings defines the configuration for Cloudflare cache
type CacheSettings struct {
	Enabled               bool     `json:"enabled"`
	DefaultMaxAge         int      `json:"default_max_age"`
	BypassHeader          string   `json:"bypass_header"`
	BypassValue           string   `json:"bypass_value"`
	CacheableStatusCodes  []int    `json:"cacheable_status_codes"`
	CacheableContentTypes []string `json:"cacheable_content_types"`
}

func Get() Config {
	cache := CacheSettings{
		Enabled:       true,
		DefaultMaxAge: 60, // 1 minute by default
		BypassHeader:  "X-Cache-Bypass",
		BypassValue:   "true",
		CacheableStatusCodes: []int{
			200, 301, 302,
		},
		CacheableContentTypes: []string{
			"text/html",
			"text/css",
			"text/javascript",
			"application/javascript",
			"application/json",
			"image/jpeg",
			"image/png",
			"image/gif",
			"image/webp",
		},
	}

	sonr := NetworkParams{
		SonrChainID: cloudflare.Getenv("SONR_CHAIN_ID"),
		SonrAPIURL:  cloudflare.Getenv("SONR_API_URL"),
		SonrRPCURL:  cloudflare.Getenv("SONR_RPC_URL"),
		IPFSGateway: cloudflare.Getenv("IPFS_GATEWAY"),
	}
	c := Config{
		Sonr:          sonr,
		Cache:         cache,
		DefaultExpiry: time.Hour * 1,
	}
	return c
}
