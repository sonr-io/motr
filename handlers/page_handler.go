//go:build js && wasm
// +build js,wasm

package handlers

import (
	"time"

	"github.com/labstack/echo/v4"
	"github.com/sonr-io/motr/internal/ui/home"
	"github.com/sonr-io/motr/internal/ui/login"
	"github.com/sonr-io/motr/internal/ui/register"
	"github.com/sonr-io/motr/middleware/kvstore"
	"github.com/sonr-io/motr/middleware/session"
	"github.com/sonr-io/motr/pkg/render"
)

func RenderHomePage(c echo.Context) error {
	id := session.Unwrap(c).ID
	ttl := time.Now().Add(time.Hour * 1)
	ttlInt := ttl.Unix()
	kvstore.Sessions().SetInt(id, int(ttlInt))
	return render.Component(c, home.HomeView())
}

func RenderLoginPage(c echo.Context) error {
	return render.Component(c, login.LoginView())
}

func RenderRegisterPage(c echo.Context) error {
	return render.Component(c, register.RegisterView())
}
