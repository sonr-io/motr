//go:build js && wasm
// +build js,wasm

package main

import (
	"github.com/sonr-io/motr/app/auth"
	"github.com/sonr-io/motr/app/landing"
	"github.com/sonr-io/motr/config"
	"github.com/sonr-io/motr/middleware"
)

func main() {
	// Setup config
	e, c := config.New()
	e.Use(middleware.UseSession(c), middleware.UseCloudflareCache(c))

	// Register controllers
	if err := landing.Register(c, e); err != nil {
		panic(err)
	}
	if err := auth.Register(c, e); err != nil {
		panic(err)
	}
	// Start server
	e.Serve()
}
