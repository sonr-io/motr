export ROOT_DIR := $(shell git rev-parse --show-toplevel)

export GUM_SPIN_SHOW_STDERRR := true
export GUM_SPIN_SPINNER := dot
export GUM_SPIN_ALIGN := right

.PHONY: install build deploy

# Install dependencies
install: 
	@GUM_SPIN_TITLE="[cmd/radar] Workers Assets Gen" gum spin -- npm run assets
	@GUM_SPIN_TITLE="[cmd/radar] NPM install" gum spin -- npm install

# Build radar binary
build: install
	@GUM_SPIN_TITLE="[cmd/radar] Go Build WASM" gum spin -- npm run build

# Deploy radar
deploy:
	@npm run deploy
