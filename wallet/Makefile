# Wallet Makefile
# -----------------------------------------------

.PHONY: build

# Build the wallet module
build:
	@gum spin --title "[WALLET] Running tinygo build..." -- tinygo build -o plugin.wasm -target wasip1 -buildmode=c-shared .
	@gum log --level info --time kitchen "[WALLET] Completed tinygo build successfully."
