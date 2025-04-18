//go:build js && wasm
// +build js,wasm

package main

import (
	"github.com/labstack/echo/v4"
	"github.com/sonr-io/motr/config"

	"github.com/sonr-io/motr/internal/handlers"
	"github.com/sonr-io/motr/internal/middleware"
	"github.com/syumai/workers"
	_ "github.com/syumai/workers/cloudflare/d1"
)

func main() {
	c := config.GetConfig()
	// vc, err := database.NewVaultController(c.DB)
	// if err != nil {
	// 	panic(err)
	// }

	e := echo.New()
	e.Use(middleware.UseConfig(c))
	e.GET("/", handlers.IndexHandler)
	e.GET("/login", handlers.LoginHandler)
	workers.Serve(e)
}
