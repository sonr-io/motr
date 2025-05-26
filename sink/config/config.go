//go:build js && wasm
// +build js,wasm

package config

import (
	"time"

	"github.com/syumai/workers/cloudflare"
	_ "github.com/syumai/workers/cloudflare/d1"
)

var (
	Sonr       NetworkConfig
	Cache      CacheConfig
	Cloudflare CloudflareConfig
)

type Config struct {
	Cache         CacheConfig      `json:"cache"` // Added Cache configuration
	Sonr          NetworkConfig    `json:"network"`
	Cloudflare    CloudflareConfig `json:"cloudflare"`
	DefaultExpiry time.Duration    `json:"expiry"`
}

func init() {
	Cache = CacheConfig{
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

	Cloudflare = CloudflareConfig{
		Database: "DB",
		Sessions: "SESSIONS",
		Handles:  "HANDLES",
	}

	Sonr = NetworkConfig{
		SonrChainID: cloudflare.Getenv("SONR_CHAIN_ID"),
		SonrAPIURL:  cloudflare.Getenv("SONR_API_URL"),
		SonrRPCURL:  cloudflare.Getenv("SONR_RPC_URL"),
		IPFSGateway: cloudflare.Getenv("IPFS_GATEWAY"),
	}
}

func Get() Config {
	c := Config{
		Sonr:          Sonr,
		Cache:         Cache,
		Cloudflare:    Cloudflare,
		DefaultExpiry: time.Hour * 1, // 1 hour by default
	}
	return c
}
