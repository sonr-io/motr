//go:build js && wasm
// +build js,wasm

package landing

import (
	"github.com/sonr-io/motr/config"
	"github.com/sonr-io/motr/x/landing/handlers"
)

func Register(cfg config.Config, s *config.Server) error {
	q, err := cfg.DB.GetQuerier()
	if err != nil {
		return err
	}
	hkv, err := cfg.GetHandlesKV()
	if err != nil {
		return err
	}
	skv, err := cfg.GetSessionsKV()
	if err != nil {
		return err
	}
	h := handlers.New(q, hkv, skv)
	h.SetupRoutes(s)
	return nil
}
