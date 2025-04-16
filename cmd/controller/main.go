//go:build js && wasm
// +build js,wasm

package main

import (
	"database/sql"

	"github.com/labstack/echo/v4"
	"github.com/sonr-io/motr/internal/handlers"
	"github.com/sonr-io/motr/sink/models"
	"github.com/syumai/workers"
)

func main() {
	db, err := sql.Open("d1", "DB")
	if err != nil {
		panic(err)
	}
	e := echo.New()
	e.GET("/", handlers.IndexHandler(models.New(db)))
	e.GET("/login", handlers.LoginHandler(models.New(db)))
	workers.Serve(e)
}
