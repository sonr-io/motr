//go:build js && wasm
// +build js,wasm

package session

import (
	"github.com/labstack/echo/v4"
	"github.com/segmentio/ksuid"
	"github.com/sonr-io/motr/pkg/cookies"
)

// Context is a session context
type Context struct {
	echo.Context
	ID string `json:"id"`
}

// Middleware is a middleware that adds a new key to the context
func Middleware() echo.MiddlewareFunc {
	return func(next echo.HandlerFunc) echo.HandlerFunc {
		return func(c echo.Context) error {
			id := DetermineID(c)
			ctx := &Context{
				Context: c,
				ID:      id,
			}
			return next(ctx)
		}
	}
}

// Unwrap unwraps the session context
func Unwrap(c echo.Context) *Context {
	cc := c.(*Context)
	if cc == nil {
		panic("failed to unwrap session context")
	}
	return cc
}

func DetermineID(c echo.Context) string {
	if ok := cookies.SessionID.Exists(c); ok {
		c.Echo().Logger.Debug("Has session ID in cookie")
		sessionID, err := cookies.SessionID.Read(c)
		if err != nil {
			sessionID = ksuid.New().String()
			cookies.SessionID.Write(c, sessionID)
			c.Echo().Logger.Debug("Failed to read session ID from cookie, wrote new one")
		}
		return sessionID
	}
	c.Echo().Logger.Debug("Has session ID in cookie")
	sessionID, err := cookies.SessionID.Read(c)
	if err != nil {
		sessionID = ksuid.New().String()
		cookies.SessionID.Write(c, sessionID)
		c.Echo().Logger.Debug("Failed to read session ID from cookie, wrote new one")
	}
	return sessionID
}
