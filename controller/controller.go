//go:build js && wasm
// +build js,wasm

package controller

import (
	"github.com/sonr-io/motr/internal/config"
	"github.com/sonr-io/motr/internal/sink/models"
	"github.com/syumai/workers/cloudflare/kv"
)

type Controller struct {
	DB       models.Querier
	Handles  *kv.Namespace
	Sessions *kv.Namespace
	Server   *config.Server
}

func New(cfg config.Config, s *config.Server) (*Controller, error) {
	q, err := cfg.DB.GetQuerier()
	if err != nil {
		return nil, err
	}
	hkv, err := cfg.KV.GetHandles()
	if err != nil {
		return nil, err
	}
	skv, err := cfg.KV.GetSessions()
	if err != nil {
		return nil, err
	}
	return create(q, hkv, skv, s), nil
}

func create(q models.Querier, hkv *kv.Namespace, skv *kv.Namespace, srv *config.Server) *Controller {
	return &Controller{DB: q, Handles: hkv, Sessions: skv, Server: srv}
}
