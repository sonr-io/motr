
VERSION := $(shell echo $(shell git describe --tags) | sed 's/^v//')
COMMIT := $(shell git log -1 --format='%H')

.PHONY: all build generate test

all: generate build

build:
	GOOS=js GOARCH=wasm go build -o bin/motr.wasm .

generate:
	@task -t .taskfile.dist.yml sqlc:gen
	@task -t .taskfile.dist.yml templ:gen
