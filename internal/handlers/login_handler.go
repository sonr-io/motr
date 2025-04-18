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

type login struct {
	Data internal.VaultController
}

func Login(db internal.VaultController) *login {
	return &login{
		Data: db,
	}
}

func (l login) Handler(c echo.Context) error {
	return middleware.Render(c, views.LoginView(options.LoginOptions{}))
}
