//go:build js && wasm
// +build js,wasm

package session

import (
	"errors"
	"time"

	"github.com/labstack/echo/v4"
	"github.com/sonr-io/motr/config"
)

type Context struct {
	echo.Context
	ID         string                  `json:"id"`
	Sonr       config.NetworkConfig    `json:"network"`
	Cloudflare config.CloudflareConfig `json:"cloudflare"`
	Expires    int64                   `json:"expires"`
}

// Middleware is a middleware that adds a new key to the context
func Middleware(cnfg config.Config) echo.MiddlewareFunc {
	return func(next echo.HandlerFunc) echo.HandlerFunc {
		return func(c echo.Context) error {
			ctx := Create(c, cnfg)
			return next(ctx)
		}
	}
}

// New creates a new session
func Create(c echo.Context, cnfg config.Config) *Context {
	id := determineID(c)
	return &Context{
		Context:    c,
		ID:         id,
		Cloudflare: cnfg.Cloudflare,
		Sonr:       cnfg.Sonr,
		Expires:    calculateTTL(time.Now()),
	}
}

func Unwrap(c echo.Context) (*Context, error) {
	cc := c.(*Context)
	if cc == nil {
		return nil, errors.New("failed to unwrap session context")
	}
	return cc, nil
}
