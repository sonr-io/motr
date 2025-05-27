package handlers

import (
	"github.com/labstack/echo/v4"
	"github.com/sonr-io/motr/internal/ui/home"
	"github.com/sonr-io/motr/middleware"
)

func HandleItemNotFound(c echo.Context) error {
	return middleware.Render(c, home.HomeView())
}
