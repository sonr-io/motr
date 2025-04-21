//go:build js && wasm
// +build js,wasm

package middleware

import (
	"net/http"

	"github.com/labstack/echo/v4"
	"github.com/segmentio/ksuid"
	"github.com/sonr-io/motr/config"
)

type SessionContext struct {
	echo.Context
	ID     string
	Config config.Config
}

func NewSession(c echo.Context, cfg config.Config) *SessionContext {
	return &SessionContext{
		Context: c,
		ID:      getOrCreateSessionID(c),
		Config:  cfg,
	}
}

func GetSession(c echo.Context) (*SessionContext, error) {
	cc, ok := c.(*SessionContext)
	if !ok {
		return nil, echo.NewHTTPError(http.StatusInternalServerError, "Session Context not found")
	}
	return cc, nil
}

// getOrCreateSessionID returns the session ID from the cookie or creates a new one if it doesn't exist
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
