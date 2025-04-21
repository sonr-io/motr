//go:build js && wasm
// +build js,wasm

package handlers

import (
	"github.com/sonr-io/motr/sink/models"
	"github.com/syumai/workers/cloudflare/kv"
)

type Handler struct {
	DB       models.Querier
	Handles  *kv.Namespace
	Sessions *kv.Namespace
}

func New(q models.Querier, hkv *kv.Namespace, skv *kv.Namespace) *Handler {
	return &Handler{DB: q, Handles: hkv, Sessions: skv}
}
