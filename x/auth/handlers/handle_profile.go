package handlers

import (
	"github.com/labstack/echo/v4"
	"github.com/sonr-io/motr/config/middleware"
	"github.com/sonr-io/motr/sink/options"
	"github.com/sonr-io/motr/x/auth/views"
)

func (h *Handler) HandleCheckUsernameExists(c echo.Context) error {
	handle := c.Param("handle")
	ok := h.checkHandle(handle)
	if ok {
		return middleware.Render(c, views.RegisterView(options.RegisterOptions{}))
	}
	return middleware.Render(c, views.RegisterView(options.RegisterOptions{}))
}

func (h *Handler) HandleCheckUsernameAvailable(c echo.Context) error {
	handle := c.Param("handle")
	ok := h.checkHandle(handle)
	if !ok {
		return middleware.Render(c, views.RegisterView(options.RegisterOptions{}))
	}
	return middleware.Render(c, views.RegisterView(options.RegisterOptions{}))
}

func (h *Handler) HandleLoadProfile(c echo.Context) error {
	return middleware.Render(c, views.RegisterView(options.RegisterOptions{}))
}

func (h *Handler) HandleSubmitUsernameClaim(c echo.Context) error {
	return middleware.Render(c, views.RegisterView(options.RegisterOptions{}))
}

func (h *Handler) HandleSubmitProfile(c echo.Context) error {
	return middleware.Render(c, views.RegisterView(options.RegisterOptions{}))
}
