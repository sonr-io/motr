package main

import (
	"github.com/labstack/echo/v4"
	"github.com/sonr-io/motr/internal/handlers"
	"github.com/sonr-io/motr/internal/middleware/sonr"
	"github.com/syumai/workers"
)

func main() {
	e := echo.New()
	e.Use(sonr.UseMiddleware(sonr.Config{}))
	e.GET("/", handlers.IndexHandler)
	e.GET("/register", handlers.RegisterHandler)
	workers.Serve(e)
}
