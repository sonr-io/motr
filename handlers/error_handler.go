package handlers

import (
	"github.com/labstack/echo/v4"
	"github.com/sonr-io/motr/ui"
	"github.com/sonr-io/motr/ui/views"
)

func HandleItemNotFound(c echo.Context) error {
	return ui.Render(c, views.HomeView())
}
