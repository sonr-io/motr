# Motr

> Multi-purpose WebAssembly monorepo powering secure cryptographic operations and decentralized identity for the Sonr ecosystem.

[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)
[![Go Version](https://img.shields.io/badge/Go-1.24.4+-00ADD8?logo=go)](https://go.dev/)
[![TinyGo](https://img.shields.io/badge/TinyGo-0.39+-00ADD8?logo=go)](https://tinygo.org/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.0+-3178C6?logo=typescript)](https://www.typescriptlang.org/)
[![Bun](https://img.shields.io/badge/Bun-1.3+-000000?logo=bun)](https://bun.sh/)

## Overview

Motr is a comprehensive WebAssembly-based monorepo that provides secure cryptographic operations, decentralized identity management, and a suite of web applications for the Sonr ecosystem. The architecture leverages Cloudflare Workers for edge computing and Go-compiled WASM for cryptographic operations.

### Key Features

- **🚀 Hono-based Worker** - Edge-deployed orchestrator serving multiple frontends with SSR
- **🔐 Cryptographic Vault** - WASM-based secure key management with MPC and threshold cryptography
- **🎭 DID Management** - Decentralized identity with WebAuthn integration via Enclave
- **⚡ Vite Frontends** - Modern React apps for auth, console, profile, and search
- **📦 Shared Packages** - Reusable TypeScript libraries and UI components

## Repository Structure

```
motr/
├── apps/                    # Vite-based frontend applications
│   ├── auth/               # Authentication & registration app
│   ├── console/            # Developer console & admin interface
│   ├── profile/            # User profile management
│   └── search/             # Sonr network search
│
├── libs/                   # Go/WASM cryptographic libraries
│   ├── enclave/           # DID & WebAuthn Durable Object worker
│   └── vault/             # Cryptographic vault operations
│
├── pkgs/                   # TypeScript packages
│   ├── config/            # Shared build & lint configs
│   ├── react/             # React hooks & providers
│   ├── sdk/               # Core TypeScript SDK
│   └── ui/                # Shared UI components (shadcn)
│
├── src/                    # Cloudflare Worker (Hono-based)
│   └── worker.ts          # Main orchestrator serving all frontends
│
├── docs/                   # Documentation & MDX content
├── wrangler.toml          # Worker deployment configuration
├── tsconfig.json          # Worker TypeScript config
├── package.json           # Root workspace configuration
└── turbo.json             # Turborepo build pipeline
```

## Quick Start

### Prerequisites

- **Bun** 1.3+ ([install](https://bun.sh/))
- **Go** 1.24.4+ ([install](https://go.dev/dl/))
- **TinyGo** 0.39+ ([install](https://tinygo.org/getting-started/install/))
- **Wrangler** CLI (included in dependencies)

### Installation

```bash
# Clone the repository
git clone https://github.com/sonr-io/motr.git
cd motr

# Install all dependencies (uses Bun workspaces)
bun install

# Build all packages and libraries
turbo build
```

### Development

```bash
# Start main worker (serves all frontends via Hono)
bun run dev

# Start specific frontend app
bun run dev:auth       # Authentication app
bun run dev:console    # Console app
bun run dev:profile    # Profile app
bun run dev:search     # Search app

# Start enclave worker (Durable Object)
cd libs/enclave && wrangler dev

# Start vault worker
cd libs/vault && wrangler dev

# Run tests
turbo test            # All tests
bun run test:all     # All package tests

# Linting and formatting
turbo lint           # Lint all packages
turbo format         # Format all packages
turbo check          # Type check all packages
```

## Architecture

### 1. Cloudflare Worker (Hono)

The main orchestrator at `src/worker.ts` using [Hono framework](https://hono.dev/):

**Features:**
- 🎯 Smart routing based on subdomain, path, and session state
- 📦 Static asset serving for all Vite-built frontends
- 🔐 Session management with KV storage
- 🔌 Service bindings to Enclave and Vault workers
- 🚀 Built-in middleware (logger, etag, CORS)

**Routing Strategy:**
```typescript
// Subdomain routing
console.sonr.id/*  → Console app
profile.sonr.id/*  → Profile app
search.sonr.id/*   → Search app

// Path-based routing
/console/*         → Console app
/profile/*         → Profile app
/search/*          → Search app

// Session-based (authenticated users)
/                  → Default app from user preferences

// Default (unauthenticated)
/                  → Auth app
```

**Development:**
```bash
bun run dev          # Start worker at http://localhost:5165
bun run preview      # Test with remote bindings
bun run logs         # Tail production logs
```

### 2. Frontend Applications

Modern React apps built with Vite and TanStack:

#### Auth App (`apps/auth/`)
- User registration and authentication
- WebAuthn credential management
- OAuth/OIDC flows
- OTP verification

#### Console App (`apps/console/`)
- Developer dashboard
- API key management
- Service configuration
- Analytics and monitoring

#### Profile App (`apps/profile/`)
- User profile management
- DID document viewer
- Credential management
- Settings and preferences

#### Search App (`apps/search/`)
- Sonr network search
- User discovery
- Service discovery
- Explorer interface

**Tech Stack:**
- React 19
- TanStack Router, Query, Form
- Vite 5
- Tailwind CSS 4
- TypeScript 5.9+

**Development:**
```bash
cd apps/auth
bun run dev          # Start dev server on port 3000

bun run build        # Build for production
bun run preview      # Preview production build
```

### 3. Cryptographic Libraries (Go/WASM)

#### Enclave (`libs/enclave/`)

Durable Object worker for decentralized identity:

**Features:**
- DID document management (did:snr method)
- WebAuthn credential storage and verification
- Cryptographic key operations
- Identity recovery flows

**Technology:**
- Go → WASM via TinyGo
- Cloudflare Durable Objects
- Persistent state storage

**Build:**
```bash
cd libs/enclave
bun run build        # Compile Go to WASM
wrangler deploy      # Deploy Durable Object
```

#### Vault (`libs/vault/`)

Service worker for cryptographic operations:

**Features:**
- Multi-party computation (MPC)
- Threshold signature schemes
- Multi-chain transaction signing
- Secure key derivation
- IPFS import/export

**Supported Chains:**
- Cosmos SDK chains
- Ethereum/EVM chains
- Solana
- Bitcoin

**Technology:**
- Go → WASM via TinyGo
- Service Worker runtime
- Extism plugin system

**Build:**
```bash
cd libs/vault
bun run build        # Compile Go to WASM
```

### 4. TypeScript Packages

#### SDK (`pkgs/sdk/`)

Core TypeScript SDK for Sonr integration:

```typescript
import { SonrClient, createVault } from '@sonr.io/sdk';

// Initialize client
const client = new SonrClient({
  rpcUrl: 'https://rpc.sonr.id',
  restUrl: 'https://api.sonr.id',
});

// Create vault
const vault = await createVault({
  name: 'my-vault',
  password: 'secure-password',
});

// Sign transaction
const signature = await vault.sign({
  chain: 'cosmos',
  transaction: tx,
});
```

**Features:**
- Chain-agnostic transaction signing
- DID management utilities
- WebAuthn helpers
- IPFS integration

#### UI Components (`pkgs/ui/`)

Shared UI component library built on shadcn/ui:

```typescript
import { Button, Card, Input } from '@sonr.io/ui';

export function MyComponent() {
  return (
    <Card>
      <Input placeholder="Enter value" />
      <Button>Submit</Button>
    </Card>
  );
}
```

**Features:**
- 50+ accessible components
- Tailwind CSS styling
- Dark mode support
- TypeScript strict mode

#### React (`pkgs/react/`)

React-specific hooks and providers:

```typescript
import { useSonr, SonrProvider } from '@sonr.io/react';

function App() {
  return (
    <SonrProvider config={config}>
      <MyApp />
    </SonrProvider>
  );
}

function MyApp() {
  const { account, connect, disconnect } = useSonr();
  // ...
}
```

#### Config (`pkgs/config/`)

Shared build configurations:

```typescript
// vite.config.ts
import { createReactAppConfig } from '@sonr.io/config/vite/react-app';

export default createReactAppConfig();
```

```json
// tsconfig.json
{
  "extends": "../../pkgs/config/typescript/react-app.json"
}
```

## Build System

### Turborepo Pipeline

```bash
turbo build          # Build all packages (respects dependencies)
turbo test           # Run all tests in parallel
turbo lint           # Lint all packages
turbo dev            # Start all dev servers
```

**Build Order:**
1. `@sonr.io/sdk` - Core SDK (no dependencies)
2. `@sonr.io/ui` - UI components (depends on sdk)
3. `@sonr.io/react` - React hooks (depends on ui)
4. `libs/vault` & `libs/enclave` - WASM builds (parallel)
5. Frontend apps - Vite builds (depends on react)
6. Worker - TypeScript compilation (depends on all apps)

### Scripts Reference

#### Root Scripts

```bash
# Development
bun run dev                    # Start main worker
bun run dev:worker             # Start main worker (alias)
bun run dev:auth               # Start auth app
bun run dev:console            # Start console app
bun run dev:profile            # Start profile app
bun run dev:search             # Start search app
bun run dev:all                # Start all in parallel

# Building
bun run build                  # Build all packages
bun run build:apps             # Build only frontend apps
bun run build:libs             # Build only WASM libraries
bun run build:pkgs             # Build only TS packages
bun run build:force            # Force rebuild ignoring cache

# Testing
bun run test                   # Run all tests
bun run test:all               # Run tests in all packages
bun run test:watch             # Run tests in watch mode

# Quality
bun run lint                   # Lint all packages
bun run lint:fix               # Lint and auto-fix
bun run format                 # Format all files
bun run check                  # Run type checks
bun run typecheck              # Run type checks (alias)

# Deployment
bun run deploy                 # Deploy main worker
bun run deploy:staging         # Deploy to staging
bun run deploy:production      # Deploy to production
bun run preview                # Test with remote bindings
bun run logs                   # Tail production logs

# Maintenance
bun run clean                  # Clean build artifacts
bun run clean:cache            # Clean turbo cache
bun run clean:turbo            # Clean turbo daemon
```

## Deployment

### Single Worker Deployment

All frontend apps are served by a single Cloudflare Worker:

```bash
# Deploy to production
bun run deploy

# Deploy to staging
bun run deploy:staging

# Test before deploying
bun run preview
```

**Deployment Process:**
1. Build all frontend apps (`turbo build`)
2. Compile worker TypeScript
3. Wrangler bundles static assets
4. Deploy to Cloudflare edge network

### Environment Configuration

```toml
# wrangler.toml
name = "motr-orchestrator"
main = "src/worker.ts"
compatibility_date = "2025-01-11"

[env.production]
routes = [
  { pattern = "sonr.id/*", custom_domain = true },
  { pattern = "*.sonr.id/*", custom_domain = true }
]

[env.staging]
name = "motr-orchestrator-staging"
workers_dev = true
```

### Durable Objects

Enclave and Vault workers are deployed separately:

```bash
# Deploy enclave (Durable Object)
cd libs/enclave && wrangler deploy

# Deploy vault
cd libs/vault && wrangler deploy
```

## Testing

### Unit Tests

```bash
# All tests
turbo test

# Specific package
bun --filter '@sonr.io/sdk' test

# Watch mode
turbo test -- --watch

# Coverage
turbo test -- --coverage
```

### Integration Tests

```bash
# End-to-end tests
bun run test:e2e

# Worker tests
wrangler dev --test
```

## Documentation

- **[WORKER_ARCHITECTURE.md](./docs/WORKER_ARCHITECTURE.md)** - Worker design and routing
- **[WORKER_README.md](./docs/WORKER_README.md)** - Worker development guide
- **[API Documentation](./docs/)** - API reference
- **[Migration Guide](./MIGRATION.md)** - Architecture evolution

## Contributing

We welcome contributions! Please follow these guidelines:

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Make your changes
4. Run tests and linting (`turbo check && turbo test`)
5. Commit your changes (conventional commits preferred)
6. Push to your branch
7. Open a Pull Request

### Code Style

- **TypeScript**: Oxlint + Biome formatting
- **Go**: `gofmt` + `golangci-lint`
- **Commits**: Conventional commits (`feat:`, `fix:`, `docs:`, etc.)

## Security

### Reporting Security Issues

**DO NOT** open public issues for security vulnerabilities.

Email: security@sonr.io

### Security Features

- All cryptographic operations run in sandboxed WASM
- Keys never leave the secure enclave
- Multi-party computation for threshold operations
- Zero-knowledge proofs for privacy-preserving operations
- WebAuthn integration for passwordless authentication

## Performance

- **Edge Computing**: Cloudflare Workers in 300+ cities worldwide
- **Cold Start**: < 5ms worker execution time
- **Build Size**: Optimized WASM bundles (< 500KB)
- **Caching**: Aggressive caching for static assets
- **Code Splitting**: Route-based splitting for frontends

## License

MIT License - see [LICENSE](./LICENSE) for details

## Links

- **Website**: [sonr.io](https://sonr.io)
- **Documentation**: [docs.sonr.io](https://docs.sonr.io)
- **GitHub**: [github.com/sonr-io/motr](https://github.com/sonr-io/motr)
- **Discord**: [discord.gg/sonr](https://discord.gg/sonr)
- **Twitter**: [@sonr_io](https://twitter.com/sonr_io)

## Acknowledgments

Built with outstanding open-source technologies:

- [Hono](https://hono.dev/) - Ultrafast web framework
- [TinyGo](https://tinygo.org/) - Go compiler for WebAssembly
- [Extism](https://extism.org/) - Universal plugin system
- [TanStack](https://tanstack.com/) - Modern React utilities
- [Cloudflare Workers](https://workers.cloudflare.com/) - Edge computing platform
- [Vite](https://vitejs.dev/) - Next generation frontend tooling
- [Bun](https://bun.sh/) - Fast all-in-one JavaScript runtime
- [shadcn/ui](https://ui.shadcn.com/) - Accessible component library

---

**Made with ❤️ by the Sonr Team**
