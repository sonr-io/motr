# Motr

> Multi-purpose WebAssembly monorepo powering secure cryptographic operations and decentralized identity for the Sonr ecosystem.

[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)
[![Go Version](https://img.shields.io/badge/Go-1.24.4+-00ADD8?logo=go)](https://go.dev/)
[![TinyGo](https://img.shields.io/badge/TinyGo-0.39+-00ADD8?logo=go)](https://tinygo.org/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.0+-3178C6?logo=typescript)](https://www.typescriptlang.org/)
[![Bun](https://img.shields.io/badge/Bun-1.3+-000000?logo=bun)](https://bun.sh/)
[![SvelteKit](https://img.shields.io/badge/SvelteKit-5.0+-FF3E00?logo=svelte)](https://kit.svelte.dev/)

## Overview

Motr is a comprehensive WebAssembly-based monorepo that provides secure cryptographic operations, decentralized identity management, and a full-stack web application for the Sonr ecosystem. The architecture leverages Cloudflare Workers and Pages for edge computing and Go-compiled WASM for cryptographic operations.

The included API and frontend are reference implementations. The core value lies in the **framework-agnostic WASM libraries** (`libs/enclave` and `libs/vault`) which can be integrated into any stack. Use the provided API for rapid deployment, or replace it with your own backend (Express, FastAPI, etc.) while keeping the powerful cryptographic primitives.

### Key Features

- **🚀 Hono-based API Worker** - Edge-deployed RESTful API with Zod validation and rate limiting *(replaceable)*
- **🎨 SvelteKit Frontend** - Modern web app with Konsta UI (Material Design) and SSR support *(replaceable)*
- **🔐 Cryptographic Vault** - WASM-based secure key management with MPC and threshold cryptography *(core library)*
- **🎭 DID Management** - Decentralized identity with WebAuthn integration via Enclave *(core library)*
- **📦 Shared Packages** - Reusable TypeScript SDK and UI components *(framework-agnostic)*

## Repository Structure

```
motr/
├── apps/                 # Reference Implementations (Replaceable)
│   ├── api/               # Hono-based Cloudflare Worker API
│   │   ├── src/
│   │   │   ├── index.ts  # API entry point
│   │   │   ├── routes/   # API route handlers
│   │   │   └── types/    # TypeScript types
│   │   ├── scripts/
│   │   │   └── seed-registries.ts  # KV seeding script
│   │   └── wrangler.toml # API Worker configuration
│   └── web/              # SvelteKit frontend application
│       ├── src/
│       │   ├── routes/   # SvelteKit routes
│       │   ├── lib/      # Shared utilities
│       │   └── app.html  # HTML template
│       └── svelte.config.js  # SvelteKit configuration
│
├── libs/                 # Core Libraries (Framework-Agnostic)
│   ├── enclave/         # DID & WebAuthn Durable Object worker
│   └── vault/           # Cryptographic vault operations
│
├── pkgs/                 # TypeScript Packages (Reusable)
│   ├── sdk/             # Core TypeScript SDK
│   └── ui/              # Shared UI components (Konsta UI)
│
├── package.json         # Root workspace configuration
└── turbo.json          # Turborepo build pipeline
```

## Flexibility & Customization

Motr is designed with **modularity** as a core principle. The architecture separates concerns to allow developers to adopt only what they need:

### What's Replaceable

1. **API Backend (`apps/api/`)**: The Cloudflare Worker API is a reference implementation optimized for edge deployment. You can replace it with:
   - **Express.js** or **Fastify** on Node.js
   - **FastAPI** or **Flask** on Python
   - **Go** with `net/http` or **Fiber**
   - **Rust** with **Actix** or **Axum**
   - Any backend framework that can serve HTTP and integrate with the SDK

2. **Frontend (`apps/web/`)**: The SvelteKit frontend is one of many possible UI implementations. Replace it with:
   - **React** with Next.js or Vite
   - **Vue** with Nuxt or Vite
   - **Angular** or **Solid.js**
   - Native mobile apps (React Native, Flutter)
   - Desktop apps (Electron, Tauri)

### What's Core (Keep These)

1. **WASM Libraries (`libs/`)**: These are the cryptographic primitives that power Motr:
   - `libs/enclave` - DID management, WebAuthn, identity
   - `libs/vault` - Multi-chain signing, MPC, threshold cryptography
   - Written in Go, compiled to WASM for universal compatibility

2. **SDK (`pkgs/sdk/`)**: Framework-agnostic TypeScript SDK for integrating with the WASM libraries

### Integration Examples

**Using Motr libs with Express.js:**
```typescript
import express from 'express';
import { createVaultClient } from '@sonr.io/vault';

const app = express();
const vault = await createVaultClient();

app.post('/api/sign', async (req, res) => {
  const signature = await vault.sign(req.body.transaction);
  res.json({ signature });
});
```

**Using Motr libs with FastAPI:**
```python
from fastapi import FastAPI
# Import WASM module via pyodide or similar
# Access vault operations through JavaScript bridge

app = FastAPI()

@app.post("/api/sign")
async def sign_transaction(tx: Transaction):
    # Use WASM vault for signing
    signature = vault.sign(tx)
    return {"signature": signature}
```

The provided Cloudflare deployment is optimized for **speed** and **global distribution**, but developers can redistribute Motr to fit their infrastructure, compliance requirements, or technology preferences.

## Quick Start

### Prerequisites

- **Bun** 1.3+ ([install](https://bun.sh/))
- **Node.js** 20+ (for Wrangler CLI)
- **Cloudflare Account** ([sign up](https://dash.cloudflare.com/sign-up))
- **Wrangler** CLI (included in dependencies)

Optional (for WASM development):
- **Go** 1.24.4+ ([install](https://go.dev/dl/))
- **TinyGo** 0.39+ ([install](https://tinygo.org/getting-started/install/))

### Installation

```bash
# Clone the repository
git clone https://github.com/sonr-io/motr.git
cd motr

# Install all dependencies (uses Bun workspaces)
bun install

# Build all packages and libraries
turbo build

# Authenticate with Cloudflare (one-time setup)
bun run api:login
```

### Initial Setup

#### 1. Create KV Namespaces

Create the required KV namespaces for the API:

```bash
# Navigate to API directory
cd apps/api

# Create production namespaces
npx wrangler kv namespace create SESSIONS
npx wrangler kv namespace create OTP_STORE
npx wrangler kv namespace create CHAIN_REGISTRY
npx wrangler kv namespace create ASSET_REGISTRY

# Copy the generated namespace IDs to wrangler.toml
```

#### 2. Update API Configuration

Edit `apps/api/wrangler.toml` with your namespace IDs:

```toml
[[kv_namespaces]]
binding = "SESSIONS"
id = "your_sessions_id_here"

[[kv_namespaces]]
binding = "OTP_STORE"
id = "your_otp_store_id_here"

[[kv_namespaces]]
binding = "CHAIN_REGISTRY"
id = "your_chain_registry_id_here"

[[kv_namespaces]]
binding = "ASSET_REGISTRY"
id = "your_asset_registry_id_here"
```

### Development

#### API Development

```bash
# Start API dev server (http://localhost:5165)
bun run api:dev

# Or from monorepo root
cd apps/api && bun run dev
```

The API will be available at `http://localhost:5165` with live reload enabled.

#### Web Frontend Development

```bash
# Start SvelteKit dev server (http://localhost:5173)
bun run web:dev

# Or from monorepo root
cd apps/web && bun run dev
```

The web app will be available at `http://localhost:5173` with HMR (Hot Module Replacement).

#### Full Stack Development

```bash
# Start both API and Web concurrently
bun run dev
```

This runs both the API (port 5165) and Web (port 5173) servers in parallel.

#### Seeding Development Data

After starting the API for the first time, seed the registries with blockchain data:

```bash
# Seed chain and asset registries
bun run api:seed

# Or automatically seed after starting dev server (waits 3 seconds)
cd apps/api && bun run dev:seed
```

This populates the KV stores with 5 Cosmos chains (Cosmos Hub, Osmosis, Juno, Stargaze, Akash) and their native assets for development.

#### WASM Library Development

```bash
# Build enclave WASM
cd libs/enclave && bun run build

# Build vault WASM
cd libs/vault && bun run build

# Start enclave worker (Durable Object)
cd libs/enclave && wrangler dev

# Start vault worker
cd libs/vault && wrangler dev
```

#### Testing & Quality

```bash
# Run all tests
turbo test            # All tests
bun run test:all     # All package tests

# Linting and formatting
turbo lint           # Lint all packages
turbo format         # Format all packages
turbo check          # Type check all packages
```

## Architecture

### 1. API Worker (Hono)

The API backend at `apps/api/src/index.ts` using [Hono framework](https://hono.dev/):

> **Design Note:** The API deployment to Cloudflare Workers is a design choice for rapid deployment and edge performance. The core functionality (price feeds, session management, and registry data) could be replaced with any API backend of your choice. The `libs/` packages (Enclave and Vault) are framework-agnostic and can be integrated into any architecture that suits your needs.

**Features:**
- 🎯 RESTful API with clean route organization
- 📦 Zod schema validation for all inputs
- 🔐 Rate limiting (IP-based and email-based)
- 💾 Cloudflare KV for session and data storage
- 🔌 Service bindings to Enclave and Vault workers
- 🚀 Built-in middleware (CORS, error handling)
- 🔄 **Replaceable:** Swap with your own API backend while keeping the WASM libs

**API Routes:**
```typescript
// Authentication endpoints
POST   /api/auth/login           # User login
POST   /api/auth/register        # User registration
POST   /api/auth/verify-otp      # OTP verification
POST   /api/auth/logout          # User logout

// Registry endpoints
GET    /api/registry/chains      # List all chains
POST   /api/registry/chains      # Add new chain
GET    /api/registry/assets      # List all assets
POST   /api/registry/assets      # Add new asset
```

**Development:**
```bash
cd apps/api
bun run dev          # Start API at http://localhost:5165
bun run seed         # Seed development data
bun run preview      # Test with remote bindings
bun run logs         # Tail production logs
```

### 2. Web Frontend (SvelteKit)

Modern full-stack web app built with SvelteKit and Konsta UI:

**Location:** `apps/web/`

**Features:**
- 🎨 Material Design 3 components (Konsta UI)
- 🚀 Server-Side Rendering (SSR) with SvelteKit
- 📱 Responsive design for mobile and desktop
- ⚡ Optimized for Cloudflare Pages deployment
- 🎯 Type-safe API integration with SDK

**Tech Stack:**
- SvelteKit 2.x
- Konsta UI (Material Design components)
- Vite 6.x
- Tailwind CSS 4.x
- TypeScript 5.9+
- `@sveltejs/adapter-cloudflare` for deployment

**SvelteKit Configuration:**

The app uses the Cloudflare adapter for optimal edge deployment:

```javascript
// svelte.config.js
import adapter from '@sveltejs/adapter-cloudflare';

export default {
  kit: {
    adapter: adapter({
      routes: {
        include: ['/*'],
        exclude: ['<all>']
      }
    })
  }
};
```

**Development:**
```bash
cd apps/web
bun run dev          # Start dev server on port 5173
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

### Prerequisites

1. **Cloudflare Account:** Ensure you have a Cloudflare account and are authenticated:
   ```bash
   npx wrangler login
   ```

2. **KV Namespaces:** Create production KV namespaces (see Initial Setup section)

3. **Build Assets:** Build all packages before deploying:
   ```bash
   turbo build
   ```

### API Deployment (Cloudflare Workers)

The API is deployed as a Cloudflare Worker:

```bash
# Deploy API to production
bun run api:deploy

# Or from API directory
cd apps/api && npx wrangler deploy

# Deploy to staging environment
bun run api:deploy:staging
cd apps/api && npx wrangler deploy --env staging

# Test with remote bindings before deploying
cd apps/api && npx wrangler dev --remote
```

**API Wrangler Configuration (`apps/api/wrangler.toml`):**

```toml
name = "motr-api"
main = "src/index.ts"
compatibility_date = "2025-01-11"

# KV Namespaces
[[kv_namespaces]]
binding = "SESSIONS"
id = "your_production_sessions_id"

[[kv_namespaces]]
binding = "OTP_STORE"
id = "your_production_otp_store_id"

[[kv_namespaces]]
binding = "CHAIN_REGISTRY"
id = "your_production_chain_registry_id"

[[kv_namespaces]]
binding = "ASSET_REGISTRY"
id = "your_production_asset_registry_id"

# Production environment
[env.production]
name = "motr-api-production"
routes = [
  { pattern = "api.sonr.id/*", custom_domain = true }
]

# Staging environment
[env.staging]
name = "motr-api-staging"
```

### Web Deployment (Cloudflare Pages)

The SvelteKit frontend is deployed to Cloudflare Pages:

#### Method 1: Direct Upload (Wrangler CLI)

```bash
# Build the SvelteKit app
cd apps/web && bun run build

# Deploy to Cloudflare Pages
npx wrangler pages deploy .svelte-kit/cloudflare --project-name=motr-web

# Deploy to specific branch (staging)
npx wrangler pages deploy .svelte-kit/cloudflare --project-name=motr-web --branch=staging
```

#### Method 2: Git Integration (Recommended)

1. **Connect Repository:**
   - Go to [Cloudflare Dashboard](https://dash.cloudflare.com/) → Pages
   - Click "Create a project" → "Connect to Git"
   - Select your repository

2. **Configure Build Settings:**
   ```
   Framework preset: SvelteKit
   Build command: bun run build
   Build output directory: .svelte-kit/cloudflare
   Root directory: apps/web
   ```

3. **Environment Variables (Optional):**
   - Set `API_URL` to your API worker URL
   - Set any other required environment variables

4. **Deploy:**
   - Push to your main branch for production
   - Create branches for preview deployments

**SvelteKit Build Configuration:**

The app uses `@sveltejs/adapter-cloudflare` which generates the correct output:

```javascript
// apps/web/svelte.config.js
import adapter from '@sveltejs/adapter-cloudflare';

export default {
  kit: {
    adapter: adapter()
  }
};
```

**Wrangler Output Structure:**
```
.svelte-kit/cloudflare/
├── _worker.js              # SvelteKit server (Cloudflare Worker)
├── _routes.json            # Route manifest
└── [static files]          # Pre-rendered and static assets
```

### Testing Deployments

```bash
# Test API with remote bindings
cd apps/api && npx wrangler dev --remote

# Preview production build locally
cd apps/web && bun run preview

# View deployment logs
bun run api:logs              # API worker logs
npx wrangler pages deployment tail --project-name=motr-web  # Pages logs
```

### Deployment URLs

After deployment, your services will be available at:

**Production:**
- API: `https://motr-api.<your-subdomain>.workers.dev` or `https://api.sonr.id`
- Web: `https://motr-web.pages.dev` or `https://sonr.id`

**Staging:**
- API: `https://motr-api-staging.<your-subdomain>.workers.dev`
- Web: `https://<branch>.motr-web.pages.dev`

### Post-Deployment

1. **Seed Production Data:**
   ```bash
   # Update API_URL in seed script to production URL
   API_URL=https://api.sonr.id bun run api:seed
   ```

2. **Verify Health:**
   ```bash
   curl https://api.sonr.id/health
   curl https://sonr.id
   ```

3. **Monitor Logs:**
   ```bash
   bun run api:logs              # Follow API logs
   bun run api:logs:production   # Production only
   ```

### Durable Objects & Additional Workers

Enclave and Vault workers are deployed separately:

```bash
# Deploy enclave (Durable Object)
cd libs/enclave && npx wrangler deploy

# Deploy vault worker
cd libs/vault && npx wrangler deploy
```

## Registry Seeding

The API includes a comprehensive seeding system for populating chain and asset registries with development data.

### What Gets Seeded

**Chains:**
- Cosmos Hub (`cosmoshub-4`)
- Osmosis (`osmosis-1`)
- Juno (`juno-1`)
- Stargaze (`stargaze-1`)
- Akash (`akashnet-2`)

**Assets:**
- ATOM (Cosmos Hub native token)
- OSMO (Osmosis native token)
- JUNO (Juno native token)
- STARS (Stargaze native token)
- AKT (Akash native token)

### Seeding Commands

```bash
# From monorepo root
bun run api:seed

# From apps/api directory
bun run seed

# Auto-seed after starting dev server (waits 3s)
cd apps/api && bun run dev:seed

# Seed production environment
API_URL=https://api.sonr.id bun run api:seed
```

### How It Works

The seed script (`apps/api/scripts/seed-registries.ts`):
1. Waits for the API server to be running
2. Makes POST requests to `/api/registry/chains` and `/api/registry/assets`
3. Populates KV stores via the API endpoints
4. Reports success/failure for each chain and asset

### Adding More Chains/Assets

Edit `apps/api/scripts/seed-registries.ts` to add more data:

```typescript
const SEED_CHAINS: ChainInfo[] = [
  // ... existing chains
  {
    chainId: 'secret-4',
    chainName: 'Secret Network',
    nativeCurrency: {
      name: 'Secret',
      symbol: 'SCRT',
      decimals: 6,
    },
    rpcUrls: ['https://rpc.secret.network'],
    blockExplorerUrls: ['https://mintscan.io/secret'],
    iconUrl: 'https://raw.githubusercontent.com/cosmos/chain-registry/master/secretnetwork/images/scrt.png',
    network: 'mainnet',
  },
];
```

See `apps/api/scripts/README.md` for more details.

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
# Test API endpoints
curl http://localhost:5165/health
curl http://localhost:5165/api/registry/chains
curl http://localhost:5165/api/registry/assets

# Test with staging/production
curl https://api.sonr.id/health
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

- [Hono](https://hono.dev/) - Ultrafast web framework for Cloudflare Workers
- [SvelteKit](https://kit.svelte.dev/) - Full-stack framework with SSR and edge support
- [Konsta UI](https://konstaui.com/) - Material Design 3 components for Svelte
- [TinyGo](https://tinygo.org/) - Go compiler for WebAssembly
- [Extism](https://extism.org/) - Universal plugin system
- [Cloudflare Workers](https://workers.cloudflare.com/) - Edge computing platform
- [Cloudflare Pages](https://pages.cloudflare.com/) - Jamstack deployment platform
- [Vite](https://vitejs.dev/) - Next generation frontend tooling
- [Bun](https://bun.sh/) - Fast all-in-one JavaScript runtime
- [Turborepo](https://turbo.build/) - High-performance build system

---

**Made with ❤️ by the Sonr Team**
