//go:build js && wasm
// +build js,wasm

package routes

import (
	"github.com/labstack/echo/v4"
	"github.com/sonr-io/motr/handlers"
)

func SetupViews(e *echo.Echo) {
	e.GET("/", handlers.HandleDefaultIndex)
	e.GET("/login", handlers.HandleLoginInitial)
	e.GET("/register", handlers.HandleRegisterInitial)
}

func SetupPartials(e *echo.Echo) {
	e.POST("/login/:handle/check", handlers.HandleLoginCheck)
	e.POST("/login/:handle/finish", handlers.HandleLoginFinish)
	e.POST("/register/:handle", handlers.HandleRegisterStart)
	e.POST("/register/:handle/check", handlers.HandleRegisterCheck)
	e.POST("/register/:handle/finish", handlers.HandleRegisterFinish)
	e.POST("/status", handlers.HandleStatusCheck)
}
