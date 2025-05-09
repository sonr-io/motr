//go:build js && wasm
// +build js,wasm

package main

import (
	"github.com/sonr-io/motr/config"
	"github.com/sonr-io/motr/middleware"
	"github.com/sonr-io/motr/routes"
	"github.com/sonr-io/motr/sink/controller"
)

func main() {
	// Setup config
	e, c := config.New()
	e.Use(middleware.UseSession(c), middleware.UseCloudflareCache(c))
	cn, err := controller.New(c, e)
	if err != nil {
		panic(err)
	}
	routes.SetupRoutes(cn)
	e.Serve()
}
