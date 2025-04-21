//go:build js && wasm
// +build js,wasm

package handlers

import (
	"time"

	"github.com/labstack/echo/v4"
	"github.com/sonr-io/motr/internal/middleware"
	"github.com/sonr-io/motr/internal/views"
)

func IndexHandler(c echo.Context) error {
	return middleware.Render(c, views.DemoView(time.Now()))
}
