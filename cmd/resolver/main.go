//go:build js && wasm
// +build js,wasm

package main

import (
	"database/sql"

	"github.com/labstack/echo/v4"
	"github.com/sonr-io/motr/internal/handlers"
	"github.com/sonr-io/motr/internal/middleware/sonr"
	"github.com/sonr-io/motr/sink/models"
	"github.com/syumai/workers"
	_ "github.com/syumai/workers/cloudflare/d1"
)

func main() {
	e := echo.New()
	db, err := sql.Open("d1", "DB")
	if err != nil {
		panic(err)
	}
	e.Use(sonr.UseMiddleware(sonr.Config{}))
	e.GET("/", handlers.IndexHandler(models.New(db)))
	e.GET("/register", handlers.RegisterHandler(models.New(db)))
	workers.Serve(e)
}
