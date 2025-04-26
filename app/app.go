//go:build js && wasm
// +build js,wasm

package app

import (
	"github.com/sonr-io/motr/app/handlers"
	"github.com/sonr-io/motr/config"
)

type App struct {
	cfg  config.Config
	s    *config.Server
	auth *handlers.AuthHandler
}

var app *App

// New creates a new app.
func New(cfg config.Config, s *config.Server) error {
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

	h := handlers.NewAuthHandler(q, hkv, skv)
	h.SetupRoutes(s)
	return nil
}
