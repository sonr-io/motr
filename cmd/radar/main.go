//go:build js && wasm
// +build js,wasm

package main

import (
	"github.com/labstack/echo/v4"
	"github.com/sonr-io/motr/config"
	"github.com/sonr-io/motr/handlers"
	"github.com/sonr-io/motr/pkg/cache"
	"github.com/sonr-io/motr/pkg/database"
	"github.com/sonr-io/motr/pkg/session"
	"github.com/syumai/workers"
	_ "github.com/syumai/workers/cloudflare/d1"
)

func main() {
	cfg := config.Get()
	e := echo.New()
	e.Use(session.Middleware(cfg.Sonr), cache.Middleware(cfg.Cache), database.Middleware())

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
	e.POST("/register/:handle", handlers.HandleRegisterStart)
	e.POST("/register/:handle/check", handlers.HandleRegisterCheck)
	e.POST("/register/:handle/finish", handlers.HandleRegisterFinish)
	e.POST("/status", handlers.HandleStatusCheck)
}
