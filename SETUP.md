# Sonr Motor Setup Guide

## Current Status

### ✅ Completed Optimizations

1. **Makefile Refactored** - Clean, intuitive commands
2. **Frontend App** - Minimal TanStack Query app with `@sonr.io/es` and `@sonr.io/ui`
3. **Package Structure** - Optimized `@sonr.io/es` package.json
4. **Vite Configuration** - Proper bundling setup

### ⚠️ Protobuf Generation Issue

The `@sonr.io/es` package requires generated Protocol Buffer files that are currently missing. This blocks the build.

## Problem Analysis

**Root Cause**: The `gen-protobufs.mjs` script uses `degit` which fails to clone some repositories. The package was configured to exclude `cosmos-sdk` and `cometbft` with a comment about "pre-generated" files, but these files don't actually exist.

**Missing Files**:
- `packages/es/src/protobufs/cosmos/*`
- `packages/es/src/protobufs/tendermint/*`
- Index file to export all protobufs

## Solutions

### Option 1: Manual Protobuf Generation (Recommended)

```bash
cd packages/es

# Create temp directory
mkdir -p .tmp && cd .tmp

# Clone required repos
git clone --depth 1 --branch v0.50.10 https://github.com/cosmos/cosmos-sdk.git
git clone --depth 1 --branch v0.38.12 https://github.com/cometbft/cometbft.git
git clone --depth 1 --branch v8.5.1 https://github.com/cosmos/ibc-go.git
git clone --depth 1 https://github.com/sonr-io/sonr.git
git clone --depth 1 --branch v0.53.0 https://github.com/CosmWasm/wasmd.git
git clone --depth 1 --branch v27.0.0 https://github.com/osmosis-labs/osmosis.git
git clone --depth 1 --branch v0.22.0 https://github.com/evmos/ethermint.git

# Generate protobufs
cd ..
mkdir -p src/protobufs

pnpm buf generate .tmp/cosmos-sdk/proto --output src/protobufs
pnpm buf generate .tmp/cometbft/proto --output src/protobufs
pnpm buf generate .tmp/ibc-go/proto --output src/protobufs
pnpm buf generate .tmp/sonr/proto --output src/protobufs/sonr
pnpm buf generate .tmp/wasmd/proto --output src/protobufs
pnpm buf generate .tmp/osmosis/proto --output src/protobufs
pnpm buf generate .tmp/ethermint/proto --output src/protobufs

# Generate registry
pnpm gen:registry

# Cleanup
rm -rf .tmp

# Build package
pnpm build
```

### Option 2: Use Pre-built Package

If available, copy pre-built `dist/` from a working environment to `packages/es/dist/`.

### Option 3: Fix degit Script

Replace `degit` with direct `git clone` in `scripts/gen-protobufs.mjs`:

```javascript
// Instead of: await degit(repo).clone(dir)
// Use: spawnSync('git', ['clone', '--depth', '1', '--branch', ref, repo, dir])
```

## Development Workflow

Once protobufs are generated:

```bash
# Start development
make dev              # Frontend dev server on :3000

# Build everything
make build           # WASM + frontend

# Quality checks
make test            # Run tests
make lint            # Lint code
make fmt             # Format code

# Utilities
make clean           # Clean artifacts
make install         # Check tools
```

## Package Structure

### @sonr.io/es
```
packages/es/
├── src/
│   ├── client/          # RPC client & APIs
│   ├── wallet/          # Wallet integrations
│   ├── protobufs/       # Generated proto files ⚠️ MISSING
│   └── index.ts
└── package.json         # Optimized dependencies
```

### apps/frontend
```
apps/frontend/
├── src/
│   ├── components/      # UI components (AccountInfo, BalanceInfo)
│   ├── queries/         # TanStack Query hooks
│   ├── lib/             # RPC client setup
│   └── routes/          # File-based routing
└── vite.config.ts       # Optimized for monorepo
```

## Key Improvements Made

### 1. Makefile - Simple DX
```makefile
make dev      # Start dev server
make build    # Build everything
make wasm     # Build WASM only
make test     # Run tests
make clean    # Clean up
```

### 2. Package.json - Streamlined
- Core crypto as `peerDependencies`
- Essential deps only in `dependencies`
- Heavy IPFS/P2P moved to `optionalDependencies`
- Cleaned up exports to essential paths

### 3. Frontend - Minimal & Focused
- Removed all demo components
- Clean integration examples
- Reusable TanStack Query hooks
- Proper TypeScript types

### 4. Vite Config - Optimized
```typescript
optimizeDeps: {
  exclude: ['@sonr.io/es'],  // Avoid protobuf bundling issues
  include: ['@sonr.io/ui'],
}
```

## Next Steps

1. **Generate Protobufs** (use Option 1 above)
2. **Build Package**: `pnpm --filter '@sonr.io/es' build`
3. **Start Dev**: `make dev`
4. **Test Build**: `make build`

## Environment Setup

Required tools:
- **Node.js** >= 20.0.0
- **pnpm** >= 10.0.0
- **TinyGo** (for WASM builds)
- **buf** (for protobuf generation)

Optional:
- **wasm-opt** (Binaryen) for optimization
- **extism** for vault builds

Check tools: `make install`
