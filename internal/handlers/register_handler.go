//go:build js && wasm
// +build js,wasm

package handlers

import (
	"github.com/labstack/echo/v4"
	"github.com/sonr-io/motr/internal"
	"github.com/sonr-io/motr/internal/components/views"
	"github.com/sonr-io/motr/internal/middleware"
	"github.com/sonr-io/motr/sink/options"
)

type register struct {
	Data internal.ResolverController
}

func Register(q internal.ResolverController) *register {
	return &register{
		Data: q,
	}
}

func (r register) Handler(c echo.Context) error {
	return middleware.Render(c, views.RegisterView(options.RegisterOptions{}))
}
