package handlers

import (
	"github.com/labstack/echo/v4"
	"github.com/sonr-io/motr/middleware"
	"github.com/sonr-io/motr/internal/ui/home"
)

func HandleDefaultIndex(c echo.Context) error {
	return middleware.Render(c, home.HomeView())
}

func HandleDefaultValid(c echo.Context) error {
	return middleware.Render(c, home.HomeView())
}
