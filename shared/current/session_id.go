//go:build js && wasm
// +build js,wasm

package current

import (
	"github.com/labstack/echo/v4"
	"github.com/segmentio/ksuid"
	"github.com/sonr-io/motr/shared/cookies"
)

// FindOrCreateSessionID returns the session ID from the cookie or creates a new one if it doesn't exist
func FindOrCreateSessionID(c echo.Context) string {
	if ok := cookies.Exists(c, cookies.SessionID); !ok {
		sessionID := ksuid.New().String()
		cookies.Write(c, cookies.SessionID, sessionID)
		c.Echo().Logger.Debug("Wrote session ID to cookie")
		return sessionID
	}
	c.Echo().Logger.Debug("Has session ID in cookie")
	sessionID, err := cookies.Read(c, cookies.SessionID)
	if err != nil {
		sessionID = ksuid.New().String()
		cookies.Write(c, cookies.SessionID, sessionID)
		c.Echo().Logger.Debug("Failed to read session ID from cookie, wrote new one")
	}
	return sessionID
}
