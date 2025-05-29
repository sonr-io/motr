//go:build js && wasm
// +build js,wasm

package webauthn

import (
	"errors"

	"github.com/labstack/echo/v4"
)

type Context struct {
	echo.Context
}

// Middleware is a middleware that adds a new key to the context
func Middleware() echo.MiddlewareFunc {
	return func(next echo.HandlerFunc) echo.HandlerFunc {
		return func(c echo.Context) error {
			ctx := &Context{
				Context: c,
			}
			return next(ctx)
		}
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
