//go:build js && wasm
// +build js,wasm

package main

import (
	"github.com/labstack/echo/v4"
	"github.com/sonr-io/motr/config"
	"github.com/sonr-io/motr/handlers"
	"github.com/sonr-io/motr/pkg/cache"
	"github.com/sonr-io/motr/pkg/database"
	"github.com/sonr-io/motr/pkg/kvstore"
	"github.com/sonr-io/motr/pkg/session"
	"github.com/syumai/workers"
	_ "github.com/syumai/workers/cloudflare/d1"
)

var (
	// Version is the current version of the app.
	Version = "0.0.1"

	// Commit is the current commit hash of the app.
	Commit = "none"
)

func main() {
	cfg := config.Get()
	e := echo.New()
	e.Use(session.Middleware(cfg.Sonr), cache.Middleware(cfg.Cache), database.Middleware(cfg.Cloudflare), kvstore.Middleware(cfg.Cloudflare))

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
