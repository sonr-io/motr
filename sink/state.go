package sink

import (
	"encoding/json"
	"time"
)

type Status struct {
	SessionID string `json:"session_id"`
	Status    string `json:"status"`
	Expires   int64  `json:"expires"`
	Handle    string `json:"handle"`
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
