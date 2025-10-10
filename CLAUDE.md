# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

Motor (motr) is a WebAssembly-based cryptographic vault and payment service for the Sonr ecosystem. It provides:
- **WASM Enclave** (`@sonr.io/enclave`): Cryptographic vault operations via Extism plugin
- **TypeScript SDK** (`@sonr.io/es`): Browser and Node.js client libraries
- **UI Components** (`@sonr.io/ui`): React UI components
- **Frontend App**: TanStack-based web application

The project is a **fully pnpm-based monorepo** managed with Turborepo and devbox.

## Development Environment

**CRITICAL**: This project uses **devbox** for dependency management and **pnpm** for all build operations.

```bash
# Enter devbox shell (provides Go, TinyGo, Node.js, pnpm, etc.)
devbox shell

# All commands should be run via pnpm (devbox scripts are thin wrappers)
pnpm build          # Build all packages
pnpm dev            # Start frontend dev server
pnpm test           # Run all tests

# Or via devbox (which calls pnpm internally)
devbox run build
devbox run dev
```

**Required Tools** (provided by devbox):
- Go 1.24.4+
- TinyGo (for WASM compilation)
- Node.js 20+
- pnpm 10.14.0+
- wasm-opt (optional, for WASM optimization)

## Repository Structure

```
motr/
├── packages/
│   ├── enclave/        # @sonr.io/enclave - WASM vault (Go + TypeScript)
│   ├── es/             # @sonr.io/es - Core SDK
│   ├── ui/             # @sonr.io/ui - React components
│   └── do/             # @sonr.io/do - Durable Objects
├── apps/
│   └── frontend/       # React frontend application
├── cmd/
│   └── vault/          # HTTP payment gateway server (separate from WASM)
└── [config files]
```

## Common Commands

All commands use **pnpm** exclusively. The Makefile is deprecated.

### Building

```bash
# Build everything (WASM + all TypeScript packages)
pnpm build                  # Via Turborepo, respects dependencies

# Build specific packages
pnpm build:enclave          # Build WASM + TypeScript for enclave
pnpm build:es               # Build ES SDK
pnpm build:ui               # Build UI components
pnpm build:frontend         # Build frontend app

# Build only WASM (within enclave package)
cd packages/enclave && pnpm build:wasm
cd packages/enclave && pnpm build:wasm:optimized  # With wasm-opt
```

### Development

```bash
# Start frontend dev server (automatically builds @sonr.io/es first)
pnpm dev                    # Port 3000
pnpm dev:frontend          # Same as above

# Watch mode for enclave TypeScript (WASM must be rebuilt manually)
cd packages/enclave && pnpm watch
```

### Testing

```bash
# Run all tests
pnpm test                   # All packages via Turborepo

# Test specific packages
pnpm test:enclave           # Go tests for enclave
pnpm test:es                # Vitest for ES package
pnpm test:ui                # Vitest for UI package
```

### Code Quality

```bash
# Format and lint
pnpm format                 # Format TypeScript with Biome
pnpm lint:go                # Format Go code
pnpm format:all             # Format both TypeScript and Go

pnpm lint                   # Lint TypeScript with Biome
pnpm check                  # Biome check with auto-fix

# Type checking
pnpm typecheck              # Type check all TypeScript packages
```

### Cleaning

```bash
pnpm clean                  # Clean all build artifacts via Turborepo
pnpm clean:dist             # Remove all dist/ and build/ directories
cd packages/enclave && pnpm clean  # Clean enclave only
```

### Other

```bash
pnpm gen:protobufs          # Regenerate protobuf types for @sonr.io/es
```

## Architecture

### Monorepo Structure

- **Package Manager**: pnpm with workspaces
- **Build Orchestration**: Turborepo
- **Code Quality**: Biome (linting + formatting)
- **Dependency Management**: devbox (system dependencies)

### Build Dependencies

