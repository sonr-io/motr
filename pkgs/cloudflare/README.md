# @pkgs/cloudflare

A TypeScript package for building Cloudflare Workers applications with Durable Objects and Workflows, designed for maximum developer reach and monorepo compatibility.

## Features

- **Durable Objects**: Strongly consistent, low-latency coordination and storage
  - `CounterDurable`: Simple counter example
  - `SonrIdentityDurable`: Advanced identity management with optional `@libs/enclave` integration
- **Workflows**: Orchestrate complex, long-running processes with automatic retries and state management
- **Optional Dependencies**: Works with or without `@libs/enclave` installed
- **Monorepo-Friendly**: Uses workspace protocol and optional peer dependencies
- **Type-Safe**: Full TypeScript support with type-only imports

## Installation

### Basic Installation

```bash
bun install @pkgs/cloudflare
```

### With Enclave Support (Optional)

To use `SonrIdentityDurable`, add `@libs/enclave` as a workspace dependency:

```json
{
  "dependencies": {
    "@pkgs/cloudflare": "workspace:*",
    "@libs/enclave": "workspace:*"
  }
}
```

**Note**: `@libs/enclave` is completely optional. All other Durable Objects and Workflows work without it.

## Usage

### Durable Objects

Durable Objects provide strongly consistent coordination and storage for Cloudflare Workers.

```typescript
import { CounterDurable } from '@pkgs/cloudflare';

// In your worker
export { CounterDurable };

export default {
  async fetch(request: Request, env: Env): Promise<Response> {
    const id = env.COUNTER.idFromName('my-counter');
    const stub = env.COUNTER.get(id);

    const count = await stub.increment();
    return new Response(`Count: ${count}`);
  }
};
```

### Workflows

Workflows help you orchestrate complex, long-running processes with automatic state management.

```typescript
import { ExampleWorkflow } from '@pkgs/cloudflare';

// In your worker
export default {
  async fetch(request: Request, env: Env): Promise<Response> {
    const instance = await env.WORKFLOW.create({
      params: { userId: '123', data: 'example' }
    });

    return new Response(JSON.stringify({
      instanceId: instance.id
    }));
  }
};
```

## Configuration

Add to your `wrangler.toml`:

```toml
[[durable_objects.bindings]]
name = "COUNTER"
class_name = "CounterDurable"

[workflows]
binding = "WORKFLOW"
class_name = "ExampleWorkflow"
```

## Development

```bash
# Install dependencies
bun install

# Run tests
bun test

# Build
bun run build
```

## SonrIdentityDurable (Optional Feature)

The `SonrIdentityDurable` provides persistent identity management by wrapping `@libs/enclave`. This is an **optional feature** that requires `@libs/enclave` to be installed.

### Checking Availability

```typescript
import { SonrIdentityDurable } from '@pkgs/cloudflare';

// Check if enclave is available before using
const isAvailable = await SonrIdentityDurable.isEnclaveAvailable();

if (isAvailable) {
  console.log('SonrIdentityDurable is fully functional');
} else {
  console.log('SonrIdentityDurable requires @libs/enclave to be installed');
}
```

### Usage Example

```typescript
// Initialize identity
await fetch('/api/identity/sonr1abc.../initialize', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    wasmPath: '/enclave.wasm',
    accountAddress: 'sonr1abc...'
  })
});

// Sign data
const response = await fetch('/api/identity/sonr1abc.../sign', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    data: Array.from(new TextEncoder().encode('Hello, Sonr!'))
  })
});

const { signature } = await response.json();
```

### API Endpoints

All endpoints follow: `/api/identity/{identityId}/{action}`

- `POST /initialize` - Initialize with WASM and account address
- `GET /status` - Get initialization status
- `GET /did` - Get issuer DID and address
- `POST /tokens/origin` - Create origin UCAN token
- `POST /tokens/attenuated` - Create attenuated UCAN token
- `GET /tokens/list` - List all tokens
- `POST /sign` - Sign data
- `POST /verify` - Verify signature
- `POST /accounts/switch` - Switch to different account
- `GET /accounts/list` - List all accounts

## API Reference

### Durable Objects

#### CounterDurable

A simple counter implementation demonstrating Durable Object patterns.

**Methods:**
- `increment()`: Increments the counter and returns the new value
- `decrement()`: Decrements the counter and returns the new value
- `getValue()`: Returns the current counter value
- `reset()`: Resets the counter to 0

#### SonrIdentityDurable

Advanced identity management Durable Object with optional `@libs/enclave` integration.

**Features:**
- Persistent identity state across requests
- MPC-based key management (when @libs/enclave is available)
- UCAN token operations
- Signing and verification
- WebSocket support for real-time updates
- Automatic resource cleanup

**Static Methods:**
- `isEnclaveAvailable()`: Check if @libs/enclave is installed
- `getActiveEnclaves()`: Get list of active identity instances
- `cleanupUnusedEnclaves()`: Cleanup inactive instances

### Workflows

#### ExampleWorkflow

A workflow demonstrating basic workflow patterns with steps and error handling.

**Configuration:**
- Automatic retries on failure
- State persistence
- Step-by-step execution tracking

## Design Principles

### Maximum Developer Reach

1. **Optional Dependencies**: `@libs/enclave` is a peer dependency with `optional: true`
2. **Type-Only Imports**: Uses TypeScript's type-only imports to avoid bundling
3. **Dynamic Loading**: Loads modules at runtime with proper error handling
4. **Monorepo Compatibility**: Works with workspace protocol (`workspace:*`)
5. **Graceful Degradation**: Package works perfectly without optional dependencies

### Architecture Benefits

- **No Breaking Changes**: Existing code continues to work
- **Flexible Integration**: Use only what you need
- **Clear Error Messages**: Helpful messages when optional features are unavailable
- **Singleton Pattern**: Efficient resource management per identity
- **Comprehensive Logging**: All operations logged for debugging

## Troubleshooting

### "Module not found: @libs/enclave"

This means `SonrIdentityDurable` is trying to use enclave features, but the module isn't installed.

**Solution:**
```bash
# Add to your package.json
{
  "dependencies": {
    "@libs/enclave": "workspace:*"
  }
}

# Then install
bun install
```

### Checking Module Availability

```typescript
const available = await SonrIdentityDurable.isEnclaveAvailable();
console.log('Enclave available:', available);
```

## License

MIT
