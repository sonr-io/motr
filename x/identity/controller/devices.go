package controller

import (
	"github.com/labstack/echo/v4"
	"github.com/onsonr/motr/x/identity/model"
)

func HandleDevices(g *echo.Group, m *model.Queries) {
	g.Any("/devices", devicesHandler(m))
}

func devicesHandler(m *model.Queries) func(e echo.Context) error {
	return func(e echo.Context) error {
		return nil
	}
}
