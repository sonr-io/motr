//go:build js && wasm
// +build js,wasm

package handlers

import (
	"github.com/sonr-io/motr/sink/models"
	"github.com/syumai/workers/cloudflare/kv"
)

type Handler struct {
	DB       models.Querier
	Sessions *kv.Namespace
}

func New(q models.Querier, skv *kv.Namespace) *Handler {
	return &Handler{DB: q, Sessions: skv}
}
