package controller

import (
	"github.com/labstack/echo/v4"
	"github.com/onsonr/motr/x/user/model"
)

func HandleProfiles(g *echo.Group, m *model.Queries) {
	g.Any("/assets", profileHandler(m))
}

func profileHandler(m *model.Queries) func(e echo.Context) error {
	return func(e echo.Context) error {
		return nil
	}
}
