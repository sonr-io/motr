package handlers

import (
	"github.com/labstack/echo/v4"
	"github.com/sonr-io/motr/internal/middleware"
	"github.com/sonr-io/motr/internal/pages"
)

func HandleItemNotFound(c echo.Context) error {
	return middleware.Render(c, pages.HomeView())
}
