//go:build js && wasm
// +build js,wasm

package main

import (
	"bytes"
	"context"
	"database/sql"
	"fmt"
	"io"
	"log"
	"net/http"
	"net/http/httptest"
	"strings"
	"sync"
	"syscall/js"

	_ "github.com/ncruces/go-sqlite3/driver"
	_ "github.com/ncruces/go-sqlite3/embed"
	vault "github.com/onsonr/motr/app"
	"github.com/onsonr/motr/pkg/models"
	sink "github.com/onsonr/motr/pkg/sink"
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
	e, err := vault.New(nil, dbq)
	if err != nil {
		log.Fatal(err)
		return
	}
	serveFetch(e)
}

// // loadConfig loads the config from the given JSON string
//
//	func loadConfig(configString string) (*motr.Config, error) {
//		var config motr.Config
//		err := json.Unmarshal([]byte(configString), &config)
//		return &config, err
//	}
//

// createDB initializes and returns a configured database connection
func createDB() (*models.Queries, error) {
	db, err := sql.Open("sqlite3", ":memory:")
	if err != nil {
		return nil, err
	}

	// create tables
	if _, err := db.ExecContext(context.Background(), sink.SchemaVaultSQL); err != nil {
		return nil, err
	}
	return models.New(db), nil
}

// serveFetch serves HTTP requests with optimized handler management
func serveFetch(handler http.Handler) func() {
	h := handler
	if h == nil {
		h = http.DefaultServeMux
	}

	// Optimize prefix handling
	prefix := strings.TrimRight(jsWasmHTTP.Get("path").String(), "/")
	if prefix != "" {
		mux := http.NewServeMux()
		mux.Handle(prefix+"/", http.StripPrefix(prefix, h))
		h = mux
	}

	// Create request handler function
	cb := js.FuncOf(func(_ js.Value, args []js.Value) interface{} {
		promise, resolve, reject := newPromiseOptimized()

		go handleRequest(h, args[1], resolve, reject)

		return promise
	})

	jsWasmHTTP.Call("setHandler", cb)
	return cb.Release
}

// handleRequest processes the request with panic recovery
func handleRequest(h http.Handler, jsReq js.Value, resolve, reject func(interface{})) {
	defer func() {
		if r := recover(); r != nil {
			var errMsg string
			if err, ok := r.(error); ok {
				errMsg = fmt.Sprintf("wasmhttp: panic: %+v", err)
			} else {
				errMsg = fmt.Sprintf("wasmhttp: panic: %v", r)
			}
			reject(errMsg)
		}
	}()

	recorder := newResponseRecorder()
	h.ServeHTTP(recorder, buildRequest(jsReq))
	resolve(recorder.jsResponse())
}

// buildRequest creates an http.Request from JS Request
func buildRequest(jsReq js.Value) *http.Request {
	// Get request body
	arrayBuffer, err := awaitPromiseOptimized(jsReq.Call("arrayBuffer"))
	if err != nil {
		panic(err)
	}

	// Create body buffer
	jsBody := jsUint8Array.New(arrayBuffer)
	bodyLen := jsBody.Get("length").Int()
	body := make([]byte, bodyLen)
	js.CopyBytesToGo(body, jsBody)

	// Create request
	req := httptest.NewRequest(
		jsReq.Get("method").String(),
		jsReq.Get("url").String(),
		bytes.NewReader(body),
	)

	// Set headers efficiently
	headers := jsReq.Get("headers")
	headersIt := headers.Call("entries")
	for {
		entry := headersIt.Call("next")
		if entry.Get("done").Bool() {
			break
		}
		pair := entry.Get("value")
		req.Header.Set(pair.Index(0).String(), pair.Index(1).String())
	}

	return req
}

// ResponseRecorder with optimized buffer handling
type ResponseRecorder struct {
	*httptest.ResponseRecorder
	buffer *bytes.Buffer
}

func newResponseRecorder() *ResponseRecorder {
	return &ResponseRecorder{
		ResponseRecorder: httptest.NewRecorder(),
		buffer:           bufferPool.Get().(*bytes.Buffer),
	}
}

// jsResponse creates a JS Response with optimized memory usage
func (rr *ResponseRecorder) jsResponse() js.Value {
	defer func() {
		rr.buffer.Reset()
		bufferPool.Put(rr.buffer)
	}()

	res := rr.Result()
	defer res.Body.Close()

	// Prepare response body
	body := js.Undefined()
	if res.ContentLength != 0 {
		if _, err := io.Copy(rr.buffer, res.Body); err != nil {
			panic(err)
		}
		bodyBytes := rr.buffer.Bytes()
		body = jsUint8Array.New(len(bodyBytes))
		js.CopyBytesToJS(body, bodyBytes)
	}

	// Prepare response init object
	init := make(map[string]interface{}, 3)
	if res.StatusCode != 0 {
		init["status"] = res.StatusCode
	}

	if len(res.Header) > 0 {
		headers := make(map[string]interface{}, len(res.Header))
		for k, v := range res.Header {
			if len(v) > 0 {
				headers[k] = v[0]
			}
		}
		init["headers"] = headers
	}

	return jsResponse.New(body, init)
}

// newPromiseOptimized creates a new JavaScript Promise with optimized callback handling
func newPromiseOptimized() (js.Value, func(interface{}), func(interface{})) {
	var (
		resolve     func(interface{})
		reject      func(interface{})
		promiseFunc = js.FuncOf(func(_ js.Value, args []js.Value) interface{} {
			resolve = func(v interface{}) { args[0].Invoke(v) }
			reject = func(v interface{}) { args[1].Invoke(v) }
			return js.Undefined()
		})
	)
	defer promiseFunc.Release()

	return jsPromise.New(promiseFunc), resolve, reject
}

// awaitPromiseOptimized waits for Promise resolution with optimized channel handling
func awaitPromiseOptimized(promise js.Value) (js.Value, error) {
	done := make(chan struct{})
	var (
		result js.Value
		err    error
	)

	thenFunc := js.FuncOf(func(_ js.Value, args []js.Value) interface{} {
		result = args[0]
		close(done)
		return nil
	})
	defer thenFunc.Release()

	catchFunc := js.FuncOf(func(_ js.Value, args []js.Value) interface{} {
		err = js.Error{Value: args[0]}
		close(done)
		return nil
	})
	defer catchFunc.Release()

	promise.Call("then", thenFunc).Call("catch", catchFunc)
	<-done

	return result, err
}
