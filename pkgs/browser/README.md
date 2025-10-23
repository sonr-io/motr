# @sonr.io/browser

Framework-agnostic browser client with Web Worker WASM integration for the Sonr ecosystem.

## Features

- ⚡ **Web Worker Architecture** - All WASM operations run off the main thread
- 🔐 **WASM Cryptography** - Enclave and Vault WASM modules for secure operations
- 🎨 **Framework-Agnostic** - Works with vanilla JS, React, Vue, Svelte, or any framework
- 🧩 **Custom Elements** - Web Components for easy integration
- 📦 **Vite Plugin** - Automatic WASM and worker bundling
- 💾 **IndexedDB Persistence** - Local data storage with cross-tab sync
- 🔑 **WebAuthn Support** - Modern authentication
- ⛓️ **Blockchain Integration** - Full Sonr network support
- 📘 **TypeScript** - Full type safety and IntelliSense

## Installation

```bash
# Using bun
bun add @sonr.io/browser

# Using npm
npm install @sonr.io/browser

# Using pnpm
pnpm add @sonr.io/browser
```

## Quick Start

### 1. Setup Vite Plugin

Add the Sonr Browser plugin to your `vite.config.ts`:

```typescript
import { defineConfig } from 'vite';
import { sonrBrowserPlugin } from '@sonr.io/browser/vite-plugin';

export default defineConfig({
  plugins: [
    sonrBrowserPlugin({
      enableEnclave: true,
      enableVault: true,
      debug: true,
    }),
  ],
});
```

### 2. Initialize Browser Client

```typescript
import { SonrBrowser } from '@sonr.io/browser';

// Create browser client
const browser = new SonrBrowser({
  network: 'testnet',
  autoConnect: true,
  debug: true,
});

// Initialize
await browser.initialize();

// Listen to events
browser.on('state:changed', (event) => {
  console.log('State changed:', event.detail.state);
});

browser.on('auth:authenticated', (event) => {
  console.log('Authenticated:', event.detail.address);
});
```

### 3. Use Custom Elements

```html
<!DOCTYPE html>
<html>
  <head>
    <script type="module">
      import '@sonr.io/browser/elements';
    </script>
  </head>
  <body>
    <!-- Wallet component -->
    <sonr-wallet
      network="testnet"
      theme="dark"
      show-balance="true">
    </sonr-wallet>

    <script type="module">
      const wallet = document.querySelector('sonr-wallet');

      wallet.addEventListener('wallet:connected', (e) => {
        console.log('Wallet connected:', e.detail);
      });
    </script>
  </body>
</html>
```

## API Reference

### SonrBrowser

Main browser client for Sonr interactions.

```typescript
import { SonrBrowser, BrowserClientState } from '@sonr.io/browser';

const browser = new SonrBrowser({
  network: 'testnet',          // Network: mainnet, testnet, devnet
  rpcUrl?: string,             // Custom RPC endpoint
  enableEnclave: true,         // Enable enclave worker
  enableVault: true,           // Enable vault worker
  useSharedWorkers: false,     // Use SharedWorker for cross-tab
  autoConnect: true,           // Auto-connect on init
  debug: false,                // Enable debug logging
});
```

#### Methods

```typescript
// Initialize the client
await browser.initialize();

// Connect to network
await browser.connect();

// Disconnect from network
await browser.disconnect();

// Cleanup resources
await browser.cleanup();

// Access enclave client
const enclave = browser.enclave;
await enclave.signData({ data: new Uint8Array([1, 2, 3]) });

// Access vault client
const vault = browser.vault;
await vault.persistState();

// Access RPC client
const rpc = browser.rpc;
const balance = await rpc.getBalance(address);

// Get current state
const state = browser.getState(); // BrowserClientState enum

// Check status
const isInitialized = browser.isInitialized();
const isConnected = browser.isConnected();
const isReady = browser.isReady();

// Get worker statistics
const stats = browser.getWorkerStats();
```

#### Events

