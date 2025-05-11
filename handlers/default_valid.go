package handlers

import (
	"github.com/labstack/echo/v4"
	"github.com/sonr-io/motr/middleware"
	"github.com/sonr-io/motr/ui/components/views"
)

func HandleDefaultValid(c echo.Context) error {
	return middleware.Render(c, views.HomeView())
}
