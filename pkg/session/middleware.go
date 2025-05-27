//go:build js && wasm
// +build js,wasm

package session

import (
	"time"

	"github.com/labstack/echo/v4"
	"github.com/sonr-io/motr/config"
)

// Middleware is a middleware that adds a new key to the context
func Middleware(cnfg config.Config) echo.MiddlewareFunc {
	return func(next echo.HandlerFunc) echo.HandlerFunc {
		return func(c echo.Context) error {
			id := FindOrAssignID(c)
			ctx := &Context{
				Context: c,
				ID:      id,
				Status: &Session{
					ID:      id,
					Expires: GetTTL(time.Now()),
					Status:  "default",
					Handle:  "",
				},
			}
			return next(ctx)
		}
	}
}

func Unwrap(c echo.Context) *Context {
	cc := c.(*Context)
	if cc == nil {
		panic("Session Context not found")
	}
	return cc
}
