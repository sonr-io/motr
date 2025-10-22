# Cloudflare Workers Integration

This document explains how to use `@sonr.io/enclave` with Cloudflare Workers and Durable Objects.

## Overview

The `@sonr.io/enclave` package now supports **dual deployment modes**:

1. **Browser/Node.js**: Web Worker client for WASM vault (original functionality)
2. **Cloudflare Workers**: Durable Object for persistent identity management (new)

## Architecture

### Standalone Enclave Worker

The enclave can be deployed as a standalone Cloudflare Worker with Durable Objects:

```
┌─────────────────────┐
│  Frontend Worker    │
│  (sonr-id)          │
└──────────┬──────────┘
           │ Service Binding
           ▼
┌─────────────────────┐
│  Enclave Worker     │
│  (sonr-enclave)     │
└──────────┬──────────┘
           │
           ▼
┌─────────────────────┐
│ SonrIdentityDurable │
│ (Durable Object)    │
└─────────────────────┘
```

**Benefits:**
- Independent scaling and deployment
- Isolated resource management per identity
- Persistent state across worker restarts
- Global distribution via Cloudflare's network

## Quick Start

### 1. Deploy Enclave Worker

```bash
cd libs/enclave

# Development
bun run dev:worker

# Deploy to staging
bun run deploy:staging

# Deploy to production
bun run deploy:production
```

### 2. Configure Frontend Worker

Update your frontend's `wrangler.toml`:

```toml
# Service binding to the Enclave Worker
[[services]]
binding = "ENCLAVE"
service = "sonr-enclave"
environment = "production"  # or "staging"
```

### 3. Use in Frontend Worker

```typescript
// Environment interface
interface Env {
  ENCLAVE: Fetcher;  // Service binding
}

// Make requests to enclave service
export default {
  async fetch(request: Request, env: Env): Promise<Response> {
    // Initialize identity
    const initResponse = await env.ENCLAVE.fetch(
      '/identity/sonr1abc.../initialize',
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          wasmPath: '/enclave.wasm',
          accountAddress: 'sonr1abc...'
        })
      }
    );

    // Sign data
    const signResponse = await env.ENCLAVE.fetch(
      '/identity/sonr1abc.../sign',
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          data: Array.from(new TextEncoder().encode('Hello!'))
        })
      }
    );

    const { signature } = await signResponse.json();
    return Response.json({ signature });
  }
};
```

## API Reference

### Enclave Worker Endpoints

All endpoints follow the pattern: `/identity/{accountAddress}/{action}`

#### Health Check
```
GET /health
```

Response:
```json
{
  "status": "healthy",
  "service": "sonr-enclave",
  "environment": "production",
  "timestamp": 1234567890
}
```

#### Initialize Identity
```
POST /identity/{accountAddress}/initialize
Content-Type: application/json

{
  "wasmPath": "/enclave.wasm",
  "accountAddress": "sonr1abc..."
}
```

#### Get Status
```
GET /identity/{accountAddress}/status
```

Response:
```json
{
  "isInitialized": true,
  "accountAddress": "sonr1abc...",
  "hasEnclave": true,
  "connectedSessions": 2
}
```

#### Get DID
```
GET /identity/{accountAddress}/did
```

Response:
```json
{
  "did": "did:key:z6Mk...",
  "address": "sonr1abc...",
  "publicKey": [...]
}
```

#### Create Origin Token
```
POST /identity/{accountAddress}/tokens/origin
Content-Type: application/json

{
  "audience_did": "did:key:z6Mk...",
  "capabilities": [...],
  "expiration": 1234567890
}
```

#### Create Attenuated Token
```
POST /identity/{accountAddress}/tokens/attenuated
Content-Type: application/json

{
  "parent_token": "eyJ...",
  "audience_did": "did:key:z6Mk...",
  "capabilities": [...],
  "expiration": 1234567890
}
```

#### List Tokens
```
GET /identity/{accountAddress}/tokens/list
```

#### Sign Data
```
POST /identity/{accountAddress}/sign
Content-Type: application/json

{
  "data": [72, 101, 108, 108, 111]  // Uint8Array as array
}
```

Response:
```json
{
  "signature": [...],
  "error": null
}
```

#### Verify Signature
```
POST /identity/{accountAddress}/verify
Content-Type: application/json

{
  "data": [72, 101, 108, 108, 111],
  "signature": [...]
}
```

#### Switch Account
```
POST /identity/{accountAddress}/accounts/switch
Content-Type: application/json

{
  "accountAddress": "sonr1xyz..."
}
```

#### List Accounts
```
GET /identity/{accountAddress}/accounts/list
```

### WebSocket Support

Connect to a Durable Object via WebSocket for real-time updates:

