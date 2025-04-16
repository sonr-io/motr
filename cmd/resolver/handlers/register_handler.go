package handlers

import (
	"net/http"

	"github.com/labstack/echo/v4"
)

func RegisterHandler(c echo.Context) error {
	return c.String(http.StatusOK, "Hello, World!")
}
