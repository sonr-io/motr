//go:build js && wasm
// +build js,wasm

package main

import (
	"github.com/labstack/echo/v4"
	"github.com/sonr-io/motr/middleware/database"
	"github.com/sonr-io/motr/middleware/session"
	"github.com/sonr-io/motr/routes"
	"github.com/syumai/workers"
	_ "github.com/syumai/workers/cloudflare/d1"
)

func main() {
	e := echo.New()
	e.Use(session.Middleware(), database.Middleware())

	routes.SetupViews(e)
	routes.SetupPartials(e)

	workers.Serve(e)
}
