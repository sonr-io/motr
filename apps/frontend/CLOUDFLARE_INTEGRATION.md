# Cloudflare Integration in Frontend

This document explains how `@apps/frontend` leverages `@pkgs/cloudflare` for Durable Objects and Workflows.

## Overview

The frontend uses `@pkgs/cloudflare` to access:
- **CounterDurable**: Simple counter example
- **SonrIdentityDurable**: Persistent identity management wrapping `@libs/enclave`
- **ExampleWorkflow**: Workflow orchestration examples
- **AsyncTaskWorkflow**: Async task processing

## Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                    @apps/frontend                           │
│                                                             │
│  ┌──────────────────────────────────────────────────────┐  │
│  │  React Components                                    │  │
│  │  - IdentityManager.tsx                               │  │
│  │  - Other UI components                               │  │
│  └────────────────┬─────────────────────────────────────┘  │
│                   │ HTTP Requests                           │
│                   ▼                                         │
│  ┌──────────────────────────────────────────────────────┐  │
│  │  Cloudflare Worker (worker.ts)                       │  │
│  │  - Serves static assets                              │  │
│  │  - Routes API requests to Durable Objects            │  │
│  └────────────────┬─────────────────────────────────────┘  │
│                   │                                         │
└───────────────────┼─────────────────────────────────────────┘
                    │
                    ▼
┌─────────────────────────────────────────────────────────────┐
│              @pkgs/cloudflare                               │
│                                                             │
│  ┌────────────────────┐  ┌─────────────────────────────┐  │
│  │ CounterDurable     │  │ SonrIdentityDurable         │  │
│  │ - Simple example   │  │ - Identity management       │  │
│  └────────────────────┘  │ - Wraps @libs/enclave       │  │
│                          │ - Persistent state          │  │
│                          │ - WebSocket support         │  │
│                          └─────────────┬───────────────┘  │
│                                        │                   │
└────────────────────────────────────────┼───────────────────┘
                                         │
                                         ▼
                        ┌──────────────────────────────────┐
                        │      @libs/enclave               │
                        │  - EnclaveWorkerClient           │
                        │  - Web Worker                    │
                        │  - WASM Runtime                  │
                        │  - IndexedDB Storage             │
                        └──────────────────────────────────┘
```

## Configuration

### wrangler.toml

```toml
# Durable Objects bindings
[[durable_objects.bindings]]
name = "COUNTER"
class_name = "CounterDurable"

[[durable_objects.bindings]]
name = "SONR_IDENTITY"
class_name = "SonrIdentityDurable"

# Durable Object migrations
[[migrations]]
tag = "v1"
new_classes = ["CounterDurable"]

[[migrations]]
tag = "v2"
new_classes = ["SonrIdentityDurable"]

# Workflows
[[workflows]]
binding = "EXAMPLE_WORKFLOW"
name = "example-workflow"
class_name = "ExampleWorkflow"
```

### package.json

```json
{
  "dependencies": {
    "@libs/enclave": "workspace:*",
    "@pkgs/cloudflare": "workspace:*"
  }
}
```

### worker.ts

```typescript
// Export Durable Objects and Workflows from @pkgs/cloudflare
export {
  CounterDurable,
  SonrIdentityDurable,
  ExampleWorkflow,
  AsyncTaskWorkflow
} from '@pkgs/cloudflare';

// Define environment bindings
export interface Env {
  COUNTER: DurableObjectNamespace;
  SONR_IDENTITY: DurableObjectNamespace;
  EXAMPLE_WORKFLOW: Workflow;
  ASYNC_TASK_WORKFLOW: Workflow;
}
```

## API Endpoints

### Counter API

```
GET  /api/counter/value      - Get current value
POST /api/counter/increment  - Increment counter
POST /api/counter/decrement  - Decrement counter
POST /api/counter/reset      - Reset to 0
```

### Identity API

All endpoints follow: `/api/identity/{accountAddress}/{action}`

```
POST /api/identity/sonr1.../initialize  - Initialize identity
GET  /api/identity/sonr1.../status      - Get status
GET  /api/identity/sonr1.../did         - Get DID
POST /api/identity/sonr1.../sign        - Sign data
POST /api/identity/sonr1.../verify      - Verify signature
POST /api/identity/sonr1.../tokens/origin      - Create origin token
POST /api/identity/sonr1.../tokens/attenuated  - Create attenuated token
GET  /api/identity/sonr1.../tokens/list        - List tokens
```

### Workflow API

```
POST /api/workflows/example/start  - Start ExampleWorkflow
POST /api/workflows/task/start     - Start AsyncTaskWorkflow
```

## Usage Examples

### Using IdentityManager Component

```typescript
import { IdentityManager } from './components/IdentityManager';

