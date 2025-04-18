//go:build js && wasm
// +build js,wasm

package main

import (
	"github.com/labstack/echo/v4"
	"github.com/sonr-io/motr/config"
	"github.com/sonr-io/motr/internal"
	"github.com/sonr-io/motr/internal/handlers"
	"github.com/sonr-io/motr/internal/middleware/sonr"
	"github.com/sonr-io/motr/internal/middleware/vault"
	"github.com/syumai/workers"
	_ "github.com/syumai/workers/cloudflare/d1"
)

func main() {
	c := config.GetConfig()
	vc, err := internal.NewVaultController(c.DB)
	if err != nil {
		panic(err)
	}

	e := echo.New()
	e.Use(sonr.UseMiddleware(c.Sonr))
	e.Use(vault.UseMiddleware(c.IPFS))
	e.GET("/", handlers.Index(vc).Handler)
	e.GET("/login", handlers.Login(vc).Handler)
	workers.Serve(e)
}
