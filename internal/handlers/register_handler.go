//go:build js && wasm
// +build js,wasm

package handlers

import (
	"github.com/labstack/echo/v4"
	"github.com/sonr-io/motr/internal/middleware"
	"github.com/sonr-io/motr/internal/views"
	"github.com/sonr-io/motr/sink/options"
)

func HandleRegisterStart(c echo.Context) error {
	return middleware.Render(c, views.RegisterView(options.RegisterOptions{}))
}

func HandleRegisterFinish(c echo.Context) error {
	return middleware.Render(c, views.RegisterView(options.RegisterOptions{}))
}
