//go:build js && wasm
// +build js,wasm

package main

import (
	"log"

	wasmhttp "github.com/nlepage/go-wasm-http-server/v2"
	"github.com/onsonr/motr/app"
	"github.com/onsonr/motr/internal/database"
)

func main() {
	// configString := "TODO"
	dbq, err := database.New()
	if err != nil {
		log.Fatal(err)
		return
	}
	_, err = app.New(app.WithDatabase(dbq))
	if err != nil {
		log.Fatal(err)
		return
	}
	wasmhttp.Serve(nil)
}
