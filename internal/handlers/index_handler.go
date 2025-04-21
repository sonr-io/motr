//go:build js && wasm
// +build js,wasm

package handlers

import (
	"github.com/labstack/echo/v4"
	"github.com/sonr-io/motr/internal/components/views"
	"github.com/sonr-io/motr/internal/middleware"
)

func IndexHandler(c echo.Context) error {
	cc, err := middleware.GetCommonController(c)
	if err != nil {
		return err
	}
	return demoViewHandler(cc, c)
}

func demoViewHandler(cc database.Controller, c echo.Context) error {
	return middleware.Render(c, views.DemoView(cc.Common().GetSession(c.Request().Context()).CreatedAt))
}
