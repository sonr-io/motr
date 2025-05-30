export ROOT_DIR := $(shell git rev-parse --show-toplevel)

.PHONY: build start deploy
build:
	workers-assets-gen -mode=go
	GOOS=js GOARCH=wasm go build -ldflags="-s -w" -o ./build/app.wasm .

start:
	wrangler dev

deploy: 
	wrangler deploy
