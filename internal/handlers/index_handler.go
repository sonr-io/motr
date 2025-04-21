//go:build js && wasm
// +build js,wasm

package handlers

import (
	"time"

	"github.com/labstack/echo/v4"
	"github.com/sonr-io/motr/internal/components/views"
	"github.com/sonr-io/motr/internal/middleware"
)

func IndexHandler(c echo.Context) error {
	cc, err := middleware.GetCommonController(c)
	if err != nil {
		return err
	}
	cc.Common().CreateSession(c.Request().Context(), middleware.BaseSessionCreateParams(c))
	return middleware.Render(c, views.DemoView(time.Now()))
}
