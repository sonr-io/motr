//go:build js && wasm
// +build js,wasm

package middleware

import (
	"encoding/json"
	"time"

	"github.com/syumai/workers/cloudflare/kv"
)

type Status struct {
	SessionID    string `json:"session_id"`
	Status       string `json:"status"`
	Expires      int64  `json:"expires"`
	Handle       string `json:"handle"`
	CaptchaValid bool   `json:"captcha_valid"`
}

func (s *Status) Marshal() ([]byte, error) {
	return json.Marshal(s)
}

func (s *Status) Unmarshal(b []byte) error {
	return json.Unmarshal(b, s)
}

func (s *Status) IsExpired() bool {
	return s.Expires < time.Now().Unix()
}

func (s *Status) IsNewUser() bool {
	return s.Status == "default"
}

func (s *Status) IsExpiredUser() bool {
	return s.Status == "expired"
}

func (s *Status) IsValidUser() bool {
	return s.Status == "valid"
}

// SaveStatus saves the state of the current session into the KV store
func (sc *SessionContext) SaveStatus(kv *kv.Namespace) error {
	stbz, err := sc.Status.Marshal()
	if err != nil {
		return err
	}
	if err := kv.PutString(sc.ID, string(stbz), nil); err != nil {
		return err
	}
	return nil
}

// LoadStatus loads the state of the current session from the KV store
func (sc *SessionContext) LoadStatus(kv *kv.Namespace) (*Status, error) {
	ststr, err := kv.GetString(sc.ID, nil)
	if err != nil {
		return nil, err
	}
	st := &Status{}
	err = st.Unmarshal([]byte(ststr))
	if err != nil {
		return nil, err
	}
	sc.Status = st
	return st, nil
}
