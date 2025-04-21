//go:build js && wasm
// +build js,wasm

package main

import (
	"github.com/sonr-io/motr/internal/handlers"
	"github.com/sonr-io/motr/internal/server"
)

func main() {
	e := server.New()
	e.GET("/", handlers.IndexHandler)
	e.GET("/login/:handle", handlers.HandleLoginStart)
	e.POST("/login/:handle/finish", handlers.HandleLoginFinish)
	e.Serve()
}
