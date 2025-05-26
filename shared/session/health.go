//go:build js && wasm
// +build js,wasm

package session

import (
	"encoding/json"
	"time"
)

type Health struct {
	SessionID    string `json:"session_id"`
	Status       string `json:"status"`
	Expires      int64  `json:"expires"`
	Handle       string `json:"handle"`
	CaptchaValid bool   `json:"captcha_valid"`
}

func (s *Health) Marshal() ([]byte, error) {
	return json.Marshal(s)
}

func (s *Health) Unmarshal(b []byte) error {
	return json.Unmarshal(b, s)
}

func (s *Health) IsExpired() bool {
	return s.Expires < time.Now().Unix()
}

func (s *Health) IsNewUser() bool {
	return s.Status == "default"
}

func (s *Health) IsExpiredUser() bool {
	return s.Status == "expired"
}

func (s *Health) IsValidUser() bool {
	return s.Status == "valid"
}
