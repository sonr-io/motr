//go:build js && wasm
// +build js,wasm

package handlers

import (
	"github.com/labstack/echo/v4"
	"github.com/sonr-io/motr/app/landing/components"
	"github.com/sonr-io/motr/internal/middleware"
)

func (h *Handler) HandleIndex(c echo.Context) error {
	if err := middleware.GetSession(c).SaveStatus(h.Sessions); err != nil {
		return err
	}
	return middleware.Render(c, components.HomeView())
}
