//go:build js && wasm
// +build js,wasm

package handlers

import (
	"github.com/labstack/echo/v4"
	"github.com/sonr-io/motr/internal/ui"
	"github.com/sonr-io/motr/x/auth/components"
)

// ╭───────────────────────────────────────────────────────────╮
// │                   Login Handlers (/login)                 │
// ╰───────────────────────────────────────────────────────────╯

func (h *Handler) HandleLoginFinish(c echo.Context) error {
	return ui.Render(c, components.LoginView())
}

func (h *Handler) HandleLoginStart(c echo.Context) error {
	return ui.Render(c, components.LoginView())
}

func (h *Handler) HandleLoginInitial(c echo.Context) error {
	return ui.Render(c, components.LoginView())
}

// HandleSubmitCredentialLogin handles the submit credential login request.
func (h *Handler) HandleSubmitCredentialLogin(c echo.Context) error {
	return ui.Render(c, components.RegisterView())
}
