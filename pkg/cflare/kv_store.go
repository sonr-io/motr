//go:build js && wasm
// +build js,wasm

package cflare

import (
	"github.com/labstack/echo/v4"
	"github.com/syumai/workers/cloudflare/kv"
)

func KVHandles(c echo.Context) (*kv.Namespace, error) {
	ctx, err := unwrap(c)
	if err != nil {
		return nil, err
	}
	return kv.NewNamespace(ctx.Cloudflare.Handles)
}

func KVSessions(c echo.Context) (*kv.Namespace, error) {
	ctx, err := unwrap(c)
	if err != nil {
		return nil, err
	}
	return kv.NewNamespace(ctx.Cloudflare.Sessions)
}
