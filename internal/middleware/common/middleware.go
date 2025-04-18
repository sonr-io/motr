//go:build js && wasm
// +build js,wasm

package common

import (
	"github.com/labstack/echo/v4"
	"github.com/sonr-io/motr/config"
)

// UseMiddleware is a middleware that adds a new key to the context
func UseMiddleware(c config.SonrConfig) echo.MiddlewareFunc {
	return func(next echo.HandlerFunc) echo.HandlerFunc {
		return func(c echo.Context) error {
			return next(c)
		}
	}
}
