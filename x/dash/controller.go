//go:build js && wasm
// +build js,wasm

package dash

import (
	"github.com/sonr-io/motr/config"
	"github.com/sonr-io/motr/x/dash/handlers"
)

func RegisterController(cfg config.Config, s *config.Server) error {
	q, err := cfg.DB.GetQuerier()
	if err != nil {
		return err
	}
	h := handlers.New(q)

	// Register routes
	s.GET("/dash", h.HandleOverview)
	return nil
}
