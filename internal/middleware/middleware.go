//go:build js && wasm
// +build js,wasm

package middleware

import (
	"github.com/labstack/echo/v4"
	"github.com/segmentio/ksuid"
	"github.com/sonr-io/motr/config"
)

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
