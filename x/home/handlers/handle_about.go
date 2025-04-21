//go:build js && wasm
// +build js,wasm

package handlers

import (
	"github.com/labstack/echo/v4"
	"github.com/sonr-io/motr/config/middleware"
	"github.com/sonr-io/motr/x/home/components"
)

func (h *Handler) HandleAbout(c echo.Context) error {
	return middleware.Render(c, components.HomeView())
}
