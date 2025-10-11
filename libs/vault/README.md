# @sonr.io/vault

WebAssembly-based HTTP server for Motor Payment Gateway and OIDC services.

## Overview

The Vault package provides a Go WASM HTTP server that implements:

- **W3C Payment Handler API** - Secure payment processing via Service Workers
- **OpenID Connect (OIDC)** - Complete OAuth2/OIDC authorization flows
- **Service Worker Integration** - Runs in the browser as a service worker

## Installation

```bash
pnpm add @sonr.io/vault
```

## Usage

### Basic Setup

```typescript
import { loadVault } from '@sonr.io/vault/loader'

// Load the vault WASM module
await loadVault({
  wasmPath: '/vault.wasm',
  runtimePath: '/wasm_exec.js',
  debug: true
})
```

### Vite Integration

```typescript
// vite.config.ts
import { defineConfig } from 'vite'
import { vaultPlugin } from '@sonr.io/vault/vite-plugin'

export default defineConfig({
  plugins: [
    vaultPlugin({
      publicPath: '/motor-vault',
      debug: true
    })
  ]
})
```

### Service Worker

The vault is designed to run as a service worker for secure payment processing:

```typescript
// Register the service worker
navigator.serviceWorker.register('/vault-worker.js')

// vault-worker.js
import { loadVault } from '@sonr.io/vault/loader'

self.addEventListener('install', (event) => {
  event.waitUntil(
    loadVault({
      wasmPath: '/vault.wasm',
      runtimePath: '/wasm_exec.js'
    })
  )
})
```

## API Endpoints

Once loaded, the vault provides the following HTTP endpoints:

### Health & Status
- `GET /health` - Health check
- `GET /status` - Service status and info

### Payment Handler API
- `GET /payment/instruments` - List payment instruments
- `POST /payment/canmakepayment` - Check payment method support
- `POST /payment/paymentrequest` - Handle payment request

### Payment Gateway
- `POST /api/payment/process` - Process payment
- `POST /api/payment/validate` - Validate payment method
- `GET /api/payment/status/:id` - Get payment status
- `POST /api/payment/refund` - Process refund

### OIDC Authorization
- `GET /.well-known/openid-configuration` - OIDC discovery
- `GET /.well-known/jwks.json` - JSON Web Key Set
- `GET /authorize` - Authorization endpoint
- `POST /token` - Token endpoint
- `GET /userinfo` - User info endpoint

## Development

### Building

```bash
# Build WASM and TypeScript
pnpm build

# Build only WASM
pnpm build:wasm

# Build only TypeScript
pnpm build:ts

# Watch mode
pnpm watch
```

### Testing

```bash
# Run Go tests
pnpm test

# Format Go code
pnpm lint
```

### Clean

```bash
pnpm clean
```

## Architecture

The vault is built using:

- **Go 1.24+** - Server implementation
- **GOOS=js GOARCH=wasm** - Standard Go WASM compilation
- **wasm-http-server** - HTTP server library for Go WASM
- **TypeScript** - Client-side loader and Vite integration
- **Vite** - Build tooling and bundling

## Security

The vault includes:

- Rate limiting on all API endpoints
- CORS protection
- JWT validation
- Secure payment processing
- OIDC standard compliance

## License

MIT
