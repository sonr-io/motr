package handlers

import (
	"github.com/labstack/echo/v4"
)

func RedirectHandler(c echo.Context) error {
	return c.Redirect(308, "/")
}
