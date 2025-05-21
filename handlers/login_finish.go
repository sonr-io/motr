package handlers

import (
	"github.com/labstack/echo/v4"
	"github.com/sonr-io/motr/middleware"
	"github.com/sonr-io/motr/ui/views"
)

func HandleLoginFinish(c echo.Context) error {
	return middleware.Render(c, views.LoginView())
}
