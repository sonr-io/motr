//go:build js && wasm
// +build js,wasm

package handlers

import (
	"github.com/labstack/echo/v4"
	"github.com/sonr-io/motr/internal/ui"
	"github.com/sonr-io/motr/x/auth/components"
)

func (h *Handler) HandleRegisterUsernameCheck(c echo.Context) error {
	handle := c.FormValue("handle")
	ok := h.verifyHandle(handle, false)
	if ok {
		return ui.Render(c, components.RegisterView())
	}
	return ui.Render(c, components.RegisterView())
}

func (h *Handler) HandleLoginUsernameCheck(c echo.Context) error {
	handle := c.FormValue("handle")
	ok := h.verifyHandle(handle, true)
	if ok {
		return ui.Render(c, components.RegisterView())
	}
	return ui.Render(c, components.RegisterView())
}

func (h *Handler) HandleSubmitUsernameClaim(c echo.Context) error {
	return ui.Render(c, components.RegisterView())
}

func (h *Handler) HandleSubmitProfile(c echo.Context) error {
	return ui.Render(c, components.RegisterView())
}
