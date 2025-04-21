//go:build js && wasm
// +build js,wasm

package handlers

import (
	"github.com/labstack/echo/v4"
	"github.com/sonr-io/motr/middleware"
	"github.com/sonr-io/motr/sink/options"
	"github.com/sonr-io/motr/x/auth/components"
)

// ╭───────────────────────────────────────────────────────────╮
// │                   Register Initial  (/register)           │
// ╰───────────────────────────────────────────────────────────╯

func (h *Handler) HandleRegisterInitial(c echo.Context) error {
	return middleware.Render(c, components.RegisterView(options.RegisterOptions{}))
}

// ╭──────────────────────────────────────────────────────────────────╮
// │            Register Start (/register/:handle/start)              │
// ╰──────────────────────────────────────────────────────────────────╯

func (h *Handler) HandleRegisterStart(c echo.Context) error {
	return middleware.Render(c, components.RegisterView(options.RegisterOptions{}))
}

// ╭────────────────────────────────────────────────────────────────────╮
// │            Register Finish (/register/:handle/finish)              │
// ╰────────────────────────────────────────────────────────────────────╯

func (h *Handler) HandleRegisterFinish(c echo.Context) error {
	return middleware.Render(c, components.RegisterView(options.RegisterOptions{}))
}
