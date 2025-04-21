//go:build js && wasm
// +build js,wasm

package index

import (
	"github.com/labstack/echo/v4"
	"github.com/sonr-io/motr/middleware"
	"github.com/sonr-io/motr/x/index/views"
)

func (cc *AuthorizeController) HandleHome(c echo.Context) error {
	return middleware.Render(c, views.HomeView())
}
