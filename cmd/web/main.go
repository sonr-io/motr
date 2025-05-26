//go:build js && wasm
// +build js,wasm

package main

import (
	"github.com/sonr-io/motr/middleware"
	"github.com/sonr-io/motr/routes"
	"github.com/sonr-io/motr/sink/config"
	"github.com/sonr-io/motr/sink/web"
)

func main() {
	// Setup config
	c := config.Get()
	e := web.New()
	e.Use(middleware.UseSession(c), middleware.UseCloudflareCache(config.Cache))
	routes.SetupAPIRoutes(e)
	routes.SetupViewRoutes(e)
	e.Serve()
}
