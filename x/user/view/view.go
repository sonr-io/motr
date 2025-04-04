//go:build js && wasm
// +build js,wasm

package view

import (
	"github.com/labstack/echo/v4"
	"github.com/onsonr/motr/pkg/htmx"
)

func HandleView(c echo.Context) error {
	return htmx.Render(c, dashboardView(nil))
}
