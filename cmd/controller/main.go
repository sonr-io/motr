package main

import (
	"github.com/labstack/echo/v4"
	"github.com/sonr-io/motr/handlers"
	"github.com/syumai/workers"
)

func main() {
	e := echo.New()
	e.GET("/", handlers.IndexHandler)
	e.GET("/login", handlers.LoginHandler)
	workers.Serve(e)
}