Critical dependency chain (enforced by `turbo.json`):

1. `@sonr.io/enclave` builds first
   - Go WASM compilation: `main.go` → `dist/enclave.wasm`
   - TypeScript compilation: `src/**/*.ts` → `dist/**/*.js`
2. `@sonr.io/es` depends on `@sonr.io/enclave`
3. `@sonr.io/ui` builds independently
4. `frontend` depends on both `@sonr.io/es` and `@sonr.io/ui`

### WASM Build Pipeline (Enclave Package)

1. **Go → WASM**: TinyGo compiles with WASI target
   ```bash
   GOOS=wasip1 GOARCH=wasm tinygo build -o dist/enclave.wasm \
     -target=wasi -no-debug -opt=2 -scheduler=none main.go
   ```

2. **Optimization** (optional): wasm-opt for size/speed
   ```bash
   wasm-opt -O3 -o dist/enclave.wasm dist/enclave.wasm
   ```

3. **TypeScript**: Compile TypeScript wrapper and types
   ```bash
   tsc --declaration --emitDeclarationOnly
   ```

4. **Output**:
   - `dist/enclave.wasm` - WASM binary
   - `dist/index.js` - TypeScript loader
   - `dist/vite-plugin-enclave.js` - Vite plugin
   - `dist/**/*.d.ts` - Type definitions

### TypeScript Package Structure

#### `@sonr.io/enclave`

Hybrid Go/TypeScript package providing the vault WASM plugin.

- **Location**: `packages/enclave/`
- **Exports**:
  - `.` - Main loader and utilities
  - `./loader` - WASM loader
  - `./vite-plugin` - Vite integration plugin
  - `./dist/enclave.wasm` - Direct WASM access

#### `@sonr.io/es`

Core SDK with subpath exports only (no default export from root).

- **Location**: `packages/es/`
- **Key Exports**:
  - `@sonr.io/es/client` - Blockchain client and vault operations
  - `@sonr.io/es/codec` - Encoding/decoding utilities
  - `@sonr.io/es/wallet` - Wallet integrations
  - `@sonr.io/es/vite` - Vite plugin (exports `esPlugin` as named export)
  - `@sonr.io/es/plugin` - WASM plugin management
  - `@sonr.io/es/worker` - Service worker integration
  - `@sonr.io/es/registry` - Chain registry
  - `@sonr.io/es/protobufs` - Generated protobuf types
  - `@sonr.io/es/ipfs` - IPFS/Helia integration

#### `@sonr.io/ui`

React UI components using shadcn/ui.

- **Location**: `packages/ui/`

#### `frontend`

TanStack-based React application.

- **Location**: `apps/frontend/`
- **Tech Stack**: React 19, Vite, Tailwind 4, TanStack Router/Query

## Important Notes

### Enclave (WASM Vault) Package

The enclave package is a **hybrid Go/TypeScript package**:
- Go code provides cryptographic operations compiled to WASM
- TypeScript provides loader, types, and Vite plugin
- Both must be built together via `pnpm build`

**WASM Exports** (from Go):
- `generate` - Create new MPC enclave
- `sign` - Sign messages
- `verify` - Verify signatures
- `export` - Export vault to IPFS
- `import` - Import vault from IPFS
- `sign_cosmos_transaction` - Cosmos SDK signing
- `sign_evm_transaction` - EVM signing
- And more (see packages/enclave/README.md)

### Module Resolution

**CRITICAL**: Always use **subpath imports** for `@sonr.io/es`:

```typescript
// ✅ CORRECT
import { createVaultClient } from '@sonr.io/es/client'
import { esPlugin } from '@sonr.io/es/vite'  // Named export, NOT default
import { bech32 } from '@sonr.io/es/codec'

// ❌ WRONG - will fail
import { createVaultClient } from '@sonr.io/es'
import esPlugin from '@sonr.io/es/vite'  // No default export
```

