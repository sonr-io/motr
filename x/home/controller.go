//go:build js && wasm
// +build js,wasm

package home

import (
	"github.com/sonr-io/motr/config"
	"github.com/sonr-io/motr/x/home/handlers"
)

func Register(cfg config.Config, s *config.Server) error {
	q, err := cfg.DB.GetQuerier()
	if err != nil {
		return err
	}
	h := handlers.New(q)
	s.GET("/", h.HandleDefault)
	return nil
}
