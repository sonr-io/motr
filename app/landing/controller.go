//go:build js && wasm
// +build js,wasm

package landing

import (
	"github.com/sonr-io/motr/app/landing/handlers"
	"github.com/sonr-io/motr/internal/config"
)

func Register(cfg config.Config, s *config.Server) error {
	q, err := cfg.DB.GetQuerier()
	if err != nil {
		return err
	}
	hkv, err := cfg.KV.GetHandles()
	if err != nil {
		return err
	}
	skv, err := cfg.KV.GetSessions()
	if err != nil {
		return err
	}
	h := handlers.New(q, hkv, skv)
	h.SetupRoutes(s)
	return nil
}
