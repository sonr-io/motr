# @sonr.io/api

Motr Orchestrator Worker - Central Cloudflare Worker serving the consolidated frontend app with session management and smart routing.

## Architecture

This worker serves as the main orchestrator for the Sonr ecosystem:

- **Static Asset Serving**: Serves built Vite apps from local `public/` directory (self-contained)
- **Smart Routing**: Routes based on subdomain, path, and session state
- **Session Management**: Handles user sessions with KV storage
- **API Gateway**: Proxies identity API calls to the Enclave worker

### Self-Contained Design

The worker package is fully self-contained for Cloudflare deployment:
- All frontend assets are aggregated into `apps/api/public/` during build
- WASM binaries are copied from libs into `public/wasm/`
- No dependencies on root-level directories
- Ready for independent deployment

## Project Structure

```
apps/api/
├── src/
│   └── worker.ts                    # Main Hono worker with routing logic
├── scripts/
│   └── build-worker-assets.ts       # Aggregates built apps into public/
├── public/                          # Build output (git-ignored)
│   ├── web/                         # Frontend app assets
│   └── wasm/                        # WASM binaries (vault.wasm, enclave.wasm)
├── wrangler.toml                    # Cloudflare Worker configuration
├── package.json                     # Worker-specific scripts and dependencies
├── tsconfig.json                    # TypeScript configuration
├── .gitignore                       # Ignores public/, .wrangler/
└── README.md                        # This file
```

## Development

### Prerequisites

Before developing the worker, ensure all frontend apps and libraries are built:

```bash
# From monorepo root
bun run build
```

### Local Development

```bash
# Start worker with Wrangler dev server
cd apps/api
bun run dev

# Opens browser and starts worker at http://localhost:5165
```

Alternatively, from the monorepo root:

```bash
bun run dev
```

### Build Assets

The worker serves static assets from its local `public/` directory (self-contained). To rebuild assets:

```bash
# From worker directory
bun run build

# Or from monorepo root
bun run worker:build
```

This script:
1. Cleans the `apps/api/public/` directory
2. Copies all built frontend app assets from `apps/web/dist` to `public/web/`
3. Copies WASM files from `libs/*/dist` to `public/wasm/`

**Note**: The `public/` directory is git-ignored and regenerated on each build.

### Type Checking

```bash
bun run typecheck
```

### Clean Build Artifacts

```bash
bun run clean
```

## Deployment

### Deploy to Production

```bash
# From worker directory
bun run deploy:production

# Or from monorepo root
bun run deploy:production
```

### Deploy to Staging

```bash
bun run deploy:staging
```

### Preview with Remote Bindings

Test the worker with production-like bindings before deploying:

```bash
bun run preview
```

## Logs

View real-time logs from deployed workers:

```bash
# Production logs
bun run logs

# Staging logs
bun run logs:staging
```

## Routing Strategy

The worker uses Hono and routes requests based on:

1. **Subdomain routing** (highest priority):
   - `console.sonr.id/*` → Console app
   - `profile.sonr.id/*` → Profile app
   - `search.sonr.id/*` → Search app

2. **Path-based routing**:
   - `/console/*` → Console app
   - `/profile/*` → Profile app
   - `/search/*` → Search app

3. **Session-based routing**:
   - Authenticated users → User's default app preference or Console
   - Unauthenticated users → Auth app

## Configuration

### Environment Variables

Configured in `wrangler.toml`:

- `ENVIRONMENT`: `development`, `staging`, or `production`
- `EMAIL_FROM`: Email sender for notifications

### KV Namespaces

- `SESSIONS`: User session storage
- `OTP_STORE`: One-time password storage
- `CHAIN_REGISTRY`: Blockchain chain metadata
- `ASSET_REGISTRY`: Asset metadata

### Service Bindings

- `ENCLAVE`: Binding to the Enclave Durable Object worker

## API Routes

All API routes are mounted at `/api`:

- `GET /api/session` - Get current session
- `POST /api/session/preferences` - Update session preferences
- `POST /api/session/logout` - Logout and clear session
- `ALL /api/identity/*` - Proxy to Enclave worker

## Asset Routing

Special routes for shared assets:

- `/assets/*` - Redirects to app-specific assets based on referer
- `/shared/*` - Shared vendor chunks (cached forever)
- `/sw.js`, `/wasm_exec.js`, `/vault.wasm`, `/enclave.wasm` - WASM-related files

## Scripts Reference

| Script | Description |
|--------|-------------|
| `bun run build` | Aggregate all frontend assets into public/ |
| `bun run dev` | Build assets and start Wrangler dev server |
| `bun run deploy` | Deploy to production |
| `bun run deploy:staging` | Deploy to staging |
| `bun run deploy:production` | Deploy to production (explicit) |
| `bun run preview` | Test with remote bindings |
| `bun run logs` | View production logs |
| `bun run logs:staging` | View staging logs |
| `bun run typecheck` | Type check TypeScript |
| `bun run clean` | Remove build artifacts |

## Dependencies

- **hono**: Fast web framework for Cloudflare Workers
- **@cloudflare/workers-types**: TypeScript types for Workers
- **wrangler**: Cloudflare Workers CLI tool

## Related Packages

- **Frontend Apps**: `apps/auth`, `apps/console`, `apps/profile`, `apps/search`
- **WASM Libraries**: `libs/vault`, `libs/enclave`
- **Enclave Worker**: Durable Object at `libs/enclave/src/durable.ts`

## Troubleshooting

### Assets Not Found

If assets are not being served correctly:

```bash
# Rebuild all apps and worker assets
cd ../..  # Go to monorepo root
bun run build
cd x/worker
bun run dev
```

### Port Already in Use

If port 5165 is already in use, update `wrangler.toml`:

```toml
[dev]
port = 5166  # Change to available port
```

### Service Binding Errors

If the Enclave worker binding fails:

```bash
# Ensure Enclave worker is deployed
cd ../libs/enclave
wrangler deploy
```

## Learn More

- [Cloudflare Workers Documentation](https://developers.cloudflare.com/workers/)
- [Hono Framework](https://hono.dev/)
- [Wrangler CLI](https://developers.cloudflare.com/workers/wrangler/)
