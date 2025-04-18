//go:build js && wasm
// +build js,wasm

package handlers

import (
	"time"

	"github.com/labstack/echo/v4"
	"github.com/sonr-io/motr/internal"
	"github.com/sonr-io/motr/internal/components/views"
	"github.com/sonr-io/motr/internal/middleware"
)

type index struct {
	Data internal.Controller
}

func Index(c internal.Controller) *index {
	return &index{
		Data: c,
	}
}

func (i index) Handler(c echo.Context) error {
	return middleware.Render(c, views.DemoView(time.Now()))
}
