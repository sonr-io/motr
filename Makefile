export ROOT_DIR := $(shell git rev-parse --show-toplevel)
export RADAR_ROOT := $(ROOT_DIR)/cmd/radar
export WORKER_ROOT := $(ROOT_DIR)/cmd/worker
export SQLC_ROOT := $(ROOT_DIR)/internal/db
export MIGRATE_ROOT := $(ROOT_DIR)/internal/migrations
export RADAR_OUT := $(RADAR_ROOT)/build/app.wasm
export WORKER_OUT := $(WORKER_ROOT)/build/app.wasm

.PHONY: install clean help

install:
	@go mod download
	@go install github.com/syumai/workers/cmd/workers-assets-gen@latest

clean:
	@rm -rf ./build
	@rm -rf ./bin
	@rm -rf ./dist
	@rm -rf ./cmd/worker/node_modules
	@rm -rf ./cmd/radar/node_modules

help:
	@echo "Usage: make <command>"
	@echo ""
	@echo "Commands:"
	@echo "  help        Show this help message"
	@echo "  tidy        Tidy up the project"
	@echo "  templ       Generate templates"
	@echo "  sqlc        Generate SQL schema"
	@echo "  worker      Build and deploy worker"
	@echo "  radar       Build and deploy radar"

.PHONY: templ sqlc

templ:
	@templ generate

sqlc:
	@devbox run gen:sqlc

migrate:
	@cd $(MIGRATE_ROOT) && task

worker:
	@devbox run serve:worker

radar:
	@devbox run serve:radar

deploy: 
	@devbox run deploy

release: 
	@devbox run release

templ-watch:
	@devbox run watch:templ

migrate:
	@devbox run db:migrate
