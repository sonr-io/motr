package controller

import (
	"github.com/labstack/echo/v4"
	"github.com/onsonr/motr/x/portfolio/model"
)

func HandleChains(g *echo.Group, m *model.Queries) {
	g.Any("/chains", chainsHandler(m))
}

func chainsHandler(m *model.Queries) func(e echo.Context) error {
	return func(e echo.Context) error {
		return nil
	}
}
