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

func (c *Handler) checkHandle(handle string, target bool) bool {
	res, err := c.DB.CheckHandleExists(context.Background(), handle)
	if err != nil {
		return false
	}
	return res == target
}

func (c *Handler) getCredentials(handle string) ([]models.Credential, error) {
	return c.DB.GetCredentialsByHandle(context.Background(), handle)
}

func (c *Handler) getProfile(handle string) (models.Profile, error) {
	return c.DB.GetProfileByHandle(context.Background(), handle)
}

func (c *Handler) insertCredential(handle, credentialID, authenticatorAttachment, origin, typ, transports string) (models.Credential, error) {
	return c.DB.InsertCredential(context.Background(), models.InsertCredentialParams{})
}

func (c *Handler) insertProfile(address, handle, origin, name string) (models.Profile, error) {
	return c.DB.InsertProfile(context.Background(), models.InsertProfileParams{})
}
