package handlers

import (
	"github.com/labstack/echo/v4"
	"github.com/sonr-io/motr/config/middleware"
	"github.com/sonr-io/motr/sink/options"
	"github.com/sonr-io/motr/x/auth/components"
)

func (h *Handler) HandleRegisterUsernameCheck(c echo.Context) error {
	handle := c.FormValue("handle")
	ok := h.checkHandle(handle, false)
	if ok {
		return middleware.Render(c, components.RegisterView(options.RegisterOptions{}))
	}
	return middleware.Render(c, components.RegisterView(options.RegisterOptions{}))
}

func (h *Handler) HandleLoginUsernameCheck(c echo.Context) error {
	handle := c.FormValue("handle")
	ok := h.checkHandle(handle, true)
	if ok {
		return middleware.Render(c, components.RegisterView(options.RegisterOptions{}))
	}
	return middleware.Render(c, components.RegisterView(options.RegisterOptions{}))
}

func (h *Handler) HandleSubmitUsernameClaim(c echo.Context) error {
	return middleware.Render(c, components.RegisterView(options.RegisterOptions{}))
}

func (h *Handler) HandleSubmitProfile(c echo.Context) error {
	return middleware.Render(c, components.RegisterView(options.RegisterOptions{}))
}
