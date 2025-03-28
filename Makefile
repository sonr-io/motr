
VERSION := $(shell echo $(shell git describe --tags) | sed 's/^v//')
COMMIT := $(shell git log -1 --format='%H')

.PHONY: all build generate test

all: build

build:
	GOOS=js GOARCH=wasm go build -o bin/motr.wasm .
