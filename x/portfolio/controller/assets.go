package controller

import (
	"github.com/labstack/echo/v4"
	"github.com/onsonr/motr/x/portfolio/model"
)

func HandleAssets(g *echo.Group, m *model.Queries) {
	g.Any("/assets", assetHandler(m))
}

func assetHandler(m *model.Queries) func(e echo.Context) error {
	return func(e echo.Context) error {
		return nil
	}
}
