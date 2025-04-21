//go:build js && wasm
// +build js,wasm

package auth

import (
	"github.com/labstack/echo/v4"
	"github.com/sonr-io/motr/middleware"
	"github.com/sonr-io/motr/sink/options"
	"github.com/sonr-io/motr/x/auth/views"
)

func (cc *AuthenticateController) HandleLoginStart(c echo.Context) error {
	return middleware.Render(c, views.LoginView(options.LoginOptions{}))
}

func (cc *AuthenticateController) HandleLoginFinish(c echo.Context) error {
	return middleware.Render(c, views.LoginView(options.LoginOptions{}))
}

func (cc *AuthenticateController) HandleRegisterStart(c echo.Context) error {
	return middleware.Render(c, views.RegisterView(options.RegisterOptions{}))
}

func (cc *AuthenticateController) HandleRegisterFinish(c echo.Context) error {
	return middleware.Render(c, views.RegisterView(options.RegisterOptions{}))
}
