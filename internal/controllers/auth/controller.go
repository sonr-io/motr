//go:build js && wasm
// +build js,wasm

package auth

import (
	"context"

	"github.com/sonr-io/motr/config"
	"github.com/sonr-io/motr/internal/server"
	"github.com/sonr-io/motr/sink/models"
)

type AuthController struct {
	Querier models.Querier
}

func NewController(cfg config.Config) (*AuthController, error) {
	q, err := cfg.DB.GetQuerier()
	if err != nil {
		return nil, err
	}
	return &AuthController{
		Querier: q,
	}, nil
}

func (c *AuthController) RegisterRoutes(s *server.Server) {
	s.GET("/login/:handle", c.HandleLoginStart)
	s.POST("/login/:handle/finish", c.HandleLoginFinish)
	s.GET("/register/:handle", c.HandleRegisterStart)
	s.POST("/register/:handle/finish", c.HandleRegisterFinish)
}

func (c *AuthController) CheckHandle(handle string) bool {
	res, err := c.Querier.CheckHandleExists(context.Background(), handle)
	if err != nil {
		return false
	}
	return res
}

func (c *AuthController) ListCredentials(handle string) ([]models.Credential, error) {
	return c.Querier.GetCredentialsByHandle(context.Background(), handle)
}

func (c *AuthController) GetProfile(handle string) (models.Profile, error) {
	return c.Querier.GetProfileByHandle(context.Background(), handle)
}

func (c *AuthController) InsertCredential(handle, credentialID, authenticatorAttachment, origin, typ, transports string) (models.Credential, error) {
	return c.Querier.InsertCredential(context.Background(), models.InsertCredentialParams{})
}

func (c *AuthController) InsertProfile(address, handle, origin, name string) (models.Profile, error) {
	return c.Querier.InsertProfile(context.Background(), models.InsertProfileParams{})
}
