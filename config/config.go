//go:build js && wasm
// +build js,wasm

package config

import (
	"database/sql"
	"strconv"

	"github.com/sonr-io/motr/sink/models"
	"github.com/syumai/workers/cloudflare"
	_ "github.com/syumai/workers/cloudflare/d1"
	"github.com/syumai/workers/cloudflare/kv"
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
	Sonr       SonrConfig  `json:"sonr"`
	IPFS       IPFSConfig  `json:"ipfs"`
	Mode       MotrMode    `json:"mode"`
	DB         DBConfig    `json:"db"`
	Cache      CacheConfig `json:"cache"`    // Added Cache configuration
	KVSessions string      `json:"sessions"` // Added KV configuration
	KVHandles  string      `json:"handles"`  // Added KV configuration
}

func getConfig() Config {
	c := Config{
		Sonr:       getSonrConfig(),
		IPFS:       getIPFSConfig(),
		Mode:       getMotrMode(),
		DB:         getDBConfig(),
		Cache:      getCacheConfig(), // Added Cache configuration
		KVSessions: "SESSIONS",
		KVHandles:  "HANDLES",
	}
	return c
}

func (c Config) GetSessionsKV() (*kv.Namespace, error) {
	return kv.NewNamespace(c.KVSessions)
}

func (c Config) GetHandlesKV() (*kv.Namespace, error) {
	return kv.NewNamespace(c.KVHandles)
}

type SonrConfig struct {
	ChainID string `json:"chain_id"`
	APIURL  string `json:"api_url"`
	RPCURL  string `json:"rpc_url"`
}

func getSonrConfig() SonrConfig {
	return SonrConfig{
		ChainID: cloudflare.Getenv("SONR_CHAIN_ID"),
		APIURL:  cloudflare.Getenv("SONR_API_URL"),
		RPCURL:  cloudflare.Getenv("SONR_RPC_URL"),
	}
}

type IPFSConfig struct {
	GatewayURL string `json:"gateway_url"`
}

func getIPFSConfig() IPFSConfig {
	return IPFSConfig{
		GatewayURL: cloudflare.Getenv("IPFS_GATEWAY"),
	}
}

func getMotrMode() MotrMode {
	mode := cloudflare.Getenv("MOTR_MODE")
	if mode == "" {
		return ControllerMode
	}
	return MotrMode(mode)
}

type DBConfig struct {
	DBName string `json:"common_db_name"`
}

func getDBConfig() DBConfig {
	return DBConfig{
		DBName: "DB",
	}
}

func (c DBConfig) GetCommon() (*sql.DB, error) {
	return sql.Open("d1", c.DBName)
}

func (c DBConfig) GetQuerier() (models.Querier, error) {
	db, err := c.GetCommon()
	if err != nil {
		return nil, err
	}
	return models.New(db), nil
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

func getCacheConfig() CacheConfig {
	// Default values
	config := CacheConfig{
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

	// Override with environment variables if provided
	if enabled := cloudflare.Getenv("CACHE_ENABLED"); enabled != "" {
		config.Enabled = enabled == "true"
	}

	if maxAge := cloudflare.Getenv("CACHE_DEFAULT_MAX_AGE"); maxAge != "" {
		// Parse the string to int, defaulting to 60 if parsing fails
		if parsed, err := strconv.Atoi(maxAge); err == nil {
			config.DefaultMaxAge = parsed
		}
	}

	if bypassHeader := cloudflare.Getenv("CACHE_BYPASS_HEADER"); bypassHeader != "" {
		config.BypassHeader = bypassHeader
	}

	if bypassValue := cloudflare.Getenv("CACHE_BYPASS_VALUE"); bypassValue != "" {
		config.BypassValue = bypassValue
	}

	return config
}
