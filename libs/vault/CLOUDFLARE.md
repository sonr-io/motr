# Cloudflare Durable Object Integration

This document explains how to use the Vault as a Cloudflare Durable Object and bind it to your applications.

## Overview

The Vault can be deployed as a Cloudflare Durable Object, providing:

- **Isolated State**: Each vault instance has its own isolated state
- **Payment Processing**: WASM-powered payment handling at the edge
- **OIDC Authentication**: Distributed OAuth2/OIDC server
- **Global Distribution**: Runs on Cloudflare's global network
- **Service Bindings**: Easy integration with other Cloudflare Workers

## Architecture

```
┌─────────────────────┐
│   App Worker        │
│   (auth, profile,   │
│    console, etc.)   │
└──────────┬──────────┘
           │
           │ Service Binding
           ▼
┌─────────────────────┐
│  Vault Worker       │
│  (sonr-vault)       │
└──────────┬──────────┘
           │
           │ Routes to DO
           ▼
┌─────────────────────┐
│  VaultDurable       │
│  (DO Instance)      │
│  ┌───────────────┐  │
│  │  Go WASM      │  │
│  │  HTTP Server  │  │
│  └───────────────┘  │
└─────────────────────┘
```

## Deployment

### 1. Deploy the Vault Worker

First, deploy the vault as a standalone Cloudflare Worker:

```bash
cd libs/vault

# Deploy to staging
bun run deploy:staging

# Deploy to production
bun run deploy:production
```

This creates the `sonr-vault` worker with the `VaultDurable` Durable Object.

### 2. Bind to Your App Workers

Update your app's `wrangler.toml` to bind to the vault service:

```toml
# Example: apps/auth/wrangler.toml
name = "motr-auth"
main = "src/worker.ts"

# ... other config ...

# Service binding to the Vault Worker
[[services]]
binding = "VAULT"
service = "motr-vault"

# Optional: Specific environment
# service = "motr-vault-staging"  # for staging
```

### 3. Use in Your Worker Code

**TypeScript Types:**

```typescript
// src/worker.ts
export interface Env {
  // ... other bindings ...

  // Vault service binding
  VAULT: Fetcher;
}

export default {
  async fetch(request: Request, env: Env): Promise<Response> {
    // Access vault via service binding
    const vaultResponse = await env.VAULT.fetch(
      new Request('https://vault/vault/user123/health')
    );

    return vaultResponse;
  },
};
```

**Making Vault Requests:**

```typescript
// Payment processing
async function processPayment(
  env: Env,
  userId: string,
  amount: number,
  recipient: string
) {
  const response = await env.VAULT.fetch(
    new Request(
      `https://vault/vault/${userId}/api/payment/process`,
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          amount,
          currency: 'SNR',
          network: 'sonr',
          recipient,
        }),
      }
    )
  );

  if (!response.ok) {
    throw new Error(`Payment failed: ${response.statusText}`);
  }

  return response.json();
}

// OIDC authentication
async function getOIDCConfig(env: Env, userId: string) {
  const response = await env.VAULT.fetch(
    new Request(
      `https://vault/vault/${userId}/.well-known/openid-configuration`
    )
  );

  return response.json();
}

// Health check
async function checkVaultHealth(env: Env, userId: string) {
  const response = await env.VAULT.fetch(
    new Request(`https://vault/vault/${userId}/health`)
  );

  return response.json();
}
```

## URL Structure

When using the vault service binding, requests follow this pattern:

```
https://vault/vault/{vaultId}/{path}
           │      │         └─ Path to vault endpoint
           │      └─ Vault ID (user ID, session ID, etc.)
           └─ Service binding hostname (arbitrary)
```

**Examples:**

- `https://vault/vault/user123/health` - Health check for user123's vault
- `https://vault/vault/user123/api/payment/process` - Payment processing
- `https://vault/vault/user123/.well-known/openid-configuration` - OIDC config
- `https://vault/vault/session456/authorize` - OAuth2 authorization

## Vault Endpoints

### Health & Status

- `GET /vault/{vaultId}/health` - Health check
- `GET /vault/{vaultId}/status` - Detailed status

### Payment API

- `POST /vault/{vaultId}/api/payment/process` - Process payment
- `POST /vault/{vaultId}/api/payment/validate` - Validate payment details
- `GET /vault/{vaultId}/api/payment/status/:id` - Get payment status
- `POST /vault/{vaultId}/api/payment/refund` - Request refund

### Payment Handler API

- `GET /vault/{vaultId}/payment/instruments` - List payment instruments
- `POST /vault/{vaultId}/payment/canmakepayment` - Check payment support
- `POST /vault/{vaultId}/payment/paymentrequest` - Handle payment request

### OIDC Endpoints

