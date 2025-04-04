package controller

import (
	"github.com/labstack/echo/v4"
	"github.com/onsonr/motr/x/portfolio/model"
)

func HandleBalances(g *echo.Group, m *model.Queries) {
	g.Any("/balances", balanceHandler(m))
}

func balanceHandler(m *model.Queries) func(e echo.Context) error {
	return func(e echo.Context) error {
		return nil
	}
}
