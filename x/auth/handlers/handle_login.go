//go:build js && wasm
// +build js,wasm

package handlers

import (
	"github.com/labstack/echo/v4"
	"github.com/sonr-io/motr/config/middleware"
	"github.com/sonr-io/motr/sink/options"
	"github.com/sonr-io/motr/x/auth/components"
)

func (h *Handler) HandleLoginFinish(c echo.Context) error {
	return middleware.Render(c, components.LoginView(options.LoginOptions{}))
}

func (h *Handler) HandleLoginStart(c echo.Context) error {
	return middleware.Render(c, components.LoginView(options.LoginOptions{}))
}

func (h *Handler) HandleLoginInitial(c echo.Context) error {
	return middleware.Render(c, components.LoginView(options.LoginOptions{}))
}
