# Motr Orchestrator Worker

Central Cloudflare Worker that orchestrates and routes requests to multiple frontend applications based on session state, subdomain, and path routing.

## Architecture

The Motr Orchestrator acts as an intelligent router that:

- **Routes unauthenticated users** to the auth app for login/registration
- **Routes authenticated users** based on their preferences or subdomain/path
- **Manages session state** across all frontend apps
- **Provides service bindings** to all frontend workers and the enclave

### Service Bindings

The orchestrator connects to these services:

- **AUTH_APP** (`motr-auth`) - Authentication and identity flows
- **CONSOLE_APP** (`motr-console`) - Developer/admin console
- **PROFILE_APP** (`motr-profile`) - User profile management
- **SEARCH_APP** (`motr-search`) - Search functionality
- **ENCLAVE** (`motr-enclave`) - Sonr Identity Durable Object

### Routing Strategy

The orchestrator uses a multi-layer routing approach:

1. **Subdomain Routing** (highest priority)
   - `console.sonr.id/*` → Console App
   - `profile.sonr.id/*` → Profile App
   - `search.sonr.id/*` → Search App
   - `sonr.id/*` → Auth App (default)

2. **Path-Based Routing**
   - `/console/*` → Console App
   - `/profile/*` → Profile App
   - `/search/*` → Search App
   - `/*` → Auth App (default)

3. **Session-Based Routing** (for authenticated users on main domain)
   - Uses user's `preferences.defaultApp` setting
   - Falls back to Console App for authenticated users
   - Falls back to Auth App for unauthenticated users

## Development

### Prerequisites

- Bun >= 1.3.0
- Wrangler >= 4.43.0

### Local Development

```bash
# From monorepo root
bun run dev:worker

# Or from this directory
bun run dev
```

The orchestrator will run on `http://localhost:5165` by default.

### Building

```bash
bun run build
```

### Type Checking

```bash
bun run typecheck
```

## Deployment

### Deploy to Production

```bash
bun run deploy:production
```

### Deploy to Staging

```bash
bun run deploy:staging
```

### Deploy from Monorepo Root

```bash
# From monorepo root
bun run deploy:worker
```

## Session Management

The orchestrator provides session management APIs:

### Get Session Info

```bash
GET /api/session
```

Response:
```json
{
  "authenticated": true,
  "userId": "sonr1abc...",
  "username": "alice",
  "preferences": {
    "defaultApp": "console"
  }
}
```

### Update Preferences

```bash
POST /api/session/preferences
Content-Type: application/json

{
  "defaultApp": "profile"
}
```

### Logout

```bash
POST /api/session/logout
```

## Environment Variables

Configure in `wrangler.toml`:

- `ENVIRONMENT` - Current environment (production/staging/development)
- `EMAIL_FROM` - Default email sender address

## KV Namespaces

- `SESSIONS` - Session data storage (24 hour TTL)
- `OTP_STORE` - OTP codes for email verification
- `CHAIN_REGISTRY` - Blockchain chain configurations
- `ASSET_REGISTRY` - Asset/token metadata

## Configuration

### Adding New Frontend Apps

1. Deploy the new frontend as a Cloudflare Worker
2. Add service binding in `wrangler.toml`:

```toml
[[services]]
binding = "NEW_APP"
service = "motr-new-app"
```

3. Add routing logic in `src/worker.ts`:

```typescript
if (subdomain === 'new-app') {
  return routeToApp(env.NEW_APP, request, session);
}
```

4. Update `Env` interface:

```typescript
export interface Env {
  NEW_APP: Fetcher;
  // ... other bindings
}
```

## Observability

The orchestrator has observability enabled with:

- Request logging with method, hostname, and path
- Session authentication state logging
- 100% head sampling rate for traces

View logs:

```bash
bun run logs
```

## Production Routes

Configured custom domain routes:

- `sonr.id/*` - Main domain
- `*.sonr.id/*` - All subdomains
- `console.sonr.id/*` - Console subdomain
- `profile.sonr.id/*` - Profile subdomain
- `search.sonr.id/*` - Search subdomain

## Related Documentation

- [Auth App](../auth/README.md)
- [Console App](../console/README.md)
- [Profile App](../profile/README.md)
- [Search App](../search/README.md)
- [Cloudflare Workers Service Bindings](https://developers.cloudflare.com/workers/runtime-apis/bindings/service-bindings/)
