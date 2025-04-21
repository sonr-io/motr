//go:build js && wasm
// +build js,wasm

package handlers

import (
	"github.com/labstack/echo/v4"
	"github.com/sonr-io/motr/internal/ui"
	"github.com/sonr-io/motr/x/auth/components"
	"github.com/sonr-io/motr/x/auth/types"
)

// ╭───────────────────────────────────────────────────────────╮
// │                   Register Initial  (/register)           │
// ╰───────────────────────────────────────────────────────────╯

func (h *Handler) HandleRegisterInitial(c echo.Context) error {
	return ui.Render(c, components.RegisterView(types.RegisterOptions{}))
}

// ╭──────────────────────────────────────────────────────────────────╮
// │            Register Start (/register/:handle/start)              │
// ╰──────────────────────────────────────────────────────────────────╯

func (h *Handler) HandleRegisterStart(c echo.Context) error {
	return ui.Render(c, components.RegisterView(types.RegisterOptions{}))
}

// ╭────────────────────────────────────────────────────────────────────╮
// │            Register Finish (/register/:handle/finish)              │
// ╰────────────────────────────────────────────────────────────────────╯

func (h *Handler) HandleRegisterFinish(c echo.Context) error {
	return ui.Render(c, components.RegisterView(types.RegisterOptions{}))
}
