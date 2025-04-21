//go:build js && wasm
// +build js,wasm

package authz

import (
	"context"

	"github.com/sonr-io/motr/config"
	"github.com/sonr-io/motr/sink/models"
)

type PermissionsController struct {
	Querier models.Querier
}

func Register(cfg config.Config, s *config.Server) error {
	// q, err := cfg.DB.GetQuerier()
	// if err != nil {
	// 	return err
	// }
	// c := &AuthorizeController{Querier: q}

	// Register routes
	return nil
}

func (c *PermissionsController) CheckHandle(handle string) bool {
	res, err := c.Querier.CheckHandleExists(context.Background(), handle)
	if err != nil {
		return false
	}
	return res
}
