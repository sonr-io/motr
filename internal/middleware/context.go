package middleware

import (
	"net/http"

	"github.com/labstack/echo/v4"
)

type SessionContext struct {
	echo.Context
	ID string
}

func GetSession(c echo.Context) (*SessionContext, error) {
	cc, ok := c.(*SessionContext)
	if !ok {
		return nil, echo.NewHTTPError(http.StatusInternalServerError, "Session Context not found")
	}
	return cc, nil
}
