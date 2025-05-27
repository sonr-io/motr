//go:build js && wasm
// +build js,wasm

package kv

import (
	"github.com/sonr-io/motr/config"
	"github.com/syumai/workers/cloudflare/kv"
)

func GetSessions(c config.CloudflareConfig) (*kv.Namespace, error) {
	return kv.NewNamespace(c.Sessions)
}

func GetHandles(c config.CloudflareConfig) (*kv.Namespace, error) {
	return kv.NewNamespace(c.Handles)
}
