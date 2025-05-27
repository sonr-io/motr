ROOT_DIR := $(shell git rev-parse --show-toplevel)

.PHONY: clean start build deploy tidy-cmd tidy-root gen-templ gen-sqlc db-migrate migrate-d1

# Remove build artifacts
clean: tidy-cmd tidy-root

# Build the binary
build:
	cd $(ROOT_DIR)/cmd && bun run build

# Deploy the vault
deploy:
	cd $(ROOT_DIR)/cmd && bun run deploy

