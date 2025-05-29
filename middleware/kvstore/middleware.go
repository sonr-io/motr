//go:build js && wasm
// +build js,wasm

package kvstore

import (
	"errors"

	"github.com/labstack/echo/v4"
)

type Context interface {
	echo.Context
	Connection
}

// context is a database context
type context struct {
	echo.Context
	Connection
}

// Middleware is a middleware that adds a new key to the context
func Middleware() echo.MiddlewareFunc {
	conn := open()
	return func(next echo.HandlerFunc) echo.HandlerFunc {
		return func(c echo.Context) error {
			ctx := &context{
				Context:    c,
				Connection: conn,
			}
			return next(ctx)
		}
	}
}

// Unwrap unwraps the session context
func Unwrap(c echo.Context) (Context, error) {
	cc := c.(*context)
	if cc == nil {
		return nil, errors.New("failed to unwrap session context")
	}
	return cc, nil
}
