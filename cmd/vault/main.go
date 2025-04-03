//go:build js && wasm
// +build js,wasm

package main

import (
	"bytes"
	"log"
	"sync"
	"syscall/js"

	_ "github.com/ncruces/go-sqlite3/driver"
	_ "github.com/ncruces/go-sqlite3/embed"
	"github.com/onsonr/motr/server"
)

var (
	// Global buffer pool to reduce allocations
	bufferPool = sync.Pool{
		New: func() any {
			return new(bytes.Buffer)
		},
	}

	// Cached JS globals
	jsGlobal     = js.Global()
	jsUint8Array = jsGlobal.Get("Uint8Array")
	jsResponse   = jsGlobal.Get("Response")
	jsPromise    = jsGlobal.Get("Promise")
	jsWasmHTTP   = jsGlobal.Get("wasmhttp")
)

func main() {
	// configString := "TODO"
	// config, _ := loadConfig(configString)
	dbq, err := createDB()
	if err != nil {
		log.Fatal(err)
		return
	}
	e, err := server.New(nil, dbq, WASMMiddleware)
	if err != nil {
		log.Fatal(err)
		return
	}
	serveFetch(e)
}
