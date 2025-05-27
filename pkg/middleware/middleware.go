//go:build js && wasm
// +build js,wasm

package middleware

import (
	"time"

	"github.com/labstack/echo/v4"
	"github.com/sonr-io/motr/config"
	"github.com/sonr-io/motr/pkg/session"
)

// UseSession is a middleware that adds a new key to the context
func UseSession(cnfg config.Config) echo.MiddlewareFunc {
	return func(next echo.HandlerFunc) echo.HandlerFunc {
		return func(c echo.Context) error {
			id := session.FindOrAssignID(c)
			ctx := &session.Context{
				Context: c,
				ID:      id,
				Status: &session.Session{
					ID:      id,
					Expires: session.GetTTL(time.Now()),
					Status:  "default",
					Handle:  "",
				},
			}
			return next(ctx)
		}
	}
}
