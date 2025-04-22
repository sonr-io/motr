//go:build js && wasm
// +build js,wasm

package dash

import (
	"github.com/sonr-io/motr/config"
	"github.com/sonr-io/motr/x/console/handlers"
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
