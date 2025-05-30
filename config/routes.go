//go:build js && wasm
// +build js,wasm

package config

import (
	"github.com/labstack/echo/v4"
	"github.com/sonr-io/motr/handlers"
)

// ╭────────────────────────────────────────────────╮
// │                  HTTP Routes                   │
// ╰────────────────────────────────────────────────╯

func RegisterViews(e *echo.Echo) {
	e.GET("/", handlers.RenderHomePage)
	e.GET("/login", handlers.RenderLoginPage)
	e.GET("/register", handlers.RenderRegisterPage)
}

func RegisterPartials(e *echo.Echo) {
	e.POST("/login/:handle/check", handlers.HandleLoginCheck)
	e.POST("/login/:handle/finish", handlers.HandleLoginFinish)
	e.POST("/register/:handle", handlers.HandleRegisterStart)
	e.POST("/register/:handle/check", handlers.HandleRegisterCheck)
	e.POST("/register/:handle/finish", handlers.HandleRegisterFinish)
	e.POST("/status", handlers.HandleStatusCheck)
}
