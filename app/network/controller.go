//go:build js && wasm
// +build js,wasm

package authz

import (
	"github.com/sonr-io/motr/internal/config"
)

func Register(cfg config.Config, s *config.Server) error {
	// q, err := cfg.DB.GetQuerier()
	// if err != nil {
	// 	return err
	// }
	// c := &AuthorizeController{Querier: q}

	// Register routes
	return nil
}
