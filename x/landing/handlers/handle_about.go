//go:build js && wasm
// +build js,wasm

package handlers

import (
	"github.com/labstack/echo/v4"
	"github.com/sonr-io/motr/config/ui"
	"github.com/sonr-io/motr/x/landing/components"
)

func (h *Handler) HandleAbout(c echo.Context) error {
	return ui.Render(c, components.HomeView())
}
