package handlers

import (
	"github.com/labstack/echo/v4"
	"github.com/sonr-io/motr/middleware"
	"github.com/sonr-io/motr/sink/options"
	"github.com/sonr-io/motr/ui/views"
)

func LoginHandler(c echo.Context) error {
	return middleware.Render(c, views.LoginView(options.LoginOptions{}))
}
