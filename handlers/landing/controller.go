//go:build js && wasm
// +build js,wasm

package landing

import (
	"github.com/labstack/echo/v4"
	"github.com/sonr-io/motr/handlers/landing/components"
	"github.com/sonr-io/motr/internal/config"
	"github.com/sonr-io/motr/internal/middleware"
	"github.com/sonr-io/motr/internal/sink/models"
	"github.com/syumai/workers/cloudflare/kv"
)

func Register(cfg config.Config, s *config.Server) error {
	q, err := cfg.DB.GetQuerier()
	if err != nil {
		return err
	}
	hkv, err := cfg.KV.GetHandles()
	if err != nil {
		return err
	}
	skv, err := cfg.KV.GetSessions()
	if err != nil {
		return err
	}
	h := New(q, hkv, skv)
	h.SetupRoutes(s)
	return nil
}

type LandingHandler struct {
	DB       models.Querier
	Handles  *kv.Namespace
	Sessions *kv.Namespace
}

func New(q models.Querier, hkv *kv.Namespace, skv *kv.Namespace) *LandingHandler {
	return &LandingHandler{DB: q, Handles: hkv, Sessions: skv}
}

func (h *LandingHandler) SetupRoutes(s *config.Server) {
	s.GET("/", h.HandleIndex)
}

func (h *LandingHandler) HandleIndex(c echo.Context) error {
	if err := middleware.GetSession(c).SaveStatus(h.Sessions); err != nil {
		return err
	}
	return middleware.Render(c, components.HomeView())
}
