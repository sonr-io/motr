//go:build js && wasm
// +build js,wasm

package session

import (
	"encoding/json"
	"time"

	"github.com/labstack/echo/v4"
	"github.com/segmentio/ksuid"
	"github.com/sonr-io/motr/pkg/cookies"
)

type Session struct {
	ID           string `json:"session_id"`
	Status       string `json:"status"`
	Expires      int64  `json:"expires"`
	Handle       string `json:"handle"`
	CaptchaValid bool   `json:"captcha_valid"`
}

func (s *Session) Marshal() ([]byte, error) {
	return json.Marshal(s)
}

func (s *Session) Unmarshal(b []byte) error {
	return json.Unmarshal(b, s)
}

func (s *Session) IsExpired() bool {
	return s.Expires < time.Now().Unix()
}

func (s *Session) IsNewUser() bool {
	return s.Status == "default"
}

func (s *Session) IsExpiredUser() bool {
	return s.Status == "expired"
}

func (s *Session) IsValidUser() bool {
	return s.Status == "valid"
}

const DefaultTTL = time.Hour * 1

func GetTTL(t time.Time) int64 {
	return int64(DefaultTTL) + t.UnixNano()
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
