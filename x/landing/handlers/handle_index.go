//go:build js && wasm
// +build js,wasm

package handlers

import (
	"github.com/labstack/echo/v4"
	"github.com/sonr-io/motr/internal/middleware"
	"github.com/sonr-io/motr/internal/ui"
	"github.com/sonr-io/motr/x/landing/components"
)

func (h *Handler) HandleIndex(c echo.Context) error {
	if err := middleware.GetSession(c).SaveStatus(h.Sessions); err != nil {
		return err
	}
	return ui.Render(c, components.HomeView())
}
