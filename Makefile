
VERSION := $(shell echo $(shell git describe --tags) | sed 's/^v//')
COMMIT := $(shell git log -1 --format='%H')

.PHONY: all build generate test

all: generate build

build:
	@go build -o bin/app.wasm .

generate:
	@templ generate
	@sqlc generate -f "x/identity/model/sqlc.yaml"
	@sqlc generate -f "x/portfolio/model/sqlc.yaml"
	@sqlc generate -f "x/user/model/sqlc.yaml"
