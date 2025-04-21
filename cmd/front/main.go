//go:build js && wasm
// +build js,wasm

package main

import (
	"github.com/sonr-io/motr/config"
	"github.com/sonr-io/motr/internal/controllers/auth"
	"github.com/sonr-io/motr/internal/controllers/index"
	"github.com/sonr-io/motr/internal/server"
)

func main() {
	e := server.New()
	ic, err := index.NewController(config.GetConfig())
	if err != nil {
		panic(err)
	}
	ic.RegisterRoutes(e)
	ac, err := auth.NewController(config.GetConfig())
	if err != nil {
		panic(err)
	}
	ac.RegisterRoutes(e)
	e.Serve()
}
