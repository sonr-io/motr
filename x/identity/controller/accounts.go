package controller

import (
	"github.com/labstack/echo/v4"
	"github.com/onsonr/motr/x/identity/model"
)

func HandleAccounts(g *echo.Group, m *model.Queries) {
	g.Any("/accounts", accountHandler(m))
}

func accountHandler(m *model.Queries) func(e echo.Context) error {
	return func(e echo.Context) error {
		return nil
	}
}