### Vite Configuration

When using `@sonr.io/es` with Vite (frontend app), use the named export:

```typescript
import { esPlugin } from '@sonr.io/es/vite'

export default defineConfig({
  plugins: [esPlugin({ configureWasm: false })],
})
```

### Shadcn Components

Add new UI components to `apps/frontend`:

```bash
cd apps/frontend
pnpx shadcn@latest add <component-name>
```

### Protobuf Generation

Regenerate TypeScript types from protobufs:

```bash
pnpm gen:protobufs
# Runs: pnpm --filter '@sonr.io/es' gen:protobufs
```

### TypeScript Configuration

All packages require `moduleResolution: "bundler"` in tsconfig.json for proper ESM support.

## Development Workflow

### Making Changes to Enclave (WASM)

1. Modify Go code in `packages/enclave/*.go`
2. Rebuild WASM and TypeScript:
   ```bash
   pnpm build:enclave
   # Or within package:
   cd packages/enclave
   pnpm build
   ```
3. Rebuild dependent packages:
   ```bash
   pnpm build:es          # ES SDK depends on enclave
   pnpm build:frontend    # Frontend depends on ES
   ```
4. Or rebuild everything:
   ```bash
   pnpm build
   ```

### Making Changes to TypeScript SDK

1. Modify code in `packages/es/src/`
2. Rebuild:
   ```bash
   pnpm build:es
   # Turborepo will cache if no changes
   ```
3. Changes picked up automatically by frontend via workspace dependency

### Adding New Enclave Operations

1. Add Go function with `//go:wasmexport` to `packages/enclave/main.go`
2. Rebuild WASM: `cd packages/enclave && pnpm build:wasm`
3. Update TypeScript types if needed in `src/index.ts`
4. Build full package: `pnpm build:enclave`
5. Update SDK wrapper in `packages/es/src/client/` if needed

## Deployment

### Frontend to Cloudflare

```bash
cd apps/frontend
pnpm deploy
# Uses: wrangler deploy
```

### NPM Publishing

```bash
# Publish individual packages (enclave is private)
cd packages/es && pnpm publish
cd packages/ui && pnpm publish
```

## Troubleshooting

### Build Failures

**Enclave WASM build fails**:
- Ensure you're in devbox shell: `devbox shell`
- Check TinyGo is available: `which tinygo`
- Verify Go version: `go version` (should be 1.24.4+)

**TypeScript build fails**:
- Check enclave built first: `pnpm build:enclave`
- Clear Turborepo cache: `rm -rf .turbo`
- Rebuild all: `pnpm build --force`

**Import errors**:
- Verify subpath imports (e.g., `@sonr.io/es/client`, not `@sonr.io/es`)
- Check `moduleResolution: "bundler"` in tsconfig.json
- Ensure you're using named import for esPlugin: `import { esPlugin }` not `import esPlugin`

### Development Server Issues

**Frontend won't start**:
- Build dependencies first: `pnpm build:enclave && pnpm build:es`
- Check port 3000 is available
- Clear node_modules and reinstall: `rm -rf node_modules && pnpm install`

**WASM not loading**:
- Verify WASM file exists: `ls packages/enclave/dist/enclave.wasm`
- Rebuild enclave: `pnpm build:enclave`
- Check browser console for errors

**Hot reload not working for WASM changes**:
- WASM changes require manual rebuild: `pnpm build:enclave`
- Then refresh browser or restart dev server

### Workspace Issues

**Package not found**:
- Run `pnpm install` at root
- Check `pnpm-workspace.yaml` includes the package directory
- Verify package name in `package.json` matches import

## Additional Resources

- **Enclave README**: `packages/enclave/README.md` - Complete WASM API documentation
- **ES README**: `packages/es/README.md` - Comprehensive SDK guide and examples
- **MIGRATION.md**: Detailed architecture and component descriptions
- **README.md**: Quick start and overview
