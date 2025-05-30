//go:build js && wasm
// +build js,wasm

package config

import (
	"github.com/labstack/echo/v4"
	"github.com/sonr-io/motr/handlers"
	"github.com/sonr-io/motr/internal/ui/home"
	"github.com/sonr-io/motr/internal/ui/login"
	"github.com/sonr-io/motr/internal/ui/register"
	"github.com/sonr-io/motr/pkg/render"
)

// ╭────────────────────────────────────────────────╮
// │                  HTTP Routes                   │
// ╰────────────────────────────────────────────────╯

func RegisterViews(e *echo.Echo) {
	e.GET("/", render.Page(home.HomeView()))
	e.GET("/login", render.Page(login.LoginView()))
	e.GET("/register", render.Page(register.RegisterView()))
}

func RegisterPartials(e *echo.Echo) {
	e.POST("/login/:handle/check", handlers.HandleLoginCheck)
	e.POST("/login/:handle/finish", handlers.HandleLoginFinish)
	e.POST("/register/:handle", handlers.HandleRegisterStart)
	e.POST("/register/:handle/check", handlers.HandleRegisterCheck)
	e.POST("/register/:handle/finish", handlers.HandleRegisterFinish)
	e.POST("/status", handlers.HandleStatusCheck)
}
