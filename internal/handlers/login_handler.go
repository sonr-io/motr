//go:build js && wasm
// +build js,wasm

package handlers

import (
	"github.com/labstack/echo/v4"
	"github.com/sonr-io/motr/internal/components/views"
	"github.com/sonr-io/motr/internal/middleware"
	"github.com/sonr-io/motr/sink/options"
)

func LoginHandler(c echo.Context) error {
	vc, err := middleware.GetVaultController(c)
	if err != nil {
		return err
	}
	vc.Vault().GetCredentialsByHandle(c.Request().Context(), c.QueryParam("handle"))
	return middleware.Render(c, views.LoginView(options.LoginOptions{}))
}
