package handlers

import (
	"github.com/labstack/echo/v4"
	"github.com/sonr-io/motr/internal/middleware"
	"github.com/sonr-io/motr/internal/ui/views"
	"github.com/sonr-io/motr/sink/options"
)

func LoginHandler(c echo.Context) error {
	return middleware.Render(c, views.LoginView(options.LoginOptions{}))
}
