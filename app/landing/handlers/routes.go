//go:build js && wasm
// +build js,wasm

package handlers

import (
	"github.com/sonr-io/motr/internal/config"
)

func (h *Handler) SetupRoutes(s *config.Server) {
	s.GET("/", h.HandleIndex)
	s.GET("/about", h.HandleAbout)
}