- `GET /vault/{vaultId}/.well-known/openid-configuration` - OIDC discovery
- `GET /vault/{vaultId}/.well-known/jwks.json` - Public keys
- `GET /vault/{vaultId}/authorize` - Authorization endpoint
- `POST /vault/{vaultId}/token` - Token exchange
- `GET /vault/{vaultId}/userinfo` - User info (requires auth)

## Example: Full Integration

```typescript
// apps/auth/src/worker.ts
export interface Env {
  VAULT: Fetcher;
  ASSETS: Fetcher;
  OTP_STORE: KVNamespace;
}

export default {
  async fetch(request: Request, env: Env): Promise<Response> {
    const url = new URL(request.url);

    // Route: POST /api/auth/login
    if (url.pathname === '/api/auth/login' && request.method === 'POST') {
      const { username, password } = await request.json();

      // 1. Validate credentials (your auth logic)
      const userId = await validateCredentials(username, password);

      if (!userId) {
        return Response.json({ error: 'Invalid credentials' }, { status: 401 });
      }

      // 2. Initialize OAuth flow via vault
      const oidcConfig = await env.VAULT.fetch(
        new Request(
          `https://vault/vault/${userId}/.well-known/openid-configuration`
        )
      ).then(r => r.json());

      // 3. Build authorization URL
      const state = crypto.randomUUID();
      const authUrl = new URL(oidcConfig.authorization_endpoint);
      authUrl.searchParams.set('client_id', 'auth-app');
      authUrl.searchParams.set('redirect_uri', `${url.origin}/callback`);
      authUrl.searchParams.set('response_type', 'code');
      authUrl.searchParams.set('scope', 'openid profile');
      authUrl.searchParams.set('state', state);

      // 4. Store state in KV
      await env.OTP_STORE.put(`oauth_state:${state}`, userId, {
        expirationTtl: 600, // 10 minutes
      });

      // 5. Redirect to authorization
      return Response.redirect(authUrl.toString(), 302);
    }

    // Route: GET /callback (OAuth callback)
    if (url.pathname === '/callback') {
      const code = url.searchParams.get('code');
      const state = url.searchParams.get('state');

      if (!code || !state) {
        return Response.json({ error: 'Missing parameters' }, { status: 400 });
      }

      // 1. Verify state
      const userId = await env.OTP_STORE.get(`oauth_state:${state}`);
      if (!userId) {
        return Response.json({ error: 'Invalid state' }, { status: 400 });
      }

      // 2. Exchange code for tokens via vault
      const tokenResponse = await env.VAULT.fetch(
        new Request(
          `https://vault/vault/${userId}/token`,
          {
            method: 'POST',
            headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
            body: new URLSearchParams({
              grant_type: 'authorization_code',
              code,
              redirect_uri: `${url.origin}/callback`,
              client_id: 'auth-app',
            }),
          }
        )
      );

      const tokens = await tokenResponse.json();

      // 3. Get user info
      const userInfo = await env.VAULT.fetch(
        new Request(
          `https://vault/vault/${userId}/userinfo`,
          {
            headers: {
              Authorization: `Bearer ${tokens.access_token}`,
            },
          }
        )
      ).then(r => r.json());

      // 4. Return tokens and user info
      return Response.json({
        tokens,
        user: userInfo,
      });
    }

    // Route: POST /api/payment/send
    if (url.pathname === '/api/payment/send' && request.method === 'POST') {
      const { userId, amount, recipient } = await request.json();

      // Process payment via vault
      const paymentResult = await env.VAULT.fetch(
        new Request(
          `https://vault/vault/${userId}/api/payment/process`,
          {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              amount,
              currency: 'SNR',
              network: 'sonr',
              recipient,
            }),
          }
        )
      ).then(r => r.json());

      return Response.json(paymentResult);
    }

    // Default: serve static assets
    return env.ASSETS.fetch(request);
  },
};
```

## Environment-Specific Bindings

You can bind to different vault environments:

```toml
# Production binding
[env.production]
[[env.production.services]]
binding = "VAULT"
service = "motr-vault"  # Production vault

# Staging binding
[env.staging]
[[env.staging.services]]
binding = "VAULT"
service = "motr-vault-staging"  # Staging vault
```

## Local Development

For local development with `wrangler dev`:

```bash
# Terminal 1: Start vault worker
cd libs/vault
bun run dev:cloudflare

