//go:build js && wasm
// +build js,wasm

package auth

import (
	"github.com/sonr-io/motr/config"
	"github.com/sonr-io/motr/sink/models"
	"github.com/sonr-io/motr/x/auth/handlers"
)

type Handler struct {
	Querier models.Querier
}

func New(q models.Querier) *Handler {
	return &Handler{Querier: q}
}

func Register(cfg config.Config, s *config.Server) error {
	q, err := cfg.DB.GetQuerier()
	if err != nil {
		return err
	}

	h := handlers.New(q)
	s.GET("/login", h.HandleLoginInitial)
	s.GET("/login/:handle", h.HandleLoginStart)
	s.POST("/login/:handle/finish", h.HandleLoginFinish)
	s.GET("/register", h.HandleRegisterStart)
	s.GET("/register/:handle", h.HandleRegisterStart)
	s.POST("/register/:handle/finish", h.HandleRegisterFinish)
	return nil
}
