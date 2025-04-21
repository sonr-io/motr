//go:build js && wasm
// +build js,wasm

package handlers

import (
	"github.com/labstack/echo/v4"
	"github.com/sonr-io/motr/middleware"
	"github.com/sonr-io/motr/x/landing/components"
)

func (h *Handler) HandleIndex(c echo.Context) error {
	return middleware.Render(c, components.HomeView())
}
