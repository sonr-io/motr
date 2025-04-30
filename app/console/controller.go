//go:build js && wasm
// +build js,wasm

package dash

import (
	"github.com/sonr-io/motr/app/console/handlers"
	"github.com/sonr-io/motr/internal/config"
)

func Register(cfg config.Config, s *config.Server) error {
	q, err := cfg.DB.GetQuerier()
	if err != nil {
		return err
	}
	skv, err := cfg.KV.GetSessions()
	if err != nil {
		return err
	}
	h := handlers.New(q, skv)
	h.SetupRoutes(s)
	return nil
}
