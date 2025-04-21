//go:build js && wasm
// +build js,wasm

package dash

import (
	"context"

	"github.com/sonr-io/motr/config"
	"github.com/sonr-io/motr/sink/models"
)

type DashController struct {
	Querier models.Querier
}

func RegisterController(cfg config.Config, s *config.Server) error {
	q, err := cfg.DB.GetQuerier()
	if err != nil {
		return err
	}
	c := &DashController{Querier: q}

	// Register routes
	s.GET("/", c.HandleDashOverview)
	return nil
}

func (c *DashController) CheckHandle(handle string) bool {
	res, err := c.Querier.CheckHandleExists(context.Background(), handle)
	if err != nil {
		return false
	}
	return res
}
