# Development

## Repository Structure

```text
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
├── x/                      # Build infrastructure
│   └── worker/            # Cloudflare Worker (Hono-based)
│       ├── src/worker.ts  # Main orchestrator serving all frontends
│       ├── wrangler.toml  # Worker deployment configuration
│       └── package.json   # Worker package
│
├── docs/                   # Documentation & MDX content
├── index.ts               # Bun build orchestrator (replaces Turborepo)
└── package.json           # Root workspace configuration
```

## Quick Start

### Prerequisites

- **Bun** 1.3+ ([install](https://bun.sh/))
- **Devbox** (for WASM builds - [install](https://www.jetpack.io/devbox/docs/installing_devbox/))
  - Manages Go 1.24.7+, TinyGo 0.39+, and other build tools
- **Wrangler** CLI (included in dependencies)

### Installation

```bash
# Clone the repository
git clone https://github.com/sonr-io/motr.git
cd motr

# Install all dependencies (uses Bun workspaces)
bun install

# Build all packages and libraries (uses custom Bun orchestrator)
bun run build
```

### Development

```bash
# Start main worker (builds everything then serves via Hono)
bun run dev

# Start individual frontend app with HMR
cd apps/auth && bunx vite       # Port 5173
cd apps/console && bunx vite    # Port 5174
cd apps/profile && bunx vite    # Port 5175
cd apps/search && bunx vite     # Port 5176

# Start enclave worker (Durable Object) separately
cd libs/enclave && wrangler dev

# Run tests (orchestrator handles all workspaces)
bun run test

# Linting and formatting
bun run lint         # Lint all packages
bun run format       # Format all packages
bun run check        # Type check + lint all packages
bun run typecheck    # Type check only
```

## Architecture

### 1. Cloudflare Worker (Hono)

The main orchestrator at `x/worker/src/worker.ts` using [Hono framework](https://hono.dev/):

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
import { RpcClient } from '@sonr.io/sdk/client';
import { registerWithPasskey } from '@sonr.io/sdk/client';

// Initialize RPC client (static methods)
const accountData = await RpcClient.query({
  endpoint: 'https://rpc.sonr.id',
  service: SomeQueryService,
  request: { address: 'snr1...' },
});

// Register with WebAuthn passkey
const result = await registerWithPasskey({
  username: 'alice',
  displayName: 'Alice Smith',
});
```

**Features:**
- RPC client for Cosmos SDK queries
- WebAuthn passkey registration and login
- Protobuf message builders
- Chain registry and asset metadata
- WASM exec utilities

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

### Bun Orchestrator

This monorepo uses a **custom Bun-based orchestrator** (`index.ts`) instead of Turborepo. The orchestrator automatically manages the dependency graph and builds workspaces in topological order.

```bash
bun run build        # Build all packages (respects dependencies)
bun run test         # Run all tests
bun run lint         # Lint all packages
bun run format       # Format all code
bun run check        # Type check + lint
```

**Build Order** (automatic):
1. `@sonr.io/sdk` - Core SDK (no dependencies)
2. `@sonr.io/vault`, `@sonr.io/enclave`, `@sonr.io/ui` - WASM + UI (depend on sdk)
3. `@sonr.io/browser`, `@sonr.io/react` - Browser + React (depend on ui/enclave/vault)
4. Frontend apps - Vite builds (depend on react)
5. `@sonr.io/config` - Asset aggregation (depends on all apps)
6. `@sonr.io/worker` - Worker (TypeScript via Wrangler, not orchestrator)

**Filtering workspaces:**
```bash
# Build specific packages
WORKSPACES=@sonr.io/sdk,@sonr.io/ui bun run build

# Test specific packages
WORKSPACES=@sonr.io/sdk MODE=test bun run index.ts

# Verbose output
VERBOSE=1 bun run build
```

**Architecture**: ESM-only, zero CommonJS. All packages use modern web APIs.

### Scripts Reference

#### Root Scripts

```bash
# Development
bun run dev                    # Build all + start main worker (http://localhost:5165)

# Building
bun run build                  # Build all packages (default MODE)
bun run build:verbose          # Build with detailed output
bun run build:force            # Clean then rebuild everything

# Testing
bun run test                   # Run all tests (MODE=test)

# Quality
bun run lint                   # Lint all packages (Oxlint for TS, golangci-lint for Go)
bun run format                 # Format all files (Oxfmt for TS, gofumpt for Go)
bun run check                  # Type check + lint all packages
bun run typecheck              # Type check only

# Deployment (worker at x/worker/)
bun run deploy                 # Build all + deploy main worker to production
bun run deploy:staging         # Deploy to staging
bun run preview                # Test with remote bindings
bun run logs                   # Tail production logs

# Maintenance
bun run clean                  # Clean all build artifacts (MODE=clean)

# Advanced (using orchestrator directly)
MODE=dev bun run index.ts      # Start all dev servers
MODE=clean bun run index.ts    # Clean all artifacts
./index.ts --help              # Show orchestrator help
```

**Note**: Always use `bun run <script>`, NEVER `bun <script>` (calls bundler instead of orchestrator).


