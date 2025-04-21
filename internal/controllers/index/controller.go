//go:build js && wasm
// +build js,wasm

package index

import (
	"context"

	"github.com/sonr-io/motr/config"
	"github.com/sonr-io/motr/internal/server"
	"github.com/sonr-io/motr/sink/models"
)

type IndexController struct {
	Querier models.Querier
}

func NewController(cfg config.Config) (*IndexController, error) {
	q, err := cfg.DB.GetQuerier()
	if err != nil {
		return nil, err
	}
	return &IndexController{
		Querier: q,
	}, nil
}

func (c *IndexController) RegisterRoutes(s *server.Server) {
	s.GET("/", c.HandleHome)
}

func (c *IndexController) CheckHandle(handle string) bool {
	res, err := c.Querier.CheckHandleExists(context.Background(), handle)
	if err != nil {
		return false
	}
	return res
}
