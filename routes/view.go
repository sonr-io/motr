//go:build js && wasm
// +build js,wasm

package routes

import (
	"github.com/sonr-io/motr/handlers"
	"github.com/sonr-io/motr/sink/config"
)

func SetupViewRoutes(c *config.Server) {
	c.GET("/", handlers.HandleDefaultIndex)
	c.GET("/login", handlers.HandleLoginInitial)
	c.GET("/register", handlers.HandleRegisterInitial)
}
