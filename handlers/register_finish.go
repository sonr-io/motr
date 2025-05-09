package handlers

import (
	"github.com/labstack/echo/v4"
	"github.com/sonr-io/motr/components/views"
	"github.com/sonr-io/motr/middleware"
)

func HandleRegisterFinish(c echo.Context) error {
	return middleware.Render(c, views.RegisterView())
}
