//go:build js && wasm
// +build js,wasm

package main

import (
	"github.com/labstack/echo/v4"
	"github.com/sonr-io/motr/config"

	// "github.com/sonr-io/motr/internal/database"
	"github.com/sonr-io/motr/internal/handlers"
	"github.com/sonr-io/motr/internal/middleware"
	"github.com/syumai/workers"
)

func main() {
	c := config.GetConfig()
	e := echo.New()
	e.Use(middleware.UseSession(c), middleware.DBCommon(c))
	e.GET("/", handlers.IndexHandler)
	e.GET("/claim", handlers.RegisterHandler)
	workers.Serve(e)
}
