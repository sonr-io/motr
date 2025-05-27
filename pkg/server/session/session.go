//go:build js && wasm
// +build js,wasm

package session

import (
	"encoding/json"
	"time"
)

const DefaultTTL = time.Hour * 1

func GetTTL(t time.Time) int64 {
	return int64(DefaultTTL) + t.UnixNano()
}

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
