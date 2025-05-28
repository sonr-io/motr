//go:build js && wasm
// +build js,wasm

package kvstore

import (
	"github.com/labstack/echo/v4"
	"github.com/sonr-io/motr/config"
	"github.com/syumai/workers/cloudflare/kv"
)

// Context is a database context
type Context struct {
	echo.Context
	Config config.CloudflareConfig `json:"cloudflare"`
}

func HandlesConn(c echo.Context) (*kv.Namespace, error) {
	ctx, err := Unwrap(c)
	if err != nil {
		return nil, err
	}
	return kv.NewNamespace(ctx.Config.Handles)
}

func SessionsConn(c echo.Context) (*kv.Namespace, error) {
	ctx, err := Unwrap(c)
	if err != nil {
		return nil, err
	}
	return kv.NewNamespace(ctx.Config.Sessions)
}
