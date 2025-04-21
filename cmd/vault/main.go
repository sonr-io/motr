//go:build js && wasm
// +build js,wasm

package main

import (
	"github.com/sonr-io/motr/config"
	"github.com/sonr-io/motr/middleware"
	"github.com/sonr-io/motr/x/auth"
	"github.com/sonr-io/motr/x/index"
)

func main() {
	// Setup config
	c := config.GetConfig()
	e := config.New()
	e.Use(middleware.UseSession(c))

	// Register controllers
	err := index.RegisterController(c, e)
	if err != nil {
		panic(err)
	}
	err = auth.RegisterController(c, e)
	if err != nil {
		panic(err)
	}

	// Start server
	e.Serve()
}
