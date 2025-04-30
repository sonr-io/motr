//go:build js && wasm
// +build js,wasm

package handlers

import (
	"github.com/labstack/echo/v4"
	"github.com/sonr-io/motr/app/landing/components"
	"github.com/sonr-io/motr/middleware"
)

func (h *Handler) HandleAbout(c echo.Context) error {
	return middleware.Render(c, components.HomeView())
}
