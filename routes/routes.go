//go:build js && wasm
// +build js,wasm

package routes

import (
	"github.com/sonr-io/motr/controller"
	"github.com/sonr-io/motr/handlers"
)

func SetupRoutes(c *controller.Controller) {
	c.Server.GET("/", handlers.HandleDefaultInitial)
	c.Server.GET("/expired", handlers.HandleDefaultExpired)
	c.Server.GET("/valid", handlers.HandleDefaultValid)

	c.Server.GET("/login", handlers.HandleLoginInitial)
	c.Server.GET("/login/:handle", handlers.HandleLoginStart)
	c.Server.POST("/login/:handle/check", handlers.HandleLoginCheck)
	c.Server.POST("/login/:handle/finish", handlers.HandleLoginFinish)

	c.Server.GET("/register", handlers.HandleRegisterInitial)
	c.Server.GET("/register/:handle", handlers.HandleRegisterStart)
	c.Server.POST("/register/:handle/check", handlers.HandleRegisterCheck)
	c.Server.POST("/register/:handle/finish", handlers.HandleRegisterFinish)
}
