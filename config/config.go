//go:build js && wasm
// +build js,wasm

package config

import (
	"database/sql"
	"time"

	"github.com/sonr-io/motr/pkg/models"
	"github.com/syumai/workers/cloudflare"
	_ "github.com/syumai/workers/cloudflare/d1"
	"github.com/syumai/workers/cloudflare/kv"
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

func (c CloudflareConfig) GetCommon() (*sql.DB, error) {
	return sql.Open("d1", c.Database)
}

func (c CloudflareConfig) GetQuerier() (models.Querier, error) {
	db, err := c.GetCommon()
	if err != nil {
		return nil, err
	}
	return models.New(db), nil
}

func (c CloudflareConfig) GetSessions() (*kv.Namespace, error) {
	return kv.NewNamespace(c.Sessions)
}

func (c CloudflareConfig) GetHandles() (*kv.Namespace, error) {
	return kv.NewNamespace(c.Handles)
}
