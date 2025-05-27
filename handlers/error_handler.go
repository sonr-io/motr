package handlers

import (
	"github.com/labstack/echo/v4"
	"github.com/sonr-io/motr/pkg/middleware"
	"github.com/sonr-io/motr/ui/home"
	// "github.com/sonr-io/motr/ui/home"
)

func HandleItemNotFound(c echo.Context) error {
	return middleware.Render(c, home.HomeView())
}
