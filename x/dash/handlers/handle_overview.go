//go:build js && wasm
// +build js,wasm

package handlers

import (
	"time"

	"github.com/labstack/echo/v4"
	"github.com/sonr-io/motr/config/middleware"
	"github.com/sonr-io/motr/x/dash/components"
)

func (h *Handler) HandleOverview(c echo.Context) error {
	return middleware.Render(c, components.DemoView(time.Now()))
}
