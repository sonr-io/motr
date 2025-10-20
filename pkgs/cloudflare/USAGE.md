# @pkgs/cloudflare Usage Examples

This document provides comprehensive usage examples for maximum developer reach.

## Table of Contents

1. [Basic Setup](#basic-setup)
2. [Without Enclave](#without-enclave)
3. [With Enclave](#with-enclave)
4. [Checking Feature Availability](#checking-feature-availability)
5. [Error Handling](#error-handling)
6. [Production Patterns](#production-patterns)

## Basic Setup

### Minimal Installation

```bash
# Install core package
bun add @pkgs/cloudflare
```

```typescript
// worker.ts
export { CounterDurable, ExampleWorkflow } from '@pkgs/cloudflare';

export default {
  async fetch(request: Request, env: Env): Promise<Response> {
    const id = env.COUNTER.idFromName('my-counter');
    const stub = env.COUNTER.get(id);
    return stub.fetch(request);
  }
};
```

## Without Enclave

You can use all Durable Objects and Workflows **without** installing `@libs/enclave`:

### Counter Example

```typescript
import { CounterDurable } from '@pkgs/cloudflare';

export { CounterDurable };

export interface Env {
  COUNTER: DurableObjectNamespace;
}

export default {
  async fetch(request: Request, env: Env): Promise<Response> {
    const id = env.COUNTER.idFromName('global');
    const stub = env.COUNTER.get(id);

    const url = new URL(request.url);

    if (url.pathname === '/increment') {
      return stub.fetch(request);
    }

    return new Response('Counter API');
  }
};
```

### Workflow Example

```typescript
import { ExampleWorkflow } from '@pkgs/cloudflare';

export { ExampleWorkflow };

export interface Env {
  EXAMPLE_WORKFLOW: Workflow;
}

export default {
  async fetch(request: Request, env: Env): Promise<Response> {
    const instance = await env.EXAMPLE_WORKFLOW.create({
      params: {
        userId: '123',
        data: 'example'
      }
    });

    return Response.json({
      workflowId: instance.id,
      status: 'started'
    });
  }
};
```

## With Enclave

When you need identity management, add the optional dependency:

### Installation

```json
{
  "dependencies": {
    "@pkgs/cloudflare": "workspace:*",
    "@libs/enclave": "workspace:*"
  }
}
```

### Check Availability First

```typescript
import { SonrIdentityDurable } from '@pkgs/cloudflare';

// Recommended: Check before using
const isAvailable = await SonrIdentityDurable.isEnclaveAvailable();

if (!isAvailable) {
  throw new Error(
    'This feature requires @libs/enclave. ' +
    'Add "@libs/enclave": "workspace:*" to your package.json'
  );
}
```

### Full Identity Example

```typescript
import { SonrIdentityDurable } from '@pkgs/cloudflare';

export { SonrIdentityDurable };

export interface Env {
  SONR_IDENTITY: DurableObjectNamespace;
}

export default {
  async fetch(request: Request, env: Env): Promise<Response> {
    const url = new URL(request.url);

    // Route: /api/identity/{accountAddress}/{action}
    if (url.pathname.startsWith('/api/identity/')) {
      const parts = url.pathname.split('/');
      const accountAddress = parts[3];

      if (!accountAddress) {
        return Response.json(
          { error: 'Account address required' },
          { status: 400 }
        );
      }

      // Get Durable Object instance for this identity
      const id = env.SONR_IDENTITY.idFromName(accountAddress);
      const stub = env.SONR_IDENTITY.get(id);

      // Forward to DO, removing accountAddress from path
      const action = '/' + parts.slice(4).join('/');
      const proxyUrl = new URL(request.url);
      proxyUrl.pathname = action;

      return stub.fetch(proxyUrl.toString(), request);
    }

    return new Response('Identity API');
  }
};
```

## Checking Feature Availability

### Runtime Check

```typescript
async function setupIdentityFeature(env: Env) {
  // Check if enclave is available
  const hasEnclave = await SonrIdentityDurable.isEnclaveAvailable();

  if (!hasEnclave) {
    console.warn(
      '⚠️  Identity features disabled. ' +
      'Install @libs/enclave to enable.'
    );
    return null;
  }

  console.log('✓ Identity features enabled');
  return env.SONR_IDENTITY;
}
```

### Conditional Export

```typescript
// worker.ts
export { CounterDurable, ExampleWorkflow } from '@pkgs/cloudflare';

// Only export if enclave is installed
try {
  const { SonrIdentityDurable } = await import('@pkgs/cloudflare');
  export { SonrIdentityDurable };
  console.log('✓ Identity features enabled');
} catch {
  console.log('ℹ️  Identity features not available');
}
```

### Feature Flag Pattern

```typescript
export interface Env {
  COUNTER: DurableObjectNamespace;
  SONR_IDENTITY?: DurableObjectNamespace; // Optional
  ENABLE_IDENTITY_FEATURES?: string;
}

export default {
  async fetch(request: Request, env: Env): Promise<Response> {
    // Check both: module availability AND environment config
    const identityEnabled =
      env.ENABLE_IDENTITY_FEATURES === 'true' &&
      env.SONR_IDENTITY &&
      await SonrIdentityDurable.isEnclaveAvailable();

    if (identityEnabled) {
      // Use identity features
    } else {
      // Fallback behavior
    }

    return new Response('OK');
  }
};
```

## Error Handling

### Graceful Degradation

```typescript
async function handleIdentityRequest(
  request: Request,
  env: Env
): Promise<Response> {
  try {
    // Check if feature is available
    if (!await SonrIdentityDurable.isEnclaveAvailable()) {
      return Response.json({
        error: 'Identity features not available',
        message: 'Please install @libs/enclave',
        statusCode: 503
      }, { status: 503 });
    }

    // Use feature
    const id = env.SONR_IDENTITY.idFromName('user123');
    const stub = env.SONR_IDENTITY.get(id);
    return stub.fetch(request);

  } catch (error) {
    console.error('Identity error:', error);

    return Response.json({
      error: 'Internal server error',
      message: error.message
    }, { status: 500 });
  }
}
```

### Initialization Error Handling

```typescript
async function initializeIdentity(
  accountAddress: string,
  env: Env
): Promise<Response> {
  try {
    const response = await fetch(`/api/identity/${accountAddress}/initialize`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        wasmPath: '/enclave.wasm',
        accountAddress
      })
    });

    if (!response.ok) {
      const error = await response.json();

      if (error.message?.includes('@libs/enclave')) {
        throw new Error(
          'Enclave module not available. ' +
          'Add "@libs/enclave": "workspace:*" to package.json'
        );
      }

      throw new Error(error.message || 'Initialization failed');
    }

    return response;

  } catch (error) {
    console.error('Failed to initialize identity:', error);
    throw error;
  }
}
```

## Production Patterns

### Multi-Environment Setup

```typescript
// config.ts
export const config = {
  development: {
    enableIdentityFeatures: true,
    wasmPath: '/enclave.wasm',
    debug: true
  },
  staging: {
    enableIdentityFeatures: true,
    wasmPath: '/enclave.wasm',
    debug: false
  },
  production: {
    enableIdentityFeatures: false, // Controlled rollout
    wasmPath: '/enclave.wasm',
    debug: false
  }
};

// worker.ts
const env = config[process.env.ENVIRONMENT || 'development'];

if (env.enableIdentityFeatures) {
  const available = await SonrIdentityDurable.isEnclaveAvailable();
  if (available) {
    console.log('✓ Identity features enabled');
  } else {
    console.warn('⚠️  Identity features configured but module unavailable');
  }
}
```

### Health Check Endpoint

```typescript
export default {
  async fetch(request: Request, env: Env): Promise<Response> {
    if (request.url.endsWith('/health')) {
      const hasEnclave = await SonrIdentityDurable.isEnclaveAvailable();
      const activeEnclaves = hasEnclave ?
        SonrIdentityDurable.getActiveEnclaves() : [];

      return Response.json({
        status: 'ok',
        features: {
          counter: true,
          workflows: true,
          identity: hasEnclave
        },
        identity: hasEnclave ? {
          available: true,
          activeInstances: activeEnclaves.length,
          identities: activeEnclaves
        } : {
          available: false,
          message: 'Install @libs/enclave to enable'
        }
      });
    }

    // ... rest of handler
  }
};
```

### Gradual Migration

```typescript
// Start without enclave
export { CounterDurable } from '@pkgs/cloudflare';

// Later, when ready, add enclave
export { SonrIdentityDurable } from '@pkgs/cloudflare';

// In your package.json, add when ready:
// {
//   "dependencies": {
//     "@libs/enclave": "workspace:*"
//   }
// }
```

### Resource Monitoring

```typescript
// Periodic cleanup task
async function cleanupIdentities() {
  const available = await SonrIdentityDurable.isEnclaveAvailable();

  if (!available) {
    console.log('Enclave not available, skipping cleanup');
    return;
  }

  const before = SonrIdentityDurable.getActiveEnclaves();
  console.log('Active enclaves before cleanup:', before.length);

  await SonrIdentityDurable.cleanupUnusedEnclaves();

  const after = SonrIdentityDurable.getActiveEnclaves();
  console.log('Active enclaves after cleanup:', after.length);
  console.log('Cleaned up:', before.length - after.length, 'instances');
}

// Call periodically (e.g., via cron trigger)
export default {
  async scheduled(event: ScheduledEvent, env: Env, ctx: ExecutionContext) {
    ctx.waitUntil(cleanupIdentities());
  }
};
```

## Testing Patterns

### Unit Tests Without Enclave

```typescript
import { describe, it, expect } from 'vitest';
import { CounterDurable } from '@pkgs/cloudflare';

describe('CounterDurable', () => {
  it('should work without enclave', async () => {
    // Counter works independently
    const counter = new CounterDurable(/* ... */);
    // ... test counter functionality
    expect(counter).toBeDefined();
  });
});
```

### Integration Tests With Enclave

```typescript
import { describe, it, expect, beforeAll } from 'vitest';
import { SonrIdentityDurable } from '@pkgs/cloudflare';

describe('SonrIdentityDurable', () => {
  beforeAll(async () => {
    const available = await SonrIdentityDurable.isEnclaveAvailable();
    if (!available) {
      console.warn('Skipping identity tests - enclave not available');
    }
  });

  it('should check availability', async () => {
    const available = await SonrIdentityDurable.isEnclaveAvailable();
    expect(typeof available).toBe('boolean');
  });

  it('should initialize when available', async () => {
    const available = await SonrIdentityDurable.isEnclaveAvailable();

    if (!available) {
      // Skip test if enclave not installed
      console.log('Skipping - enclave not available');
      return;
    }

    // Test initialization
    // ...
  });
});
```

## Summary

This architecture provides:

✅ **Works without enclave**: Core features available immediately
✅ **Optional enhancement**: Add enclave when needed
✅ **Type safety**: Full TypeScript support
✅ **Clear errors**: Helpful messages when features unavailable
✅ **Monorepo friendly**: Uses workspace protocol
✅ **Gradual adoption**: Add features as your project grows
✅ **Production ready**: Battle-tested patterns for all scenarios

Choose the approach that fits your needs:
- Start simple with Counter and Workflows
- Add identity features when ready
- Scale gradually without breaking changes
