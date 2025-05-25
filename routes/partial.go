//go:build js && wasm
// +build js,wasm

package routes

import (
	"github.com/sonr-io/motr/internal/handlers"
	"github.com/sonr-io/motr/sink/config"
)

func SetupPartialRoutes(c *config.Server) {
	c.POST("/login/:handle/check", handlers.HandleLoginCheck)
	c.POST("/login/:handle/finish", handlers.HandleLoginFinish)

	// Register
	c.POST("/register/:handle", handlers.HandleRegisterStart)
	c.POST("/register/:handle/check", handlers.HandleRegisterCheck)
	c.POST("/register/:handle/finish", handlers.HandleRegisterFinish)

	c.POST("/status", handlers.HandleStatusCheck)
}
