//go:build js && wasm
// +build js,wasm

package routes

import (
	"github.com/sonr-io/motr/handlers"
	"github.com/sonr-io/motr/sink/config"
)

func SetupViewRoutes(c *config.Server) {
	// Home
	c.GET("/", handlers.HandleDefaultIndex)
	c.GET("/expired", handlers.HandleDefaultError)
	c.GET("/valid", handlers.HandleDefaultValid)

	// Login
	c.GET("/login", handlers.HandleLoginInitial)
	c.GET("/login/:handle", handlers.HandleLoginStart)
	c.POST("/login/:handle/check", handlers.HandleLoginCheck)
	c.POST("/login/:handle/finish", handlers.HandleLoginFinish)

	// Register
	c.GET("/register", handlers.HandleRegisterInitial)
	c.GET("/register/:handle", handlers.HandleRegisterStart)
	c.POST("/register/:handle/check", handlers.HandleRegisterCheck)
	c.POST("/register/:handle/finish", handlers.HandleRegisterFinish)

	// Status
	c.GET("/status", handlers.HandleStatusCheck)
}