```typescript
// State changes
browser.on('state:changed', (event) => {
  console.log(event.detail.state);
});

// Authentication events
browser.on('auth:registered', (event) => {
  console.log(event.detail.address, event.detail.did);
});

browser.on('auth:authenticated', (event) => {
  console.log(event.detail.address);
});

browser.on('auth:logout', (event) => {
  console.log(event.detail.address);
});

// Transaction events
browser.on('tx:signed', (event) => {
  console.log(event.detail.txHash);
});

browser.on('tx:broadcast', (event) => {
  console.log(event.detail.txHash);
});

browser.on('tx:confirmed', (event) => {
  console.log(event.detail.txHash, event.detail.height);
});

// Errors
browser.on('error', (event) => {
  console.error(event.detail.error, event.detail.context);
});
```

### Worker Registry

Low-level worker management system.

```typescript
import { WorkerRegistry, WorkerType } from '@sonr.io/browser';

const registry = new WorkerRegistry({
  debug: true,
  defaultTimeout: 30000,
  autoRecover: true,
});

// Register a worker
const workerId = await registry.register({
  type: WorkerType.ENCLAVE,
  url: '/workers/enclave-worker.js',
  name: 'my-enclave-worker',
  shared: false,
});

// Send message to worker
const response = await registry.sendMessage(workerId, 'sign_data', {
  data: [1, 2, 3],
});

// Ping worker
const timestamp = await registry.ping(workerId);

// Terminate worker
await registry.terminate(workerId);

// Get statistics
const stats = registry.getStatistics();
```

### Custom Elements

#### `<sonr-wallet>`

Wallet display and connection component.

```html
<sonr-wallet
  network="testnet"
  theme="dark"
  show-balance="true"
  compact="false">
</sonr-wallet>
```

**Attributes:**
- `network` - Network to connect to (mainnet, testnet, devnet)
- `theme` - UI theme (light, dark)
- `show-balance` - Show wallet balance
- `compact` - Compact mode

**Events:**
- `wallet:connected` - Emitted when wallet connects
- `wallet:disconnected` - Emitted when wallet disconnects
- `wallet:error` - Emitted on error
- `wallet:balance-updated` - Emitted when balance updates

**Methods:**
```typescript
const wallet = document.querySelector('sonr-wallet');

// Refresh wallet data
await wallet.refresh();

// Get current address
const address = wallet.getAddress();

// Get balance
const { amount, denom } = wallet.getBalance();

// Check connection
const connected = wallet.isConnected();
```

### Vite Plugin

Configure WASM and worker bundling.

```typescript
import { sonrBrowserPlugin } from '@sonr.io/browser/vite-plugin';

sonrBrowserPlugin({
  // Enable/disable workers
  enableEnclave: true,
  enableVault: true,

  // Custom WASM paths
  enclaveWasmPath: 'dist/enclave.wasm',
  vaultWasmPath: 'dist/vault.wasm',

  // Worker configuration
  enableSharedWorkers: false,
  workerOutDir: 'workers',

  // Build options
  copyToPublic: true,
  enableWasmStreaming: true,

  // Service worker
  enableServiceWorker: false,

  // Debug
  debug: false,
});
```

## Usage Examples

### Vanilla JavaScript

```javascript
import { SonrBrowser } from '@sonr.io/browser';

const browser = new SonrBrowser({ network: 'testnet' });
await browser.initialize();

// Sign data with enclave
const signature = await browser.enclave.signData({
  data: new TextEncoder().encode('Hello, Sonr!'),
});

console.log('Signature:', signature);
```

### With React

```typescript
import { useEffect, useState } from 'react';
import { SonrBrowser } from '@sonr.io/browser';

function App() {
  const [browser, setBrowser] = useState<SonrBrowser>();
  const [address, setAddress] = useState<string>();

  useEffect(() => {
    const client = new SonrBrowser({ network: 'testnet' });

    client.on('auth:authenticated', (e) => {
      setAddress(e.detail.address);
    });

    client.initialize().then(() => setBrowser(client));

    return () => {
      client.cleanup();
    };
  }, []);

  return (
    <div>
      <h1>Sonr Browser Client</h1>
      {address && <p>Connected: {address}</p>}
      <sonr-wallet network="testnet" theme="dark" />
    </div>
  );
}
```

### With Vue

