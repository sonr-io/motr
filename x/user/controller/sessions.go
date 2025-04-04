package controller

import (
	"github.com/labstack/echo/v4"
	"github.com/onsonr/motr/x/user/model"
)

func HandleSessions(g *echo.Group, m *model.Queries) {
	g.Any("/sessions", sessionHandler(m))
}

func sessionHandler(m *model.Queries) func(e echo.Context) error {
	return func(e echo.Context) error {
		return nil
	}
}