```typescript
const ws = new WebSocket('wss://enclave.sonr.id/identity/sonr1abc...');

ws.onopen = () => {
  // Connection established, receive initial status
};

ws.onmessage = (event) => {
  const message = JSON.parse(event.data);

  switch (message.type) {
    case 'status':
      console.log('Status:', message);
      break;
    case 'initialized':
      console.log('Identity initialized:', message.accountAddress);
      break;
    case 'token_created':
      console.log('Token created:', message.tokenType);
      break;
    case 'data_signed':
      console.log('Data signed');
      break;
  }
};

// Send ping
ws.send(JSON.stringify({ type: 'ping' }));
```

## Direct Import (Alternative)

If you want to bundle the Durable Object directly into your worker instead of using a service binding:

```typescript
// In your worker
import { SonrIdentityDurable } from '@sonr.io/enclave/cloudflare/durable';

// Export for Cloudflare runtime
export { SonrIdentityDurable };

// Add to wrangler.toml
[[durable_objects.bindings]]
name = "SONR_IDENTITY"
class_name = "SonrIdentityDurable"

[[migrations]]
tag = "v1"
new_classes = ["SonrIdentityDurable"]
```

Then use directly:

```typescript
interface Env {
  SONR_IDENTITY: DurableObjectNamespace;
}

export default {
  async fetch(request: Request, env: Env): Promise<Response> {
    const id = env.SONR_IDENTITY.idFromName('sonr1abc...');
    const stub = env.SONR_IDENTITY.get(id);

    return stub.fetch(request);
  }
};
```

## Configuration

### wrangler.toml

The enclave worker is configured via `libs/enclave/wrangler.toml`:

```toml
name = "sonr-enclave"
main = "src/cloudflare/worker.ts"
compatibility_date = "2025-01-21"
compatibility_flags = ["nodejs_compat"]

[[durable_objects.bindings]]
name = "SONR_IDENTITY"
class_name = "SonrIdentityDurable"

[[migrations]]
tag = "v1"
new_classes = ["SonrIdentityDurable"]

[env.production]
name = "sonr-enclave"
workers_dev = false
routes = [
  { pattern = "enclave.sonr.id/*", custom_domain = true }
]

[env.staging]
name = "sonr-enclave-staging"
workers_dev = true
```

## Development

### Local Development

```bash
# Start local development server
bun run dev:worker

# Test endpoints
curl http://localhost:8787/health
curl http://localhost:8787/identity/sonr1test.../status
```

### Testing

```bash
# Run typecheck
bun run typecheck

# Run tests
bun test
```

### Building

```bash
# Build all exports (browser + cloudflare)
bun run build

# Build just WASM
bun run build:wasm
```

## Migration from @pkgs/cloudflare

If you were previously using `SonrIdentityDurable` from `@pkgs/cloudflare`:

### Before
```typescript
import { SonrIdentityDurable } from '@pkgs/cloudflare/durable';
```

### After (Service Binding - Recommended)
```typescript
// In frontend worker
interface Env {
  ENCLAVE: Fetcher;
}

const response = await env.ENCLAVE.fetch('/identity/...');
```

### After (Direct Import)
```typescript
import { SonrIdentityDurable } from '@sonr.io/enclave/cloudflare/durable';
```

## Deployment

### Prerequisites

1. Cloudflare account with Workers enabled
2. Wrangler CLI installed and authenticated

### Deploy Commands

```bash
# Deploy to staging
cd libs/enclave
bun run deploy:staging

# Deploy to production
bun run deploy:production
```

### Verify Deployment

```bash
# Check health
curl https://enclave.sonr.id/health

# Test identity endpoint
curl https://enclave.sonr.id/identity/sonr1test.../status
```

## Best Practices

### 1. Use Service Bindings
Prefer service bindings over direct imports for better separation and independent scaling.

### 2. Error Handling
Always handle errors from the enclave service:

```typescript
try {
  const response = await env.ENCLAVE.fetch('/identity/...');

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.message);
  }

  const data = await response.json();
  // Process data
} catch (error) {
  console.error('Enclave error:', error);
  return Response.json({ error: 'Failed to process request' }, { status: 500 });
}
```

### 3. Resource Cleanup
The Durable Object automatically cleans up expired tokens every 24 hours via the `alarm()` handler.

### 4. Monitoring
Enable observability in `wrangler.toml`:

```toml
[observability]
enabled = true
head_sampling_rate = 1.0
```

## Troubleshooting

### "Service not found" Error

Ensure the enclave worker is deployed:
```bash
bun run deploy:production
```

Verify service binding in frontend's `wrangler.toml`:
```toml
[[services]]
binding = "ENCLAVE"
service = "sonr-enclave"
environment = "production"
```

### "Module not found" Error

Install Cloudflare Workers types:
```bash
bun add -D @cloudflare/workers-types
```

Update `tsconfig.json`:
```json
{
  "compilerOptions": {
    "types": ["@cloudflare/workers-types"]
  }
}
```

### TypeScript Errors

Run typecheck to identify issues:
```bash
bun run typecheck
```

## License

MIT
