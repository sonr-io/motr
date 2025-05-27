//go:build js && wasm
// +build js,wasm

package session

import (
	"time"

	"github.com/labstack/echo/v4"
	"github.com/segmentio/ksuid"
	"github.com/sonr-io/motr/pkg/cookies"
)

// New creates a new session
func New(c echo.Context) *Context {
	id := FindOrAssignID(c)
	return &Context{
		Context: c,
		ID:      id,
		Status: &Session{
			ID:      id,
			Expires: GetTTL(time.Now()),
			Status:  "default",
			Handle:  "",
		},
	}
}

// FindOrAssignID returns the session ID from the cookie or creates a new one if it doesn't exist
func FindOrAssignID(c echo.Context) string {
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
