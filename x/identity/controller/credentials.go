package controller

import (
	"github.com/labstack/echo/v4"
	"github.com/onsonr/motr/x/identity/model"
)

func HandleCredentials(g *echo.Group, m *model.Queries) {
	g.Any("/credentials", credentialsHandler(m))
}

func credentialsHandler(m *model.Queries) func(e echo.Context) error {
	return func(e echo.Context) error {
		return nil
	}
}
