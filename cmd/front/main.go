//go:build js && wasm
// +build js,wasm

package main

import (
	"github.com/sonr-io/motr/internal/server"

	"github.com/sonr-io/motr/internal/handlers"
)

func main() {
	e := server.New()

	// Unauthenticated routes
	e.GET("/", handlers.IndexHandler)
	e.GET("/register/:handle", handlers.HandleRegisterStart)
	e.POST("/register/:handle/finish", handlers.HandleRegisterFinish)
	e.GET("/login/:handle", handlers.HandleLoginStart)
	e.POST("/login/:handle/finish", handlers.HandleLoginFinish)

	// Authenticated routes
	e.GET("/:handle/home", handlers.IndexHandler)
	e.Serve()
}
