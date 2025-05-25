//go:build js && wasm
// +build js,wasm

package main

import (
	"github.com/sonr-io/motr/middleware"
	"github.com/sonr-io/motr/routes"
	"github.com/sonr-io/motr/sink/config"
)

func main() {
	// Setup config
	e, c := config.New()
	e.Use(middleware.UseSession(c), middleware.UseCloudflareCache(c))
	routes.SetupRoutes(e)
	e.Serve()
}
