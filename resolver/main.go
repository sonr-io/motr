package main

import (
	"github.com/labstack/echo/v4"
	"github.com/sonr-io/motr/resolver/handlers"

	"github.com/syumai/workers"
)

func main() {
	e := echo.New()
	e.GET("/", handlers.IndexHandler)
	e.GET("/login", handlers.LoginHandler)
	e.GET("/register", handlers.RegisterHandler)
	workers.Serve(e)
}
