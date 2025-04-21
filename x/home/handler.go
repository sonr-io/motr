//go:build js && wasm
// +build js,wasm

package home

import (
	"github.com/labstack/echo/v4"
	"github.com/sonr-io/motr/config/middleware"
	"github.com/sonr-io/motr/x/home/views"
)

func (cc *HomeController) HandleHome(c echo.Context) error {
	return middleware.Render(c, views.HomeView())
}