# Terminal 2: Start your app worker
cd apps/auth
bun run dev
```

Configure local service bindings in your app's `wrangler.toml`:

```toml
[[services]]
binding = "VAULT"
service = "motr-vault"
environment = "development"
```

## Performance Considerations

### Vault Instance Management

Each unique `vaultId` creates a separate Durable Object instance:

- **Per-User Vaults**: `vault/user123`, `vault/user456` (isolated per user)
- **Per-Session Vaults**: `vault/session-abc`, `vault/session-xyz` (temporary)
- **Shared Vaults**: `vault/global` (single instance for all users)

Choose based on your needs:

- **Per-User**: Best for personalized settings, private keys
- **Per-Session**: Best for temporary auth flows
- **Shared**: Best for public endpoints, caching

### Cold Start Performance

Durable Objects have cold start overhead:

- First request to a new vault instance may take longer
- WASM initialization adds ~50-100ms
- Subsequent requests are fast (in-memory)

Strategies:

1. **Warm-up requests**: Send periodic health checks
2. **Connection pooling**: Reuse vault instances
3. **Caching**: Cache OIDC configs, public keys

### Request Limits

Cloudflare Workers have limits:

- **CPU time**: 100ms per request (increased for WASM)
- **Subrequest limit**: 50 subrequests per request
- **Response size**: 100MB max

Monitor usage in Cloudflare dashboard.

## Security

### Isolation

Each Durable Object instance is isolated:

- Separate memory space
- Separate storage
- No cross-instance access

### Authentication

Use Cloudflare Access or custom auth:

```typescript
// Verify JWT before forwarding to vault
async function authenticateRequest(request: Request): Promise<string | null> {
  const token = request.headers.get('Authorization')?.replace('Bearer ', '');
  if (!token) return null;

  // Verify JWT (use jose, jsonwebtoken, etc.)
  const payload = await verifyJWT(token);
  return payload.userId;
}

// In fetch handler
const userId = await authenticateRequest(request);
if (!userId) {
  return Response.json({ error: 'Unauthorized' }, { status: 401 });
}

// Forward to vault
const response = await env.VAULT.fetch(
  new Request(`https://vault/vault/${userId}/...`)
);
```

### Rate Limiting

Implement rate limiting in your app worker:

```typescript
// Use Cloudflare Rate Limiting API or KV-based rate limiting
async function checkRateLimit(
  env: Env,
  userId: string,
  limit: number,
  window: number
): Promise<boolean> {
  const key = `ratelimit:${userId}`;
  const count = await env.OTP_STORE.get(key);

  if (count && parseInt(count) >= limit) {
    return false; // Rate limit exceeded
  }

  const newCount = count ? parseInt(count) + 1 : 1;
  await env.OTP_STORE.put(key, newCount.toString(), {
    expirationTtl: window,
  });

  return true; // Within rate limit
}
```

## Monitoring

### Logging

Vault worker logs are available in Cloudflare dashboard:

```typescript
// In vault worker
console.log(`[VaultWorker] Request: ${request.method} ${url.pathname}`);
console.log(`[VaultDurable] Processing payment for user ${userId}`);
```

### Analytics

Use Cloudflare Analytics:

- Request volume per vault instance
- Latency percentiles
- Error rates
- CPU usage

### Alerts

Set up alerts in Cloudflare:

- High error rate
- Slow response times
- CPU time limits exceeded

## Troubleshooting

### "Service binding not found"

Ensure the vault worker is deployed:

```bash
cd libs/vault
bun run deploy
```

### "Durable Object not found"

Check that migrations are applied:

```toml
# wrangler.toml
[[migrations]]
tag = "v1"
new_classes = ["VaultDurable"]
```

Redeploy if needed:

```bash
wrangler deploy --new-class VaultDurable
```

### WASM loading errors

Check that WASM module is built:

```bash
cd libs/vault
bun run build:wasm
```

Ensure WASM is in dist:

```bash
ls -lh dist/vault.wasm
```

### TypeScript errors

Install dependencies:

```bash
bun install @cloudflare/workers-types
```

Update tsconfig.json:

```json
{
  "compilerOptions": {
    "types": ["@cloudflare/workers-types"]
  }
}
```

## Migration from Service Worker

If you're migrating from the Service Worker version:

| Service Worker | Durable Object |
|---------------|----------------|
| `navigator.serviceWorker.register()` | Service binding |
| `fetch('/api/payment/...')` | `env.VAULT.fetch('https://vault/vault/{id}/api/payment/...')` |
| Client-side execution | Edge execution |
| Per-browser instance | Global, isolated instances |
| IndexedDB storage | Durable Objects storage |

**Benefits of Durable Objects:**

1. **Server-side execution**: More secure, faster
2. **Global distribution**: Runs on Cloudflare's edge
3. **Shared state**: Access from multiple clients
4. **Persistence**: State survives browser restarts
5. **Service bindings**: Easy integration with other workers

## Resources

- [Cloudflare Durable Objects Docs](https://developers.cloudflare.com/durable-objects/)
- [Service Bindings Docs](https://developers.cloudflare.com/workers/runtime-apis/bindings/service-bindings/)
- [Wrangler CLI Docs](https://developers.cloudflare.com/workers/wrangler/)
- [Workers Limits](https://developers.cloudflare.com/workers/platform/limits/)