```vue
<script setup lang="ts">
import { ref, onMounted, onUnmounted } from 'vue';
import { SonrBrowser } from '@sonr.io/browser';
import '@sonr.io/browser/elements';

const browser = ref<SonrBrowser>();
const address = ref<string>();

onMounted(async () => {
  const client = new SonrBrowser({ network: 'testnet' });

  client.on('auth:authenticated', (e) => {
    address.value = e.detail.address;
  });

  await client.initialize();
  browser.value = client;
});

onUnmounted(() => {
  browser.value?.cleanup();
});
</script>

<template>
  <div>
    <h1>Sonr Browser Client</h1>
    <p v-if="address">Connected: {{ address }}</p>
    <sonr-wallet network="testnet" theme="dark" />
  </div>
</template>
```

### Advanced: Custom Worker

Create your own worker wrapper:

```typescript
import { WorkerRegistry, WorkerType } from '@sonr.io/browser';

// Register custom worker
const registry = getWorkerRegistry();

const workerId = await registry.register({
  type: WorkerType.ENCLAVE,
  url: new URL('./my-worker.ts', import.meta.url),
  name: 'my-custom-worker',
  initData: { config: 'value' },
});

// Use worker
const result = await registry.sendMessage(workerId, 'custom_action', {
  param: 'value',
});
```

### Cross-Tab Synchronization

Enable shared workers for cross-tab state:

```typescript
const browser = new SonrBrowser({
  network: 'testnet',
  useSharedWorkers: true,  // Enable SharedWorker
  enableCrossTabSync: true, // Enable cross-tab sync
});

await browser.initialize();

// State is now synchronized across all tabs
// Authentication, vault state, etc. are shared
```

## Browser Compatibility

Check browser compatibility:

```typescript
import { checkBrowserCompatibility } from '@sonr.io/browser';

const compat = checkBrowserCompatibility();

if (!compat.compatible) {
  console.error('Browser not supported');
  console.log('Missing features:', compat.features);
}

if (compat.warnings.length > 0) {
  console.warn('Compatibility warnings:', compat.warnings);
}
```

**Required Features:**
- ✅ Web Workers
- ✅ WebAssembly
- ✅ IndexedDB

**Optional Features:**
- SharedWorker (cross-tab sync)
- Custom Elements (web components)
- BroadcastChannel (cross-tab messaging)
- Web Crypto API (cryptographic operations)

## Architecture

```
┌─────────────────────────────────────────┐
│         Browser Application             │
│  (Vanilla JS, React, Vue, Svelte...)    │
└─────────────┬───────────────────────────┘
              │
┌─────────────▼───────────────────────────┐
│       @sonr.io/browser Client           │
│  - SonrBrowser                          │
│  - Custom Elements                      │
│  - Event System                         │
└─────────────┬───────────────────────────┘
              │
┌─────────────▼───────────────────────────┐
│       Worker Registry                   │
│  - Worker Lifecycle Management          │
│  - Message Routing                      │
│  - Health Monitoring                    │
└─────────────┬───────────────────────────┘
              │
    ┌─────────┴──────────┐
    │                    │
┌───▼─────────┐  ┌──────▼──────┐
│   Enclave   │  │    Vault    │
│   Worker    │  │   Worker    │
│             │  │             │
│  ┌────────┐ │  │  ┌────────┐ │
│  │ WASM   │ │  │  │ WASM   │ │
│  │ Module │ │  │  │ Module │ │
│  └────────┘ │  │  └────────┘ │
└─────────────┘  └─────────────┘
```

## Development

```bash
# Install dependencies
bun install

# Build
bun run build

# Watch mode
bun run dev

# Run tests
bun test

# Run tests with UI
bun test:ui

# Type check
bun run typecheck

# Lint
bun run lint

# Format
bun run format
```

## License

MIT © Sonr Labs

## Related Packages

- [@sonr.io/enclave](../enclave) - WASM enclave with worker support
- [@sonr.io/vault](../vault) - WASM vault with service worker
- [@sonr.io/sdk](../sdk) - Sonr blockchain SDK
- [@sonr.io/react](../react) - React hooks for Sonr

## Support

- [Documentation](https://docs.sonr.io)
- [GitHub Issues](https://github.com/sonr-io/sonr/issues)
- [Discord](https://discord.gg/sonr)
