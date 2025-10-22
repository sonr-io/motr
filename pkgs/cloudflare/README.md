# @pkgs/cloudflare

A TypeScript package for building Cloudflare Workers applications with reusable Durable Object patterns.

## Features

- **Durable Objects**: Strongly consistent, low-latency coordination and storage
  - `CounterDurable`: Simple counter example demonstrating basic patterns
- **Monorepo-Friendly**: Uses workspace protocol for dependency management
- **Type-Safe**: Full TypeScript support with Cloudflare Workers types

## Migration Notes

- **SonrIdentityDurable** has been moved to `@sonr.io/enclave/cloudflare`
- **Workflows** have been moved to consuming applications (e.g., `@apps/frontend/src/workflows`)

## Installation

### Basic Installation

```bash
bun install @pkgs/cloudflare
```


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


## Configuration

Add to your `wrangler.toml`:

```toml
[[durable_objects.bindings]]
name = "COUNTER"
class_name = "CounterDurable"
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

## Migrated Components

### SonrIdentityDurable

This component has been moved to `@sonr.io/enclave/cloudflare`.

See the [Enclave Cloudflare documentation](../../libs/enclave/CLOUDFLARE.md) for usage.

### Workflows

Workflows should be defined in consuming applications for better organization and dependency management.

Example structure:
```
apps/frontend/
├── src/
│   └── workflows/
│       ├── index.ts
│       └── your-workflow.ts
└── wrangler.toml
```

## API Reference

### Durable Objects

#### CounterDurable

A simple counter implementation demonstrating Durable Object patterns.

**Methods:**
- `increment()`: Increments the counter and returns the new value
- `decrement()`: Decrements the counter and returns the new value
- `getValue()`: Returns the current counter value
- `reset()`: Resets the counter to 0


## Design Principles

### Reusable Patterns

This package provides reusable Durable Object patterns that can be imported into any Cloudflare Workers project:

1. **Workspace Protocol**: Uses `workspace:*` for monorepo compatibility
2. **Type-Safe**: Full TypeScript support with Cloudflare Workers types
3. **Simple Examples**: Clear, well-documented examples for learning
4. **Production Ready**: Battle-tested patterns for real-world use


## License

MIT
