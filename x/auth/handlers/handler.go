//go:build js && wasm
// +build js,wasm

package handlers

import (
	"context"

	"github.com/syumai/workers/cloudflare/kv"

	"github.com/sonr-io/motr/sink/models"
)

type Handler struct {
	DB       models.Querier
	Handles  *kv.Namespace
	Sessions *kv.Namespace
}

func New(q models.Querier, hkv *kv.Namespace, skv *kv.Namespace) *Handler {
	return &Handler{DB: q, Handles: hkv, Sessions: skv}
}

func (c *Handler) verifyHandle(handle string, target bool) bool {
	_, err := c.Handles.GetString(handle, nil)
	if err != nil {
		return !target
	}
	res, err := c.DB.CheckHandleExists(context.Background(), handle)
	if err != nil {
		return false
	}
	return res == target
}
