//go:build js && wasm
// +build js,wasm

package main

import (
	"github.com/labstack/echo/v4"
	"github.com/sonr-io/motr/config"
	"github.com/sonr-io/motr/handlers"
	"github.com/sonr-io/motr/pkg/cache"
	"github.com/sonr-io/motr/pkg/session"
	"github.com/syumai/workers"
)

var (
	// Version is the current version of the application.
	Version = "0.0.1"

	// Config is the current configuration of the application.
	cfg config.Config
)

func init() {
	cfg = config.Get()
}

func main() {
	e := echo.New()
	e.Use(session.Middleware(cfg), cache.Middleware(config.Cache))
	setupViewRoutes(e)
	setupPartialRoutes(e)
	workers.Serve(e)
}

func setupViewRoutes(e *echo.Echo) {
	e.GET("/", handlers.HandleDefaultIndex)
	e.GET("/login", handlers.HandleLoginInitial)
	e.GET("/register", handlers.HandleRegisterInitial)
}

func setupPartialRoutes(e *echo.Echo) {
	e.POST("/login/:handle/check", handlers.HandleLoginCheck)
	e.POST("/login/:handle/finish", handlers.HandleLoginFinish)

	// Register
	e.POST("/register/:handle", handlers.HandleRegisterStart)
	e.POST("/register/:handle/check", handlers.HandleRegisterCheck)
	e.POST("/register/:handle/finish", handlers.HandleRegisterFinish)

	e.POST("/status", handlers.HandleStatusCheck)
}
