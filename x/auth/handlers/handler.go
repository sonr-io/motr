package handlers

import (
	"context"

	"github.com/sonr-io/motr/sink/models"
)

type Handler struct {
	Querier models.Querier
}

func New(q models.Querier) *Handler {
	return &Handler{Querier: q}
}

func (c *Handler) checkHandle(handle string) bool {
	res, err := c.Querier.CheckHandleExists(context.Background(), handle)
	if err != nil {
		return false
	}
	return res
}

func (c *Handler) getCredentials(handle string) ([]models.Credential, error) {
	return c.Querier.GetCredentialsByHandle(context.Background(), handle)
}

func (c *Handler) getProfile(handle string) (models.Profile, error) {
	return c.Querier.GetProfileByHandle(context.Background(), handle)
}

func (c *Handler) insertCredential(handle, credentialID, authenticatorAttachment, origin, typ, transports string) (models.Credential, error) {
	return c.Querier.InsertCredential(context.Background(), models.InsertCredentialParams{})
}

func (c *Handler) insertProfile(address, handle, origin, name string) (models.Profile, error) {
	return c.Querier.InsertProfile(context.Background(), models.InsertProfileParams{})
}
