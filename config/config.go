//go:build js && wasm
// +build js,wasm

package config

import (
	"time"

	"github.com/syumai/workers/cloudflare"
	_ "github.com/syumai/workers/cloudflare/d1"
)

type Config struct {
	Cache         CacheConfig      `json:"cache"` // Added Cache configuration
	Sonr          NetworkConfig    `json:"network"`
	Cloudflare    CloudflareConfig `json:"cloudflare"`
	DefaultExpiry time.Duration    `json:"expiry"`
}

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

func Get() Config {
	cache := CacheConfig{
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

	flare := CloudflareConfig{
		Database: "DB",
		Sessions: "SESSIONS",
		Handles:  "HANDLES",
	}

	sonr := NetworkConfig{
		SonrChainID: cloudflare.Getenv("SONR_CHAIN_ID"),
		SonrAPIURL:  cloudflare.Getenv("SONR_API_URL"),
		SonrRPCURL:  cloudflare.Getenv("SONR_RPC_URL"),
		IPFSGateway: cloudflare.Getenv("IPFS_GATEWAY"),
	}

	c := Config{
		Sonr:          sonr,
		Cache:         cache,
		Cloudflare:    flare,
		DefaultExpiry: time.Hour * 1,
	}
	return c
}
