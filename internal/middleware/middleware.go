//go:build js && wasm
// +build js,wasm

package middleware

import (
	"time"

	"github.com/labstack/echo/v4"
	"github.com/sonr-io/motr/internal/shared/current"
	"github.com/sonr-io/motr/sink/config"
)

// UseSession is a middleware that adds a new key to the context
func UseSession(cnfg config.Config) echo.MiddlewareFunc {
	q, err := cnfg.DB.GetQuerier()
	if err != nil {
		return nil
	}
	hkv, err := cnfg.KV.GetHandles()
	if err != nil {
		return nil
	}
	skv, err := cnfg.KV.GetSessions()
	if err != nil {
		return nil
	}
	return func(next echo.HandlerFunc) echo.HandlerFunc {
		return func(c echo.Context) error {
			id := current.FindOrCreateSessionID(c)
			ctx := &SessionContext{
				Context:  c,
				ID:       id,
				Config:   cnfg,
				DB:       q,
				Handles:  hkv,
				Sessions: skv,
				Status: &current.Status{
					SessionID: id,
					Expires:   cnfg.KV.GetSessionExpiry(time.Now()),
					Status:    "default",
					Handle:    "",
				},
			}
			return next(ctx)
		}
	}
}
