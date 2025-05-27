//go:build js && wasm
// +build js,wasm

package session

import (
	"time"

	"github.com/labstack/echo/v4"
	"github.com/segmentio/ksuid"
	"github.com/sonr-io/motr/pkg/cookies"
)

const DefaultTTL = time.Hour * 1

func calculateTTL(t time.Time) int64 {
	return int64(DefaultTTL) + t.UnixNano()
}

// determineID returns the session ID from the cookie or creates a new one if it doesn't exist
func determineID(c echo.Context) string {
	if ok := cookies.SessionID.Exists(c); ok {
		c.Echo().Logger.Debug("Has session ID in session")
		sessionID, err := cookies.SessionID.Read(c)
		if err != nil {
			sessionID = ksuid.New().String()
			cookies.SessionID.Write(c, sessionID)
			c.Echo().Logger.Debug("Failed to read session ID from session, wrote new one")
		}
		return sessionID
	} else {
		sessionID := ksuid.New().String()
		cookies.SessionID.Write(c, sessionID)
		c.Echo().Logger.Debug("No session ID in session, wrote new one")
		return sessionID
	}
}
