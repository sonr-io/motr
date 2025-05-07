//go:build js && wasm
// +build js,wasm

package main

import (
	"github.com/sonr-io/motr/handlers/auth"
	"github.com/sonr-io/motr/internal/config"
	"github.com/sonr-io/motr/internal/middleware"
)

func main() {
	// Setup config
	e, c := config.New()
	e.Use(middleware.UseSession(c), middleware.UseCloudflareCache(c))

	// Register controllers
	if err := auth.Register(c, e); err != nil {
		panic(err)
	}

	// Start server
	e.Serve()
}
