//go:build js && wasm
// +build js,wasm

package session

import (
	"errors"

	"github.com/labstack/echo/v4"
	"github.com/sonr-io/motr/config"
)

// Context is a session context
type Context struct {
	echo.Context
	Config config.NetworkParams `json:"network"`
}

// Middleware is a middleware that adds a new key to the context
func Middleware(cnfg config.NetworkParams) echo.MiddlewareFunc {
	return func(next echo.HandlerFunc) echo.HandlerFunc {
		return func(c echo.Context) error {
			ctx := Create(c, cnfg)
			return next(ctx)
		}
	}
}

// Create creates a new session
func Create(c echo.Context, cnfg config.NetworkParams) *Context {
	return &Context{
		Context: c,
		Config:  cnfg,
	}
}

// Unwrap unwraps the session context
func Unwrap(c echo.Context) (*Context, error) {
	cc := c.(*Context)
	if cc == nil {
		return nil, errors.New("failed to unwrap session context")
	}
	return cc, nil
}
