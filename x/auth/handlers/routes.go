//go:build js && wasm
// +build js,wasm

package handlers

import (
	"github.com/sonr-io/motr/config"
)

func (h *Handler) SetupRoutes(s *config.Server) {
	s.GET("/login", h.HandleLoginInitial)
	s.GET("/login/:handle", h.HandleLoginStart)
	s.POST("/login/:handle/check", h.HandleLoginUsernameCheck)
	s.POST("/login/:handle/finish", h.HandleLoginFinish)

	s.GET("/register", h.HandleRegisterInitial)
	s.GET("/register/:handle", h.HandleRegisterStart)
	s.POST("/register/:handle/check", h.HandleRegisterUsernameCheck)
	s.POST("/register/:handle/finish", h.HandleRegisterFinish)
}
