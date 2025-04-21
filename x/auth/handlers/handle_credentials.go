package handlers

import (
	"github.com/labstack/echo/v4"
	"github.com/sonr-io/motr/config/middleware"
	"github.com/sonr-io/motr/sink/options"
	"github.com/sonr-io/motr/x/auth/views"
)

func (h *Handler) HandleSubmitCredentialLogin(c echo.Context) error {
	return middleware.Render(c, views.RegisterView(options.RegisterOptions{}))
}

func (h *Handler) HandleSubmitCredentialRegister(c echo.Context) error {
	return middleware.Render(c, views.RegisterView(options.RegisterOptions{}))
}
