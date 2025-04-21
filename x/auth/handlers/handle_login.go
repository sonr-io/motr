package handlers

import (
	"github.com/labstack/echo/v4"
	"github.com/sonr-io/motr/config/middleware"
	"github.com/sonr-io/motr/sink/options"
	"github.com/sonr-io/motr/x/auth/views"
)

func (h *Handler) HandleLoginFinish(c echo.Context) error {
	return middleware.Render(c, views.LoginView(options.LoginOptions{}))
}

func (h *Handler) HandleLoginStart(c echo.Context) error {
	return middleware.Render(c, views.LoginView(options.LoginOptions{}))
}

func (h *Handler) HandleLoginInitial(c echo.Context) error {
	return middleware.Render(c, views.LoginView(options.LoginOptions{}))
}
