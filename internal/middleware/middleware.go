//go:build js && wasm
// +build js,wasm

package middleware

import (
	"github.com/labstack/echo/v4"
	"github.com/sonr-io/motr/config"
	"github.com/sonr-io/motr/internal/database"
	"github.com/sonr-io/motr/sink/models/common"
)

// UseSession is a middleware that adds a new key to the context
func UseSession(c config.Config) echo.MiddlewareFunc {
	return func(next echo.HandlerFunc) echo.HandlerFunc {
		return func(c echo.Context) error {
			ctx := NewSession(c)
			c.Set("session", ctx)
			return next(c)
		}
	}
}

// DBCommon adds a Controller reference to the session context
func DBCommon(c config.Config) echo.MiddlewareFunc {
	return func(next echo.HandlerFunc) echo.HandlerFunc {
		return func(ctx echo.Context) error {
			// Try to get session context
			sc, ok := ctx.Get("session").(*SessionContext)
			if !ok {
				// Create a new session context
				sc = &SessionContext{
					Context: ctx,
					ID:      getOrCreateSessionID(ctx),
				}
				ctx.Set("session", sc)
			}

			// Create common database connection
			cdb, err := c.DB.GetCommon()
			if err != nil {
				return err
			}

			// Create controller with common database
			sc.controller = &database.ControllerImpl{
				CommonDB: common.New(cdb),
			}

			return next(ctx)
		}
	}
}

// DBVault adds a VaultController reference to the session context
func DBVault(c config.Config) echo.MiddlewareFunc {
	return func(next echo.HandlerFunc) echo.HandlerFunc {
		return func(ctx echo.Context) error {
			// Try to get session context
			sc, ok := ctx.Get("session").(*SessionContext)
			if !ok {
				// Create a new session context
				sc = &SessionContext{
					Context: ctx,
					ID:      getOrCreateSessionID(ctx),
				}
				ctx.Set("session", sc)
			}

			// Create vault controller
			vaultController, err := database.NewVaultController(c.DB)
			if err != nil {
				return err
			}

			sc.vaultController = vaultController
			return next(ctx)
		}
	}
}
