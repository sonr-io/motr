//go:build js && wasm
// +build js,wasm

package main

import (
	"database/sql"

	"github.com/labstack/echo/v4"
	"github.com/sonr-io/motr/internal/handlers"
	"github.com/sonr-io/motr/internal/middleware/sonr"
	"github.com/sonr-io/motr/sink/models/resolver"
	"github.com/syumai/workers"
	"github.com/syumai/workers/cloudflare"
	_ "github.com/syumai/workers/cloudflare/d1"
)

func main() {
	e := echo.New()
	db, err := sql.Open("d1", "MotrDB")
	if err != nil {
		panic(err)
	}
	e.Use(sonr.UseMiddleware(sonr.Config{
		ChainID:    cloudflare.Getenv("SONR_CHAIN_ID"),
		GatewayURL: cloudflare.Getenv("IPFS_GATEWAY"),
		APIURL:     cloudflare.Getenv("SONR_API_URL"),
		RPCURL:     cloudflare.Getenv("SONR_RPC_URL"),
	}))
	e.GET("/", handlers.IndexHandler())
	e.GET("/register", handlers.RegisterHandler(resolver.New(db)))
	workers.Serve(e)
}
