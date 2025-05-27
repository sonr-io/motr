export ROOT_DIR := $(shell git rev-parse --show-toplevel)
export GUM_SPIN_SHOW_STDERRR := true
export GUM_SPIN_SPINNER := dot
export GUM_SPIN_ALIGN := right

export RADAR_ROOT := $(ROOT_DIR)/cmd/radar
export WORKER_ROOT := $(ROOT_DIR)/cmd/worker

.PHONY: tidy templ sqlc worker radar

all: tidy radar worker

# Project Level
tidy: 
	@GUM_SPIN_TITLE="[*] Tidy go mod..." gum spin -- go mod tidy
templ:
	@GUM_SPIN_TITLE="[*] Templ Generate" gum spin -- devbox run gen:templ
sqlc:
	@GUM_SPIN_TITLE="[*] SQLC Generate" gum spin -- devbox run gen:sqlc

# Radar
radar: radar-install radar-build radar-deploy
radar-install:
	@make -C $(RADAR_ROOT) install
radar-build: templ
	@make -C $(RADAR_ROOT) build
radar-deploy:
	@make -C $(RADAR_ROOT) deploy

# Worker
worker: tidy worker-install worker-build worker-deploy
worker-install:
	@make -C $(WORKER_ROOT) install
worker-build: templ	
	@make -C $(WORKER_ROOT) build
worker-deploy:
	@make -C $(WORKER_ROOT) deploy
