//go:build js && wasm
// +build js,wasm

package shared

import (
	"github.com/labstack/echo/v4"
	"github.com/segmentio/ksuid"
)

// FindOrCreateSessionID returns the session ID from the cookie or creates a new one if it doesn't exist
func FindOrCreateSessionID(c echo.Context) string {
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
