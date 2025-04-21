//go:build js && wasm
// +build js,wasm

package authz

import (
	"github.com/sonr-io/motr/config"
)

func Register(cfg config.Config, s *config.Server) error {
	return nil
}
