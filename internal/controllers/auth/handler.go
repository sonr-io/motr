//go:build js && wasm
// +build js,wasm

package auth

import (
	"github.com/labstack/echo/v4"
	"github.com/sonr-io/motr/internal/middleware"
	"github.com/sonr-io/motr/internal/views"
	"github.com/sonr-io/motr/sink/options"
)

func (cc *AuthController) HandleLoginStart(c echo.Context) error {
	return middleware.Render(c, views.LoginView(options.LoginOptions{}))
}

func (cc *AuthController) HandleLoginFinish(c echo.Context) error {
	return middleware.Render(c, views.LoginView(options.LoginOptions{}))
}

func (cc *AuthController) HandleRegisterStart(c echo.Context) error {
	return middleware.Render(c, views.RegisterView(options.RegisterOptions{}))
}

func (cc *AuthController) HandleRegisterFinish(c echo.Context) error {
	return middleware.Render(c, views.RegisterView(options.RegisterOptions{}))
}
