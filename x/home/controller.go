//go:build js && wasm
// +build js,wasm

package home

import (
	"context"

	"github.com/sonr-io/motr/config"
	"github.com/sonr-io/motr/sink/models"
)

type HomeController struct {
	Querier models.Querier
}

func RegisterController(cfg config.Config, s *config.Server) error {
	q, err := cfg.DB.GetQuerier()
	if err != nil {
		return err
	}
	c := &HomeController{Querier: q}

	// Register routes
	s.GET("/", c.HandleHome)
	return nil
}

func (c *HomeController) CheckHandle(handle string) bool {
	res, err := c.Querier.CheckHandleExists(context.Background(), handle)
	if err != nil {
		return false
	}
	return res
}