function App() {
  return <IdentityManager />;
}
```

### Direct API Calls

```typescript
// Initialize identity
const response = await fetch('/api/identity/sonr1abc.../initialize', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    wasmPath: '/enclave.wasm',
    accountAddress: 'sonr1abc...'
  })
});

// Sign data
const signResponse = await fetch('/api/identity/sonr1abc.../sign', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    data: Array.from(new TextEncoder().encode('Hello!'))
  })
});

const { signature } = await signResponse.json();
```

### Using Counter

```typescript
const response = await fetch('/api/counter/increment', {
  method: 'POST'
});

const { value } = await response.json();
console.log('Counter value:', value);
```

## Development

### Local Development

```bash
# Start dev server
bun run dev

# Access identity manager
# Navigate to http://localhost:6165/identity
```

### Testing Identity Features

1. Navigate to `/identity` route
2. Enter an account address (e.g., `sonr1test`)
3. Click "Initialize Identity"
4. Try other operations:
   - Check Status
   - Get DID
   - Sign Data

### Viewing Logs

```bash
# View worker logs
bun run logs

# Logs show:
# [Worker Init] Loading Cloudflare features from @pkgs/cloudflare...
# [Worker Init] ✓ Loaded Durable Objects: CounterDurable, SonrIdentityDurable
# [Durable Object] Accessing SonrIdentityDurable...
# [SonrIdentityDurable] Creating NEW enclave instance...
```

## Deployment

### Staging

```bash
bun run deploy:staging
```

### Production

```bash
bun run deploy:production
```

## Key Features

### Persistent State
- Each identity gets its own Durable Object instance
- State persists across requests and worker restarts
- Globally distributed via Cloudflare's network

### Real-time Updates
- WebSocket support for live updates
- Broadcast events to all connected clients
- Session management

### Graceful Degradation
- If `@libs/enclave` is not available, clear error messages
- Feature availability checking
- Fallback behaviors

### Resource Management
- Singleton pattern per identity
- Automatic cleanup of expired tokens
- Efficient memory usage

## Troubleshooting

### "Enclave not initialized"

Make sure you've called the initialize endpoint first:

```typescript
await fetch(`/api/identity/${accountAddress}/initialize`, {
  method: 'POST',
  body: JSON.stringify({
    wasmPath: '/enclave.wasm',
    accountAddress
  })
});
```

### "@libs/enclave not available"

Ensure it's installed:

```bash
# Check package.json
"dependencies": {
  "@libs/enclave": "workspace:*"
}

# Install
bun install
```

### Durable Object not found

Check wrangler.toml has the correct bindings and migrations.

### WASM file not found

Ensure the enclave.wasm file is copied to the public directory:

```bash
# Copy vault files
bun run copy:vault
```

## Benefits

✅ **Persistent Identity**: State survives worker restarts
✅ **Global Distribution**: Cloudflare distributes instances worldwide
✅ **Type Safety**: Full TypeScript support
✅ **Real-time**: WebSocket for live updates
✅ **Scalable**: Cloudflare handles scaling automatically
✅ **Isolated**: Each identity in its own Durable Object
✅ **Efficient**: Singleton pattern prevents duplicates

## Next Steps

1. Explore the `/identity` route to test identity operations
2. Check worker logs to see the integration in action
3. Add custom API endpoints for your use case
4. Extend IdentityManager with more features
5. Deploy to staging/production

For more details, see:
- `@pkgs/cloudflare/README.md` - Package documentation
- `@pkgs/cloudflare/ARCHITECTURE.md` - Technical architecture
- `@pkgs/cloudflare/USAGE.md` - Comprehensive examples
