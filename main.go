//go:build js && wasm
// +build js,wasm

package main

import (
	"log"

	"github.com/onsonr/motr/app"
	"github.com/onsonr/motr/internal/context"
	"github.com/onsonr/motr/internal/database"
)

func main() {
	// configString := "TODO"
	// config, _ := loadConfig(configString)
	dbq, err := database.New()
	if err != nil {
		log.Fatal(err)
		return
	}
	e, err := app.New(app.WithDatabase(dbq), app.WithMiddleware(context.WASMMiddleware))
	if err != nil {
		log.Fatal(err)
		return
	}
	e.Start()
}
