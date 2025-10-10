# Migration to Fully pnpm-Based Monorepo

## Summary

The Motor repository has been successfully converted to a **fully pnpm-based monorepo**. All build operations now use pnpm scripts, with devbox providing system dependencies.

## Changes Made

### 1. Fixed Vite Config Import Error

**Problem**: `apps/frontend/vite.config.ts` was using default import for `esPlugin`, but the module only exports a named export.

**Solution**: Changed from `import esPlugin from '@sonr.io/es/vite'` to `import { esPlugin } from '@sonr.io/es/vite'`

### 2. Repository Structure

The repository maintains separation between command-line tools and TypeScript packages:

- **`cmd/enclave/`**: WASM vault (hybrid Go + TypeScript package `@sonr.io/enclave`)
- **`cmd/vault/`**: HTTP payment gateway server (Go only)
- **`packages/`**: Pure TypeScript packages (es, ui, do)
- **`apps/`**: Frontend applications

This structure keeps Go-heavy components in `cmd/` while TypeScript-only packages stay in `packages/`.

### 3. Updated Package Scripts

#### `cmd/enclave/package.json`

Removed devbox dependency from scripts. Now uses direct pnpm/TinyGo commands:

```json
{
  "scripts": {
    "build": "pnpm run build:wasm && tsc --declaration --emitDeclarationOnly",
    "build:wasm": "GOOS=wasip1 GOARCH=wasm tinygo build -o dist/enclave.wasm -target=wasi -no-debug -opt=2 -scheduler=none main.go",
    "build:wasm:optimized": "pnpm run build:wasm && wasm-opt -O3 -o dist/enclave.wasm dist/enclave.wasm",
    "watch": "tsc --watch --declaration --emitDeclarationOnly",
    "test": "go test -v ./...",
    "lint": "go fmt ./..."
  }
}
```

#### Root `package.json`

Added comprehensive pnpm scripts to replace Makefile:

```json
{
  "scripts": {
    "build": "turbo run build",
    "build:enclave": "pnpm --filter '@sonr.io/enclave' build",
    "build:es": "pnpm --filter '@sonr.io/es' build",
    "build:ui": "pnpm --filter '@sonr.io/ui' build",
    "build:frontend": "pnpm --filter 'frontend' build",
    "test": "turbo run test",
    "test:enclave": "pnpm --filter '@sonr.io/enclave' test",
    "test:es": "pnpm --filter '@sonr.io/es' test",
    "dev": "turbo run dev --filter=frontend",
    "lint:go": "cd cmd/enclave && go fmt ./...",
    "format:all": "pnpm format && pnpm lint:go",
    "clean:dist": "rm -rf dist build packages/*/dist apps/*/dist cmd/*/dist"
  }
}
```

### 4. Updated turbo.json

Added proper WASM build tasks:

```json
{
  "@sonr.io/enclave#build": {
    "dependsOn": [],
    "outputs": ["dist/**", "*.tsbuildinfo"],
    "inputs": ["src/**/*.ts", "main.go", "**/*.go", "go.mod", "go.sum", "tsconfig.json", "package.json"],
    "cache": true
  },
  "@sonr.io/enclave#build:wasm": {
    "dependsOn": [],
    "outputs": ["dist/enclave.wasm"],
    "inputs": ["main.go", "**/*.go", "go.mod", "go.sum"],
    "cache": true
  }
}
```

### 5. Updated devbox.json

Simplified scripts to call pnpm:

```json
{
  "shell": {
    "init_hook": [
      "...",
      "pnpm install"
    ],
    "scripts": {
      "build": "pnpm build",
      "test": "pnpm test",
      "build:enclave": "pnpm build:enclave",
      "dev": "pnpm dev",
      "format": "pnpm format:all",
      "lint": "pnpm lint && pnpm lint:go"
    }
  }
}
```

### 6. Updated CLAUDE.md

Complete rewrite to reflect the new pnpm-centric workflow with:
- Comprehensive command reference
- Architecture documentation
- Troubleshooting guide
- Development workflows

## Usage

### Development

```bash
# Enter devbox shell (provides TinyGo, Go, Node.js, pnpm)
devbox shell

# Build everything
pnpm build

# Build specific packages
pnpm build:enclave    # WASM + TypeScript
pnpm build:es         # ES SDK
pnpm build:frontend   # Frontend app

# Development server
pnpm dev              # Starts frontend on :3000

# Testing
pnpm test             # All tests
pnpm test:enclave     # Go tests
pnpm test:es          # Vitest tests
```

### Without Devbox

If you have Go, TinyGo, and Node.js already installed:

```bash
pnpm install
pnpm build
pnpm dev
```

## Benefits

1. **Pure pnpm workflow**: All commands use pnpm, making it familiar for Node.js developers
2. **Better caching**: Turborepo caches WASM builds based on Go file changes
3. **Clearer dependencies**: Build order enforced by turbo.json
4. **Simpler CI/CD**: Single `pnpm build` command instead of mix of Make + pnpm
5. **Better IDE integration**: Standard pnpm scripts work with IDE task runners
6. **Logical separation**: Go-heavy tools in `cmd/`, TypeScript packages in `packages/`

## Breaking Changes

### For Developers

1. **Must use devbox shell** or have TinyGo installed locally for WASM builds
2. **Makefile is deprecated** - use pnpm scripts instead
   - `make build-worker` → `pnpm build:enclave`
   - `make dev` → `pnpm dev`
   - `make test` → `pnpm test`
3. **Import change required** in `apps/frontend/vite.config.ts`:
   - Change `import esPlugin from '@sonr.io/es/vite'`
   - To `import { esPlugin } from '@sonr.io/es/vite'`

### For CI/CD

Update build commands:

```yaml
# Old
- make build
- make test

# New
- pnpm install
- pnpm build
- pnpm test
```

## Directory Structure Rationale

The repository keeps `@sonr.io/enclave` in `cmd/` rather than `packages/` because:

1. **Go-first package**: Primarily a Go WASM module with TypeScript as a wrapper
2. **Consistency**: Matches `cmd/vault` which is also Go-based
3. **Separation of concerns**: `cmd/` for executable/WASM binaries, `packages/` for pure libraries
4. **Build tooling**: Both use Go build tools (TinyGo for enclave, standard Go for vault)

The pnpm workspace configuration includes both `cmd/*` and `packages/*`, so both work seamlessly with pnpm/Turborepo.

## Next Steps

1. Update CI/CD pipelines to use `pnpm build` instead of `make build`
2. Remove Makefile (or mark as deprecated)
3. Update contributor documentation
4. Test devbox build once Nix cache issue is resolved
5. Consider adding `pnpm build:watch` for continuous WASM rebuilds during development

## Known Issues

1. **Devbox Nix cache error**: There's currently a hash mismatch for the commitizen package in Nix. This doesn't affect functionality if you don't use `devbox run build`. Use `pnpm build` directly from within `devbox shell` instead.

2. **WASM build requires TinyGo**: The enclave package needs TinyGo installed. Use devbox shell or install TinyGo manually.

## Rollback Plan

If issues arise, the Makefile still exists and can be used:

```bash
make build
make dev
```

However, the vite config import must remain as a named import (`import { esPlugin }`).
