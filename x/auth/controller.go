//go:build js && wasm
// +build js,wasm

package auth

import (
	"context"

	"github.com/sonr-io/motr/config"
	"github.com/sonr-io/motr/sink/models"
	"github.com/sonr-io/motr/x/auth/handlers"
)

type AuthenticateController struct {
	models.Querier
}

func RegisterController(cfg config.Config, s *config.Server) error {
	q, err := cfg.DB.GetQuerier()
	if err != nil {
		return err
	}

	s.GET("/login/:handle", handlers.HandleLoginStart(q))
	s.POST("/login/:handle/finish", handlers.HandleLoginFinish(q))
	s.GET("/register/:handle", handlers.HandleRegisterStart(q))
	s.POST("/register/:handle/finish", handlers.HandleRegisterFinish(q))
	return nil
}

func (c *AuthenticateController) CheckHandle(handle string) bool {
	res, err := c.Querier.CheckHandleExists(context.Background(), handle)
	if err != nil {
		return false
	}
	return res
}

func (c *AuthenticateController) GetCredentials(handle string) ([]models.Credential, error) {
	return c.Querier.GetCredentialsByHandle(context.Background(), handle)
}

func (c *AuthenticateController) GetProfile(handle string) (models.Profile, error) {
	return c.Querier.GetProfileByHandle(context.Background(), handle)
}

func (c *AuthenticateController) InsertCredential(handle, credentialID, authenticatorAttachment, origin, typ, transports string) (models.Credential, error) {
	return c.Querier.InsertCredential(context.Background(), models.InsertCredentialParams{})
}

func (c *AuthenticateController) InsertProfile(address, handle, origin, name string) (models.Profile, error) {
	return c.Querier.InsertProfile(context.Background(), models.InsertProfileParams{})
}
