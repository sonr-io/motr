//go:build js && wasm
// +build js,wasm

package middleware

import (
	"time"

	"github.com/labstack/echo/v4"
	"github.com/segmentio/ksuid"
	"github.com/sonr-io/motr/sink"
	"github.com/sonr-io/motr/sink/config"
	"github.com/sonr-io/motr/sink/models"
	"github.com/syumai/workers/cloudflare/kv"
)

type SessionContext struct {
	echo.Context
	ID       string
	DB       models.Querier
	Config   config.Config
	Handles  *kv.Namespace
	Sessions *kv.Namespace
	Status   *sink.Status
}

func NewSession(c echo.Context, cfg config.Config, q models.Querier, hkv *kv.Namespace, skv *kv.Namespace) *SessionContext {
	id := getOrCreateSessionID(c)
	return &SessionContext{
		Context:  c,
		ID:       id,
		Config:   cfg,
		DB:       q,
		Handles:  hkv,
		Sessions: skv,
		Status: &sink.Status{
			SessionID: id,
			Expires:   cfg.KV.GetSessionExpiry(time.Now()),
			Status:    "default",
			Handle:    "",
		},
	}
}

func GetSession(c echo.Context) *SessionContext {
	cc := c.(*SessionContext)
	if cc == nil {
		panic("Session Context not found")
	}
	return cc
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
