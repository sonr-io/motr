# Motr Orchestrator Architecture

## Overview

The Motr Orchestrator is a central Cloudflare Worker that routes requests to multiple frontend applications using service bindings, session state, and intelligent routing logic.

## Architecture Diagram

```
                                     ┌─────────────────────┐
                                     │   User's Browser    │
                                     └─────────┬───────────┘
                                               │
                                               ▼
                        ┌──────────────────────────────────────┐
                        │     Motr Orchestrator Worker         │
                        │      (apps/worker)                   │
                        │                                      │
                        │  • Session Management                │
                        │  • Routing Logic                     │
                        │  • Authentication State              │
                        └──────────────────────────────────────┘
                                       │
              ┌────────────────────────┼────────────────────────┐
              │                        │                        │
              ▼                        ▼                        ▼
    ┌─────────────────┐     ┌─────────────────┐     ┌─────────────────┐
    │   Auth App      │     │  Console App    │     │  Profile App    │
    │  (motr-auth)    │     │ (motr-console)  │     │ (motr-profile)  │
    │                 │     │                 │     │                 │
    │ • Login/Signup  │     │ • Admin UI      │     │ • User Profile  │
    │ • WebAuthn      │     │ • Dev Tools     │     │ • Settings      │
    │ • OTP           │     │ • Dashboards    │     │ • Identity Mgmt │
    └─────────────────┘     └─────────────────┘     └─────────────────┘
              │
              │
              ▼
    ┌─────────────────┐     ┌─────────────────┐
    │   Search App    │     │  Enclave Worker │
    │ (motr-search)   │     │ (motr-enclave)  │
    │                 │     │                 │
    │ • Search UI     │     │ • Durable       │
    │ • Indexing      │     │   Objects       │
    │ • Discovery     │     │ • Identity Core │
    └─────────────────┘     └─────────────────┘
```

## Request Flow

### 1. Subdomain Routing (Highest Priority)

```
console.sonr.id/dashboard   → Console App
profile.sonr.id/settings    → Profile App
search.sonr.id/             → Search App
sonr.id/login              → Auth App
```

### 2. Path-Based Routing

```
sonr.id/console/dashboard   → Console App
sonr.id/profile/settings    → Profile App
sonr.id/search/             → Search App
sonr.id/                   → Auth App
```

### 3. Session-Based Routing

For authenticated users on the main domain:

```typescript
if (user.authenticated) {
  if (user.preferences.defaultApp === 'console') → Console App
  else if (user.preferences.defaultApp === 'profile') → Profile App
  else → Console App (default for authenticated users)
} else {
  → Auth App (default for unauthenticated users)
}
```

## Service Bindings

The orchestrator uses Cloudflare Service Bindings to communicate with frontend apps:

```typescript
// In orchestrator worker
env.AUTH_APP.fetch(request)    // Forward to auth app
env.CONSOLE_APP.fetch(request) // Forward to console app
env.PROFILE_APP.fetch(request) // Forward to profile app
env.SEARCH_APP.fetch(request)  // Forward to search app
```

## Session Management

Sessions are stored in KV with 24-hour TTL:

```typescript
interface SessionData {
  userId?: string;
  username?: string;
  authenticated: boolean;
  createdAt: number;
  lastActivityAt: number;
  preferences?: {
    defaultApp?: 'console' | 'profile' | 'search';
  };
}
```

Session headers are automatically added to all service binding requests:

```
X-Session-Authenticated: true
X-Session-User-Id: sonr1abc...
X-Session-Username: alice
```

## Development Setup

### Running Locally

Each app can be run independently on its own port:

```bash
# Orchestrator (port 5165)
bun run dev:worker

# Individual apps
bun run dev:auth     # port 6165
bun run dev:console  # port 7165
bun run dev:profile  # port 8165
bun run dev:search   # port 9165
```

### Service Binding in Development

During local development, Wrangler automatically sets up service bindings between workers running on localhost.

## Production Deployment

### Deploy Order

1. Deploy individual frontend apps first:
```bash
bun run deploy:auth
bun run deploy:console
bun run deploy:profile
bun run deploy:search
```

2. Deploy orchestrator last:
```bash
bun run deploy:worker
```

### DNS Configuration

Configure DNS to point all routes to the orchestrator:

```
sonr.id                A/AAAA → Orchestrator
*.sonr.id              A/AAAA → Orchestrator
console.sonr.id        A/AAAA → Orchestrator
profile.sonr.id        A/AAAA → Orchestrator
search.sonr.id         A/AAAA → Orchestrator
```

## Benefits of This Architecture

1. **Independent Deployment**: Each frontend can be deployed independently
2. **Shared Session State**: Single session management across all apps
3. **Smart Routing**: Automatic routing based on user preferences
4. **Scalability**: Each service scales independently
5. **Modularity**: Easy to add new frontend apps
6. **Type Safety**: TypeScript across all services
7. **Performance**: Edge-native with minimal latency

## Migration from Old Architecture

### Before (Multiple Independent Workers)

```
sonr.id/*        → motr-auth worker
console.sonr.id/* → motr-console worker
profile.sonr.id/* → motr-profile worker
search.sonr.id/*  → motr-search worker
```

Problems:
- No shared session state
- Separate deployments for routing changes
- Duplicate KV namespaces
- No unified authentication flow

### After (Orchestrator Pattern)

```
sonr.id/*         → motr-orchestrator → routes to appropriate app
console.sonr.id/* → motr-orchestrator → routes to appropriate app
profile.sonr.id/* → motr-orchestrator → routes to appropriate app
search.sonr.id/*  → motr-orchestrator → routes to appropriate app
```

Benefits:
- Shared session state
- Centralized routing logic
- Single source of truth for authentication
- Easier to add new apps

## Future Enhancements

- [ ] Add rate limiting in orchestrator
- [ ] Implement request/response caching
- [ ] Add A/B testing support
- [ ] Implement feature flags
- [ ] Add analytics and monitoring
- [ ] Support for custom routing rules per user
- [ ] WebSocket support through orchestrator
- [ ] Multi-region session replication
