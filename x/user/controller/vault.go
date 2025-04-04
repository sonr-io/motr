package controller

import (
	"github.com/labstack/echo/v4"
	"github.com/onsonr/motr/x/user/model"
)

func HandleVault(g *echo.Group, m *model.Queries) {
	g.Any("/vault", vaultHandler(m))
}

func vaultHandler(m *model.Queries) func(e echo.Context) error {
	return func(e echo.Context) error {
		return nil
	}
}
