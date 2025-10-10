# Motor (motr)

> Multi-purpose WebAssembly service providing secure cryptographic vault operations and payment processing for the Sonr ecosystem.

[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)
[![Go Version](https://img.shields.io/badge/Go-1.24.4+-00ADD8?logo=go)](https://go.dev/)
[![TinyGo](https://img.shields.io/badge/TinyGo-0.39+-00ADD8?logo=go)](https://tinygo.org/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.0+-3178C6?logo=typescript)](https://www.typescriptlang.org/)

## Overview

Motor (motr) is a comprehensive WebAssembly-based service that provides:

1. **Worker**: WASM-based cryptographic vault operations (formerly "vault")
2. **Vault**: Extism plugin for secure key management and multi-party computation
3. **TypeScript SDK**: Browser and Node.js client libraries
4. **Frontend App**: TanStack-based web application

The name "Motor" reflects its role as the execution engine powering secure operations in the Sonr ecosystem.

## Repository Structure

```
sonr-io/motr/
├── cmd/                    # Go commands
│   ├── worker/            # WASM worker (HTTP server, payment gateway)
│   └── vault/             # WASM vault (Extism plugin, crypto operations)
│
├── crypto/                # Cryptographic library (Go)
│   ├── core/             # Core primitives
│   ├── signatures/       # BLS, BBS+, Schnorr
│   ├── sharing/          # Shamir, Feldman VSS
│   ├── mpc/              # Multi-party computation
│   ├── tecdsa/           # Threshold ECDSA
│   └── zkp/              # Zero-knowledge proofs
│
├── packages/             # TypeScript packages
│   ├── es/              # @sonr.io/es - Core SDK
│   ├── ui/              # @sonr.io/ui - UI components
│   └── do/              # @sonr.io/do - Durable Objects
│
├── apps/                # Applications
│   └── frontend/        # TanStack React frontend
│
├── docs/                # Documentation
├── Makefile            # Build automation
├── package.json        # Root package config
├── turbo.json          # Turborepo config
└── .goreleaser.yml     # Release automation
```

## Quick Start

### Prerequisites

- **Go** 1.24.4+ ([install](https://go.dev/dl/))
- **TinyGo** 0.39+ ([install](https://tinygo.org/getting-started/install/))
- **Node.js** 20+ ([install](https://nodejs.org/))
- **pnpm** 10+ ([install](https://pnpm.io/installation))

### Installation

```bash
# Clone the repository
git clone https://github.com/sonr-io/motr.git
cd motr

# Install dependencies
pnpm install

# Build all components
make build        # Build Go/WASM components
pnpm build       # Build TypeScript packages
```

### Development

```bash
# Start frontend development server
make dev

# Build worker WASM
make build-worker

# Build vault WASM
make build-vault

# Run tests
make test        # Go tests
pnpm test       # TypeScript tests

# Format and lint
make fmt         # Format Go code
pnpm format     # Format TypeScript
```

## Components

### 1. Worker (WASM)

HTTP server and payment gateway running as WebAssembly:

- **Technology**: Go → WASM via TinyGo
- **Runtime**: Browser service worker or Node.js
- **Features**:
  - W3C Payment Handler API
  - OIDC authorization server
  - HTTP request handling
  - Secure payment processing

```bash
# Build worker
make build-worker

# Output: dist/worker/worker.optimized.wasm
```

### 2. Vault (WASM)

Cryptographic vault operations with Extism plugin:

- **Technology**: Go → WASM via TinyGo + Extism
- **Runtime**: Extism (cross-platform)
- **Features**:
  - MPC enclave management
  - Multi-chain transaction signing
  - WebAuthn integration
  - IPFS import/export

```bash
# Build vault
make build-vault

# Output: dist/vault/vault.plugin.wasm
```

**Key Exports**:
- `generate`: Create new MPC enclave
- `sign`: Sign transactions/messages
- `verify`: Verify signatures
- `export`/`import`: IPFS vault management
- `sign_cosmos_transaction`: Cosmos SDK signing
- `sign_evm_transaction`: Ethereum/EVM signing

### 3. Crypto Library

Comprehensive cryptographic primitives in Go:

- **Curves**: Ed25519, Secp256k1, P-256, BLS12-381, Pallas/Vesta
- **Signatures**: BLS, BBS+, Schnorr, ECDSA, EdDSA
- **Secret Sharing**: Shamir, Feldman VSS, Pedersen VSS
- **MPC**: Threshold ECDSA, Threshold Ed25519 (FROST)
- **Advanced**: Accumulators, Bulletproofs, Paillier, VRF, ZKP

```bash
# Test crypto library
make test-crypto
```

### 4. TypeScript SDK

Browser and Node.js integration:

```bash
# Install
pnpm add @sonr.io/es

# Build SDK
pnpm --filter '@sonr.io/es' build
```

**Usage**:
```typescript
import { createVaultClient } from '@sonr.io/es';

// Initialize vault client
const client = await createVaultClient({
  rpcUrl: 'http://localhost:26657',
  restUrl: 'http://localhost:1317',
});

// Generate vault
const vault = await client.generate({ id: 'my-vault' });

// Sign message
const signature = await client.sign({
  message: new Uint8Array([1, 2, 3]),
  enclave: vault.data,
});
```

### 5. Frontend App

Modern web application with TanStack:

```bash
# Start dev server
make dev

# Build for production
cd apps/frontend && pnpm build

# Deploy to Cloudflare
make dev-deploy
```

**Tech Stack**:
- React 19
- TanStack Router, Query, DB, Form
- Vite
- Tailwind CSS
- Cloudflare Workers

## Build System

### Makefile Targets

```bash
make help              # Show all targets
make build             # Build all Go/WASM components
make build-worker      # Build worker WASM
make build-vault       # Build vault WASM
make test              # Run all Go tests
make test-crypto       # Run crypto tests
make fmt               # Format Go code
make lint              # Lint Go code
make clean             # Clean build artifacts
make dev               # Start frontend dev server
make version           # Display version info
```

### pnpm Scripts

```bash
pnpm build             # Build all TypeScript packages
pnpm test              # Run all tests
pnpm lint              # Lint with Biome
pnpm format            # Format with Biome
pnpm typecheck         # Type check all packages
pnpm gen:protobufs     # Generate protobuf types
```

## Testing

### Go Tests

```bash
# All tests
make test

# Specific components
make test-worker
make test-vault
make test-crypto

# With coverage
make test-coverage

# Benchmarks
make bench
```

### TypeScript Tests

```bash
# All packages
pnpm test

# Specific package
pnpm --filter '@sonr.io/es' test

# With UI
pnpm test --ui
```

## Deployment

### Release with GoReleaser

```bash
# Test configuration
goreleaser check

# Create snapshot (no git tag required)
goreleaser release --snapshot --clean

# Create production release
git tag v0.1.0
git push origin v0.1.0
goreleaser release --clean
```

**Artifacts**:
- `motr_worker_*.tar.gz` - Worker WASM
- `motr_vault_*.tar.gz` - Vault WASM
- `motr_*.tar.gz` - Combined archive
- `motr_checksums.txt` - SHA256 checksums

### NPM Packages

```bash
# Publish to npm
cd packages/es
pnpm publish

cd ../ui
pnpm publish
```

## Documentation

- **[MIGRATION.md](./MIGRATION.md)** - Architecture and component details
- **[API Documentation](./docs/)** - API reference
- **[Crypto Library](./crypto/README.md)** - Cryptographic primitives

## Security

### Cryptographic Operations

- All cryptographic operations run in sandboxed WASM
- Keys never leave the secure enclave
- Multi-party computation for threshold operations
- Zero-knowledge proofs for privacy

### Reporting Security Issues

**DO NOT** open public issues for security vulnerabilities.

Email: security@sonr.io

## Contributing

Contributions are welcome! Please read our contributing guidelines before submitting PRs.

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Run tests and linting
5. Submit a pull request

## License

MIT License - see [LICENSE](./LICENSE) for details

## Links

- **GitHub**: [sonr-io/motr](https://github.com/sonr-io/motr)
- **Documentation**: [docs.sonr.io](https://docs.sonr.io)
- **Website**: [sonr.io](https://sonr.io)

## Acknowledgments

Built with:
- [TinyGo](https://tinygo.org/) - Go compiler for WebAssembly
- [Extism](https://extism.org/) - WebAssembly plugin system
- [TanStack](https://tanstack.com/) - Modern web framework
- [Cosmos SDK](https://cosmos.network/) - Blockchain framework

---

**Made with ❤️ by the Sonr Team**
