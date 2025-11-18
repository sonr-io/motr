# @sonr.io/worker

Motr Worker - Cloudflare Worker for UCAN signing, transaction broadcasting, and session management.

## Architecture

This worker provides secure API endpoints for the Motr ecosystem:

- **Session Management**: User authentication state with KV storage
- **UCAN Orchestration**: Token validation and delegation for capabilities
- **Transaction Pipeline**: MPC signing and blockchain broadcasting
- **Identity Proxy**: Forwards identity operations to Enclave Durable Objects

### API-First Design

The worker focuses exclusively on API endpoints:
- No static asset serving (handled by `apps/frontend` static deployment)
- Service bindings to cryptographic workers (`ENCLAVE`, `VAULT`)
- Session-based authentication and authorization
- Secure transaction signing and broadcasting

## Project Structure

```
apps/worker/
├── src/
│   └── worker.ts                    # Main Hono worker with API endpoints
├── wrangler.toml                    # Cloudflare Worker configuration
├── package.json                     # Worker-specific scripts and dependencies
├── tsconfig.json                    # TypeScript configuration
├── .gitignore                       # Ignores .wrangler/
└── README.md                        # This file
```

## Development

### Prerequisites

Ensure cryptographic workers are available for service bindings:

```bash
# Deploy enclave and vault workers first
cd libs/enclave && wrangler deploy
cd libs/vault && wrangler deploy
```

### Local Development

```bash
# Start worker with Wrangler dev server
cd apps/worker
bun run dev

# Worker starts at http://localhost:8787
```

From the monorepo root:

```bash
# Start all workers in parallel
bun run dev
```

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
bun run deploy

# Or from monorepo root
WORKSPACES=@sonr.io/worker bun run deploy
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

## API Endpoints

The worker provides RESTful API endpoints for Motr operations:

### Session Management
- `GET /api/session` - Get current session data
- `POST /api/session/preferences` - Update user preferences
- `POST /api/session/logout` - Destroy session
- `POST /api/session/auth/visit` - Track auth page visits
- `POST /api/session/auth/registration-started` - Track registration start
- `POST /api/session/auth/registration-completed` - Track registration completion

### UCAN Operations
- `POST /api/ucan/validate` - Validate UCAN tokens and capabilities

### Transaction Operations
- `POST /api/tx/sign` - Sign transactions via MPC vault
- `POST /api/tx/broadcast` - Broadcast signed transactions to blockchains

### Identity Proxy
- `ALL /api/identity/*` - Proxy requests to Enclave Durable Objects

## Configuration

### Environment Variables

Configured in `wrangler.toml`:

- `ENVIRONMENT`: `development`, `staging`, or `production`
- `EMAIL_FROM`: Email sender for OTP notifications
- `RESEND_API_KEY`: API key for email service

### KV Namespaces

- `SESSIONS`: User session data with expiration
- `OTP_STORE`: One-time password storage with rate limiting
- `CHAIN_REGISTRY`: Blockchain network metadata
- `ASSET_REGISTRY`: Token and asset information

### Service Bindings

- `ENCLAVE`: Binding to Enclave Durable Object for identity operations
- `VAULT`: Binding to Vault worker for transaction signing and broadcasting

## Security Model

### Authentication
- Session-based authentication with secure HTTP-only cookies
- UCAN token validation for capability-based authorization
- Multi-party computation (MPC) for transaction security

### Authorization
- Capability-based access control via UCAN tokens
- Session validation for all privileged operations
- Service binding isolation between workers

### Data Protection
- Encrypted session data in KV storage
- Secure service-to-service communication
- Rate limiting on sensitive endpoints

## Scripts Reference

| Script | Description |
|--------|-------------|
| `bun run dev` | Start Wrangler dev server |
| `bun run deploy` | Deploy to production |
| `bun run deploy:staging` | Deploy to staging |
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

- **Frontend App**: `apps/frontend` (SPA with WebAuthn)
- **Data Server**: `apps/server` (Elysia API for realtime data)
- **WASM Libraries**: `libs/vault`, `libs/enclave`
- **SDK**: `@sonr.io/sdk` (client-side integrations)

## Troubleshooting

### Service Binding Errors

If service bindings fail:

```bash
# Ensure cryptographic workers are deployed
cd libs/enclave && wrangler deploy
cd libs/vault && wrangler deploy

# Check worker names match wrangler.toml
wrangler whoami
```

### Port Already in Use

If port 8787 is already in use, update `wrangler.toml`:

```toml
[dev]
port = 8788  # Change to available port
```

### Session Issues

If session management fails:

```bash
# Check KV namespace IDs in wrangler.toml
# Ensure preview/production IDs are different
wrangler kv:namespace list
```

### Transaction Signing Errors

If MPC signing fails:

```bash
# Check vault worker logs
cd libs/vault && wrangler tail

# Verify service binding configuration
wrangler deployments list
```

## Learn More

- [Cloudflare Workers Documentation](https://developers.cloudflare.com/workers/)
- [Hono Framework](https://hono.dev/)
- [Wrangler CLI](https://developers.cloudflare.com/workers/wrangler/)
- [UCAN Specification](https://ucan.xyz/)
- [WebAuthn API](https://developer.mozilla.org/en-US/docs/Web/API/Web_Authentication_API)
