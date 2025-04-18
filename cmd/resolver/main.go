//go:build js && wasm
// +build js,wasm

package main

import (
	"github.com/labstack/echo/v4"
	"github.com/sonr-io/motr/config"
	"github.com/sonr-io/motr/internal/handlers"
	"github.com/sonr-io/motr/internal/middleware/sonr"
	"github.com/sonr-io/motr/internal/middleware/vault"
	"github.com/syumai/workers"
)

func main() {
	c, err := config.GetConfig()
	if err != nil {
		panic(err)
	}
	e := echo.New()
	e.Use(sonr.UseMiddleware(c.Sonr))
	e.Use(vault.UseMiddleware(c.IPFS))
	e.GET("/", handlers.Index(c.DB.GetCommon()).Handler)
	e.GET("/claim", handlers.Register(c.DB.GetResolver()).Handler)
	workers.Serve(e)
}
