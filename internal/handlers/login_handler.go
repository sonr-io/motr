//go:build js && wasm
// +build js,wasm

package handlers

import (
	"github.com/labstack/echo/v4"
	"github.com/sonr-io/motr/internal/components/views"
	"github.com/sonr-io/motr/internal/middleware"
	"github.com/sonr-io/motr/sink/models/vault"
	"github.com/sonr-io/motr/sink/options"
)

type login struct {
	Data *vault.Queries
}

func Login(db *vault.Queries) *login {
	return &login{
		Data: db,
	}
}

func (l login) Handler(c echo.Context) error {
	return middleware.Render(c, views.LoginView(options.LoginOptions{}))
}
