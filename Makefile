.PHONY: help dev build wasm preview deploy test bench fmt lint clean install

# Colors
BLUE := \033[0;34m
GREEN := \033[0;32m
YELLOW := \033[0;33m
RED := \033[0;31m
NC := \033[0m

# Commands
GOCMD := go
TINYGO := tinygo
TINYGO_FLAGS := -opt=2 -scheduler=none -no-debug

# Directories
BUILD_DIR := build
DIST_DIR := dist

.DEFAULT_GOAL := help

help: ## Show available commands
	@echo "$(BLUE)Motor - Build System$(NC)"
	@echo ""
	@echo "$(GREEN)Development:$(NC)"
	@grep -E '^(dev|preview|deploy):.*?## .*$$' $(MAKEFILE_LIST) | awk 'BEGIN {FS = ":.*?## "}; {printf "  $(YELLOW)%-15s$(NC) %s\n", $$1, $$2}'
	@echo ""
	@echo "$(GREEN)Build:$(NC)"
	@grep -E '^(build|wasm):.*?## .*$$' $(MAKEFILE_LIST) | awk 'BEGIN {FS = ":.*?## "}; {printf "  $(YELLOW)%-15s$(NC) %s\n", $$1, $$2}'
	@echo ""
	@echo "$(GREEN)Quality:$(NC)"
	@grep -E '^(test|bench|fmt|lint):.*?## .*$$' $(MAKEFILE_LIST) | awk 'BEGIN {FS = ":.*?## "}; {printf "  $(YELLOW)%-15s$(NC) %s\n", $$1, $$2}'
	@echo ""
	@echo "$(GREEN)Utilities:$(NC)"
	@grep -E '^(clean|install):.*?## .*$$' $(MAKEFILE_LIST) | awk 'BEGIN {FS = ":.*?## "}; {printf "  $(YELLOW)%-15s$(NC) %s\n", $$1, $$2}'
	@echo ""

# Development
dev: ## Start frontend dev server on :3000
	@echo "$(BLUE)Starting dev server on http://localhost:3000$(NC)"
	@cd apps/frontend && pnpm dev

preview: ## Preview production build
	@echo "$(BLUE)Starting preview server...$(NC)"
	@cd apps/frontend && pnpm serve

deploy: ## Deploy to Cloudflare Workers
	@echo "$(BLUE)Deploying to Cloudflare...$(NC)"
	@cd apps/frontend && pnpm deploy
	@echo "$(GREEN)✓ Deployed$(NC)"

# Build
build: wasm ## Build everything (WASM + frontend)
	@echo "$(BLUE)Building frontend...$(NC)"
	@cd apps/frontend && pnpm build
	@echo "$(GREEN)✓ Build complete$(NC)"

wasm: ## Build WASM modules (worker + vault)
	@echo "$(BLUE)Building WASM modules...$(NC)"
	@mkdir -p $(BUILD_DIR) $(DIST_DIR)
	@$(MAKE) -s .build-worker
	@$(MAKE) -s .build-vault
	@echo "$(GREEN)✓ WASM modules built$(NC)"

.build-worker:
	@echo "$(BLUE)  → worker.wasm$(NC)"
	@cd cmd/worker && $(TINYGO) build $(TINYGO_FLAGS) -target wasi -o ../../$(BUILD_DIR)/worker.wasm .
	@if command -v wasm-opt > /dev/null; then \
		wasm-opt -O3 -o $(DIST_DIR)/worker.wasm $(BUILD_DIR)/worker.wasm 2>/dev/null; \
	else \
		cp $(BUILD_DIR)/worker.wasm $(DIST_DIR)/worker.wasm; \
	fi
	@cp $(DIST_DIR)/worker.wasm packages/es/src/worker/app.wasm 2>/dev/null || true

.build-vault:
	@echo "$(BLUE)  → vault.wasm$(NC)"
	@cd cmd/vault && $(TINYGO) build $(TINYGO_FLAGS) -target wasi -o ../../$(BUILD_DIR)/vault.wasm .
	@if command -v wasm-opt > /dev/null; then \
		wasm-opt -O3 -o $(DIST_DIR)/vault.wasm $(BUILD_DIR)/vault.wasm 2>/dev/null; \
	else \
		cp $(BUILD_DIR)/vault.wasm $(DIST_DIR)/vault.wasm; \
	fi
	@if command -v extism > /dev/null; then \
		extism compile $(DIST_DIR)/vault.wasm -o $(DIST_DIR)/vault.plugin.wasm 2>/dev/null; \
	fi
	@cp $(DIST_DIR)/vault.wasm packages/es/src/plugin/plugin.wasm 2>/dev/null || true

# Quality
test: ## Run all tests
	@echo "$(BLUE)Running tests...$(NC)"
	@cd crypto && $(GOCMD) test -v -race ./...
	@cd cmd/worker && $(GOCMD) test -v -race ./...
	@cd cmd/vault && $(GOCMD) test -v -race ./...
	@echo "$(GREEN)✓ Tests passed$(NC)"

bench: ## Run benchmarks
	@echo "$(BLUE)Running benchmarks...$(NC)"
	@cd crypto && $(GOCMD) test -bench=. -benchmem ./...

fmt: ## Format code
	@echo "$(BLUE)Formatting code...$(NC)"
	@$(GOCMD) fmt ./cmd/... ./crypto/...
	@pnpm format
	@echo "$(GREEN)✓ Formatted$(NC)"

lint: ## Lint code
	@echo "$(BLUE)Linting code...$(NC)"
	@$(GOCMD) vet ./cmd/... ./crypto/...
	@if command -v golangci-lint > /dev/null; then golangci-lint run ./...; fi
	@pnpm lint
	@echo "$(GREEN)✓ Linted$(NC)"

# Utilities
clean: ## Clean build artifacts
	@echo "$(BLUE)Cleaning...$(NC)"
	@rm -rf $(BUILD_DIR) $(DIST_DIR)
	@rm -f cmd/*/coverage.out crypto/coverage.out
	@rm -f packages/es/src/worker/app.wasm packages/es/src/plugin/plugin.wasm
	@echo "$(GREEN)✓ Cleaned$(NC)"

install: ## Install required tools
	@echo "$(BLUE)Required tools:$(NC)"
	@echo "  • TinyGo: https://tinygo.org"
	@echo "  • Binaryen (wasm-opt): https://github.com/WebAssembly/binaryen"
	@echo "  • Extism: https://extism.org"
	@echo ""
	@command -v tinygo > /dev/null && echo "$(GREEN)✓ TinyGo installed$(NC)" || echo "$(RED)✗ TinyGo missing$(NC)"
	@command -v wasm-opt > /dev/null && echo "$(GREEN)✓ wasm-opt installed$(NC)" || echo "$(YELLOW)○ wasm-opt optional$(NC)"
	@command -v extism > /dev/null && echo "$(GREEN)✓ Extism installed$(NC)" || echo "$(YELLOW)○ Extism optional$(NC)"
