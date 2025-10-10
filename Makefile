.PHONY: help build test clean install build-worker build-vault test-worker test-vault test-crypto fmt lint

# Colors for output
BLUE := \033[0;34m
GREEN := \033[0;32m
YELLOW := \033[0;33m
RED := \033[0;31m
NC := \033[0m # No Color

# Go commands
GOCMD := go
GOBUILD := $(GOCMD) build
GOTEST := $(GOCMD) test
GOMOD := $(GOCMD) mod
GOFMT := $(GOCMD) fmt
GOVET := $(GOCMD) vet

# TinyGo commands (for WASM builds)
TINYGO := tinygo
TINYGO_TARGET := wasi
TINYGO_FLAGS := -opt=2 -scheduler=none -no-debug

# Directories
WORKER_DIR := cmd/worker
VAULT_DIR := cmd/vault
CRYPTO_DIR := crypto
BUILD_DIR := build
DIST_DIR := dist

# Output files
WORKER_WASM := $(BUILD_DIR)/worker.wasm
VAULT_WASM := $(BUILD_DIR)/vault.wasm
WORKER_OPTIMIZED := $(DIST_DIR)/worker.wasm
VAULT_OPTIMIZED := $(DIST_DIR)/vault.wasm

help: ## Show this help message
	@echo "$(BLUE)Motor (motr) - Build System$(NC)"
	@echo ""
	@echo "$(GREEN)Available targets:$(NC)"
	@grep -E '^[a-zA-Z_-]+:.*?## .*$$' $(MAKEFILE_LIST) | sort | awk 'BEGIN {FS = ":.*?## "}; {printf "  $(YELLOW)%-20s$(NC) %s\n", $$1, $$2}'
	@echo ""

build: build-worker build-vault ## Build all Go components (worker + vault)
	@echo "$(GREEN)✓ All components built successfully$(NC)"

build-worker: ## Build worker WASM module
	@echo "$(BLUE)Building worker WASM...$(NC)"
	@mkdir -p $(BUILD_DIR) $(DIST_DIR)
	@cd $(WORKER_DIR) && $(TINYGO) build $(TINYGO_FLAGS) -target $(TINYGO_TARGET) -o ../../$(WORKER_WASM) .
	@if command -v wasm-opt > /dev/null; then \
		echo "$(BLUE)Optimizing worker WASM...$(NC)"; \
		wasm-opt -O3 -o $(WORKER_OPTIMIZED) $(WORKER_WASM); \
	else \
		cp $(WORKER_WASM) $(WORKER_OPTIMIZED); \
	fi
	@cp $(WORKER_OPTIMIZED) packages/es/src/worker/app.wasm 2>/dev/null || true
	@echo "$(GREEN)✓ Worker WASM built: $(WORKER_OPTIMIZED)$(NC)"

build-vault: ## Build vault WASM module (Extism plugin)
	@echo "$(BLUE)Building vault WASM...$(NC)"
	@mkdir -p $(BUILD_DIR) $(DIST_DIR)
	@cd $(VAULT_DIR) && $(TINYGO) build $(TINYGO_FLAGS) -target $(TINYGO_TARGET) -o ../../$(VAULT_WASM) .
	@if command -v wasm-opt > /dev/null; then \
		echo "$(BLUE)Optimizing vault WASM...$(NC)"; \
		wasm-opt -O3 -o $(VAULT_OPTIMIZED) $(VAULT_WASM); \
	else \
		cp $(VAULT_WASM) $(VAULT_OPTIMIZED); \
	fi
	@if command -v extism > /dev/null; then \
		echo "$(BLUE)Compiling with Extism toolchain...$(NC)"; \
		extism compile $(VAULT_OPTIMIZED) -o $(DIST_DIR)/vault.plugin.wasm; \
	fi
	@cp $(VAULT_OPTIMIZED) packages/es/src/plugin/plugin.wasm 2>/dev/null || true
	@echo "$(GREEN)✓ Vault WASM built: $(VAULT_OPTIMIZED)$(NC)"

test: test-crypto test-worker test-vault ## Run all Go tests
	@echo "$(GREEN)✓ All tests completed$(NC)"

test-worker: ## Run worker tests
	@echo "$(BLUE)Testing worker...$(NC)"
	@cd $(WORKER_DIR) && $(GOTEST) -v -race -coverprofile=coverage.out ./...
	@echo "$(GREEN)✓ Worker tests passed$(NC)"

test-vault: ## Run vault tests
	@echo "$(BLUE)Testing vault...$(NC)"
	@cd $(VAULT_DIR) && $(GOTEST) -v -race -coverprofile=coverage.out ./...
	@echo "$(GREEN)✓ Vault tests passed$(NC)"

test-crypto: ## Run crypto library tests
	@echo "$(BLUE)Testing crypto library...$(NC)"
	@cd $(CRYPTO_DIR) && $(GOTEST) -v -race -coverprofile=coverage.out ./...
	@echo "$(GREEN)✓ Crypto tests passed$(NC)"

test-coverage: ## Run tests with coverage report
	@echo "$(BLUE)Generating coverage report...$(NC)"
	@cd $(CRYPTO_DIR) && $(GOTEST) -v -coverprofile=coverage.out -covermode=atomic ./...
	@cd $(WORKER_DIR) && $(GOTEST) -v -coverprofile=coverage.out -covermode=atomic ./...
	@cd $(VAULT_DIR) && $(GOTEST) -v -coverprofile=coverage.out -covermode=atomic ./...
	@echo "$(GREEN)✓ Coverage reports generated$(NC)"

bench: ## Run benchmarks
	@echo "$(BLUE)Running benchmarks...$(NC)"
	@cd $(CRYPTO_DIR) && $(GOTEST) -bench=. -benchmem ./...

fmt: ## Format Go code
	@echo "$(BLUE)Formatting Go code...$(NC)"
	@$(GOFMT) ./$(WORKER_DIR)/...
	@$(GOFMT) ./$(VAULT_DIR)/...
	@$(GOFMT) ./$(CRYPTO_DIR)/...
	@echo "$(GREEN)✓ Code formatted$(NC)"

lint: ## Lint Go code
	@echo "$(BLUE)Linting Go code...$(NC)"
	@$(GOVET) ./$(WORKER_DIR)/...
	@$(GOVET) ./$(VAULT_DIR)/...
	@$(GOVET) ./$(CRYPTO_DIR)/...
	@if command -v golangci-lint > /dev/null; then \
		golangci-lint run ./...; \
	fi
	@echo "$(GREEN)✓ Linting completed$(NC)"

mod-tidy: ## Tidy Go modules
	@echo "$(BLUE)Tidying Go modules...$(NC)"
	@cd $(WORKER_DIR) && $(GOMOD) tidy
	@cd $(VAULT_DIR) && $(GOMOD) tidy
	@cd $(CRYPTO_DIR) && $(GOMOD) tidy 2>/dev/null || true
	@echo "$(GREEN)✓ Go modules tidied$(NC)"

mod-download: ## Download Go module dependencies
	@echo "$(BLUE)Downloading Go modules...$(NC)"
	@cd $(WORKER_DIR) && $(GOMOD) download
	@cd $(VAULT_DIR) && $(GOMOD) download
	@echo "$(GREEN)✓ Go modules downloaded$(NC)"

clean: ## Clean build artifacts
	@echo "$(BLUE)Cleaning build artifacts...$(NC)"
	@rm -rf $(BUILD_DIR) $(DIST_DIR)
	@rm -f $(WORKER_DIR)/coverage.out
	@rm -f $(VAULT_DIR)/coverage.out
	@rm -f $(CRYPTO_DIR)/coverage.out
	@rm -f packages/es/src/worker/app.wasm
	@rm -f packages/es/src/plugin/plugin.wasm
	@echo "$(GREEN)✓ Clean complete$(NC)"

install: ## Install required tools
	@echo "$(BLUE)Installing required tools...$(NC)"
	@echo "$(YELLOW)Installing TinyGo...$(NC)"
	@command -v tinygo > /dev/null || echo "Please install TinyGo: https://tinygo.org/getting-started/install/"
	@echo "$(YELLOW)Installing wasm-opt (optional, for optimization)...$(NC)"
	@command -v wasm-opt > /dev/null || echo "Optional: Install Binaryen for wasm-opt: https://github.com/WebAssembly/binaryen"
	@echo "$(YELLOW)Installing Extism (optional, for vault)...$(NC)"
	@command -v extism > /dev/null || echo "Optional: Install Extism CLI: https://extism.org/"
	@echo "$(GREEN)✓ Tool check complete$(NC)"

# Development targets
dev: ## Start frontend development server (port 3000)
	@echo "$(BLUE)Starting frontend development server...$(NC)"
	@cd apps/frontend && pnpm dev

dev-build: ## Build frontend for development
	@echo "$(BLUE)Building frontend...$(NC)"
	@cd apps/frontend && pnpm build
	@echo "$(GREEN)✓ Frontend built$(NC)"

dev-preview: ## Preview frontend production build
	@echo "$(BLUE)Starting frontend preview server...$(NC)"
	@cd apps/frontend && pnpm serve

dev-deploy: ## Deploy frontend to Cloudflare Workers
	@echo "$(BLUE)Deploying frontend...$(NC)"
	@cd apps/frontend && pnpm deploy
	@echo "$(GREEN)✓ Frontend deployed$(NC)"

version: ## Display version information
	@echo "$(BLUE)Motor (motr) Build System$(NC)"
	@echo "Go version: $$(go version)"
	@command -v tinygo > /dev/null && echo "TinyGo version: $$(tinygo version)" || echo "TinyGo: not installed"
	@command -v wasm-opt > /dev/null && echo "wasm-opt: installed" || echo "wasm-opt: not installed"
	@command -v extism > /dev/null && echo "Extism: installed" || echo "Extism: not installed"

.DEFAULT_GOAL := help
