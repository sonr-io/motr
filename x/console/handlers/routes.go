//go:build js && wasm
// +build js,wasm

package handlers

import (
	"github.com/sonr-io/motr/config"
)

func (h *Handler) SetupRoutes(s *config.Server) {
	s.GET("/dash", h.HandleOverview)
}
