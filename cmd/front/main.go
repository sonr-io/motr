//go:build js && wasm
// +build js,wasm

package main

import (
	"github.com/sonr-io/motr/config"
	"github.com/sonr-io/motr/middleware"
	"github.com/sonr-io/motr/routes"
)

func main() {
	// Setup config
	e, c := config.New()

	// Setup middleware
	e.Use(
		middleware.UseSession(c),
		middleware.UseCloudflareCache(c),
	)

	// Setup routes
	routes.SetupRoutes(e)
	e.Serve()
}
