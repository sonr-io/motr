package handlers

import (
	"github.com/labstack/echo/v4"
	"github.com/sonr-io/motr/internal/ui/home"
	"github.com/sonr-io/motr/pkg/render"
)

func HandleDefaultIndex(c echo.Context) error {
	return render.View(c, home.HomeView())
}

func HandleDefaultValid(c echo.Context) error {
	return render.View(c, home.HomeView())
}
