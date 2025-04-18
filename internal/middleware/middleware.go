//go:build js && wasm
// +build js,wasm

package middleware

import (
	"github.com/labstack/echo/v4"
	"github.com/segmentio/ksuid"
	"github.com/sonr-io/motr/config"
	"github.com/sonr-io/motr/internal/database"
	"github.com/sonr-io/motr/sink/models/common"
)

// UseAllDBs adds all database controllers to the session context
func UseAllDBs(c config.DBConfig) echo.MiddlewareFunc {
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
			
			// Create full controller
			fullController, err := database.NewFullController(c)
			if err != nil {
				return err
			}
			
			// Set all controllers
			sc.controller = fullController
			sc.resolverController = fullController
			sc.vaultController = fullController
			
			return next(ctx)
		}
	}
}

// UseConfig is a middleware that adds a new key to the context
func UseConfig(c config.Config) echo.MiddlewareFunc {
	return func(next echo.HandlerFunc) echo.HandlerFunc {
		return func(c echo.Context) error {
			ctx := &SessionContext{
				Context: c,
				ID:      getOrCreateSessionID(c),
			}
			c.Set("session", ctx)
			return next(c)
		}
	}
}

func getOrCreateSessionID(c echo.Context) string {
	if ok := CookieExists(c, SessionID); !ok {
		sessionID := ksuid.New().String()
		WriteCookie(c, SessionID, sessionID)
		c.Echo().Logger.Debug("Wrote session ID to cookie")
		return sessionID
	}
	c.Echo().Logger.Debug("Has session ID in cookie")
	sessionID, err := ReadCookie(c, SessionID)
	if err != nil {
		sessionID = ksuid.New().String()
		WriteCookie(c, SessionID, sessionID)
		c.Echo().Logger.Debug("Failed to read session ID from cookie, wrote new one")
	}
	return sessionID
}

// UseCommonDB adds a Controller reference to the session context
func UseCommonDB(c config.DBConfig) echo.MiddlewareFunc {
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
			cdb, err := c.GetCommon()
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

// UseResolverDB adds a ResolverController reference to the session context
func UseResolverDB(c config.DBConfig) echo.MiddlewareFunc {
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
			
			// Create resolver controller
			resolverController, err := database.NewResolverController(c)
			if err != nil {
				return err
			}
			
			sc.resolverController = resolverController
			return next(ctx)
		}
	}
}

// UseVaultDB adds a VaultController reference to the session context
func UseVaultDB(c config.DBConfig) echo.MiddlewareFunc {
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
			vaultController, err := database.NewVaultController(c)
			if err != nil {
				return err
			}
			
			sc.vaultController = vaultController
			return next(ctx)
		}
	}
}
