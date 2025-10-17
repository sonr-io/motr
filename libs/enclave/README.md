# @sonr.io/enclave

WebAssembly-based cryptographic vault with Web Worker support for secure, isolated execution of cryptographic operations in the browser.

## Overview

Enclave provides a secure vault system that runs entirely in the browser using WebAssembly and Web Workers:

- **Web Worker Isolation**: Cryptographic operations run in a background worker thread
- **IndexedDB Persistence**: Automatic vault state persistence with account management
- **IPFS Backup**: Secure encrypted backup and restore of vault data
- **Multi-Party Computation**: MPC-based key generation and signing
- **UCAN Tokens**: User-Controlled Authorization Network token management
- **Zero Trust Architecture**: All crypto operations isolated in WASM sandbox

## Installation

```bash
pnpm add @sonr.io/enclave
```

## Quick Start

### Basic Setup

```typescript
import { EnclaveWorkerClient } from '@sonr.io/enclave';

// Create worker client with default configuration
const client = new EnclaveWorkerClient({
  enablePersistence: true,
  debug: false,
});

// Initialize with account address
await client.initialize(
  '/enclave.wasm',  // Path to WASM file
  'sonr1accountaddress...'  // Sonr account address
);

// Check if ready
console.log('Vault ready:', client.isReady());
```

## Architecture

### Web Worker Pattern

```
┌─────────────────┐         ┌──────────────────┐
│                 │         │                  │
│  Main Thread    │◄───────►│  Web Worker      │
│  (UI/Logic)     │ Message │  (Crypto Ops)    │
│                 │ Passing │                  │
└─────────────────┘         └──────────────────┘
        │                           │
        │                           ▼
        │                   ┌──────────────────┐
        │                   │  WASM Runtime    │
        │                   │  (Extism Plugin) │
        │                   │  - MPC Enclave   │
        │                   │  - Signing       │
        │                   └──────────────────┘
        │
        ▼
┌─────────────────┐
│  IndexedDB      │
│  - Vault State  │
│  - UCAN Tokens  │
│  - Accounts     │
└─────────────────┘
```

### Storage Layer (Dexie.js)

Each account gets its own IndexedDB database:

**Database Schema:**
```typescript
// Database: vault_<accountAddress>
{
  state: {
    id: 'vault-state',
    isInitialized: boolean,
    enclaveConfig: EnclaveConfig,
    lastAccessed: number
  },

  tokens: {
    id: string,
    type: 'origin' | 'attenuated',
    issuer: string,
    audience: string,
    token: string,
    expiresAt: number,
    createdAt: number
  },

  sessions: {
    id: string,
    sessionData: Uint8Array,
    expiresAt: number,
    createdAt: number
  },

  metadata: {
    key: string,
    value: any,
    updatedAt: number
  }
}
```

## Usage Guide

### 1. Vault Initialization

```typescript
import { EnclaveWorkerClient } from '@sonr.io/enclave';

const client = new EnclaveWorkerClient({
  // Enable IndexedDB persistence
  enablePersistence: true,

  // Auto-cleanup expired data
  autoCleanup: true,

  // Cleanup interval (1 hour)
  cleanupInterval: 3600000,

  // Request timeout (30 seconds)
  requestTimeout: 30000,

  // Enable debug logging
  debug: true,

  // Custom worker URL (optional)
  workerUrl: new URL('./custom-worker.js', import.meta.url),

  // Vault-specific config (optional)
  vaultConfig: {
    enableEncryption: true,
    keyDerivationRounds: 100000
  }
});

// Initialize vault
await client.initialize('/enclave.wasm', 'sonr1account...');
```

### 2. UCAN Token Operations

```typescript
// Create origin token (root authority)
const originToken = await client.newOriginToken({
  issuer: 'did:key:z6Mk...',
  audience: 'did:key:z6Mk...',
  capabilities: [{
    resource: 'vault:*',
    actions: ['read', 'write', 'sign']
  }],
  expiration: Math.floor(Date.now() / 1000) + 86400, // 24 hours
  facts: [],
  proofs: []
});

console.log('Token:', originToken.token);

// Create attenuated token (delegated with restrictions)
const attenuatedToken = await client.newAttenuatedToken({
  parentToken: originToken.token,
  audience: 'did:key:z6Mk...',
  capabilities: [{
    resource: 'vault:sign',
    actions: ['sign']  // Restricted to signing only
  }],
  expiration: Math.floor(Date.now() / 1000) + 3600, // 1 hour
  facts: [],
  proofs: [originToken.token]
});
```

### 3. Signing Operations

```typescript
// Sign arbitrary data
const message = new TextEncoder().encode('Hello, Sonr!');
const signature = await client.signData({ data: message });

console.log('Signature:', signature.signature);
console.log('Error:', signature.error);

// Verify signature
const isValid = await client.verifyData({
  data: message,
  signature: signature.signature
});

console.log('Valid:', isValid.valid);
```

### 4. Issuer DID Management

```typescript
// Get vault's DID and address
const issuer = await client.getIssuerDID();

console.log('DID:', issuer.did);
console.log('Address:', issuer.address);
console.log('Public Key:', issuer.publicKey);
```

### 5. State Persistence

```typescript
// Save current state to IndexedDB
await client.persistState();

// Load saved state
const state = await client.loadPersistedState();
console.log('Saved tokens:', state.tokens);
console.log('Last access:', state.state.lastAccessed);

// Clear all persisted data
await client.clearPersistedState();
```

### 6. Account Management

```typescript
// List all accounts in storage
const accounts = await client.listPersistedAccounts();
console.log('Accounts:', accounts);

// Switch to different account
await client.switchAccount('sonr1otheraccount...');

// Remove account and all its data
await client.removeAccount('sonr1oldaccount...');
```

### 7. Token Management

```typescript
// Get all stored tokens
const tokens = await client.getPersistedTokens();
tokens.forEach(token => {
  console.log(`${token.type}: ${token.issuer} -> ${token.audience}`);
  console.log(`Expires: ${new Date(token.expiresAt)}`);
});

// Remove expired tokens
await client.removeExpiredTokens();
```

### 8. Health Checks

```typescript
// Ping worker to check health
const timestamp = await client.ping();
console.log('Worker responded at:', timestamp);

// Check if initialized
if (client.isReady()) {
  console.log('Vault is ready for operations');
}
```

### 9. Cleanup

```typescript
// Cleanup when done
await client.cleanup();
```

## Advanced Usage

### Custom Worker Configuration

```typescript
// Create custom worker with specific configuration
const worker = new EnclaveWorkerClient({
  workerUrl: new URL('./workers/enclave.worker.js', import.meta.url),
  requestTimeout: 60000,  // 1 minute for slow operations
  healthCheckInterval: 0,  // Disable automatic health checks
  debug: process.env.NODE_ENV === 'development',
  vaultConfig: {
    enableEncryption: true,
    compressionEnabled: true,
    maxConcurrentOperations: 10
  }
});
```

### Error Handling

```typescript
try {
  await client.initialize('/enclave.wasm', 'sonr1account...');
} catch (error) {
  if (error.message.includes('timeout')) {
    console.error('Worker initialization timed out');
  } else if (error.message.includes('not initialized')) {
    console.error('Vault not ready');
  } else {
    console.error('Initialization failed:', error);
  }
}
```

### React Integration

```typescript
import { createContext, useContext, useEffect, useState } from 'react';
import { EnclaveWorkerClient } from '@sonr.io/enclave';

const VaultContext = createContext<EnclaveWorkerClient | null>(null);

export function VaultProvider({ children }: { children: React.ReactNode }) {
  const [client, setClient] = useState<EnclaveWorkerClient | null>(null);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    const vault = new EnclaveWorkerClient({
      enablePersistence: true,
      debug: true
    });

    vault.initialize('/enclave.wasm', 'sonr1account...')
      .then(() => {
        setClient(vault);
        setReady(true);
      })
      .catch(console.error);

    return () => {
      vault.cleanup();
    };
  }, []);

  if (!ready) return <div>Loading vault...</div>;

  return (
    <VaultContext.Provider value={client}>
      {children}
    </VaultContext.Provider>
  );
}

export function useVault() {
  const context = useContext(VaultContext);
  if (!context) throw new Error('useVault must be used within VaultProvider');
  return context;
}

// Usage in component
function MyComponent() {
  const vault = useVault();

  async function signMessage() {
    const data = new TextEncoder().encode('Sign this!');
    const result = await vault.signData({ data });
    console.log('Signature:', result.signature);
  }

  return <button onClick={signMessage}>Sign Message</button>;
}
```

## Vite Plugin

### Setup

```typescript
// vite.config.ts
import { defineConfig } from 'vite';
import { enclavePlugin } from '@sonr.io/enclave/vite-plugin';

export default defineConfig({
  plugins: [
    enclavePlugin({
      wasmPath: 'dist/enclave.wasm',
      enableWorker: true,
      debug: true,
      copyToPublic: true
    })
  ]
});
```

### Features

- Automatically copies WASM file to build output
- Sets required CORS headers (COEP, COOP)
- Provides virtual module for WASM URL
- Optimizes dependencies for Web Workers

### Virtual Module

```typescript
// Import WASM URL from virtual module
import wasmUrl from 'virtual:enclave-wasm';

const client = new EnclaveWorkerClient();
await client.initialize(wasmUrl, accountAddress);
```

## API Reference

### EnclaveWorkerClient

#### Constructor

```typescript
constructor(config?: EnclaveWorkerClientConfig)
```

**Config Options:**
- `workerUrl?: URL` - Custom worker script URL
- `requestTimeout?: number` - Request timeout in ms (default: 30000)
- `healthCheckInterval?: number` - Health check interval in ms (default: 60000)
- `debug?: boolean` - Enable debug logging (default: false)
- `vaultConfig?: VaultConfig` - Vault-specific configuration

#### Methods

**Initialization:**
- `initialize(wasmPath: string, accountAddress: string): Promise<void>`
- `isReady(): boolean`
- `cleanup(): Promise<void>`

**UCAN Operations:**
- `newOriginToken(request: UCANTokenRequest): Promise<UCANTokenResponse>`
- `newAttenuatedToken(request: UCANTokenRequest): Promise<UCANTokenResponse>`

**Signing Operations:**
- `signData(request: SignDataRequest): Promise<SignDataResponse>`
- `verifyData(request: VerifyDataRequest): Promise<VerifyDataResponse>`

**Vault Information:**
- `getIssuerDID(): Promise<GetIssuerDIDResponse>`

**State Management:**
- `persistState(): Promise<void>`
- `loadPersistedState(): Promise<PersistedState>`
- `clearPersistedState(): Promise<void>`

**Account Management:**
- `switchAccount(accountAddress: string): Promise<void>`
- `listPersistedAccounts(): Promise<string[]>`
- `removeAccount(accountAddress: string): Promise<void>`

**Token Management:**
- `getPersistedTokens(): Promise<TokenRecord[]>`
- `removeExpiredTokens(): Promise<void>`

**Health:**
- `ping(): Promise<number>`

## Type Definitions

```typescript
interface UCANTokenRequest {
  issuer: string;
  audience: string;
  capabilities: Capability[];
  expiration: number;
  notBefore?: number;
  facts?: Fact[];
  proofs?: string[];
  parentToken?: string;
}

interface Capability {
  resource: string;
  actions: string[];
  caveats?: Record<string, any>;
}

interface SignDataRequest {
  data: Uint8Array;
}

interface SignDataResponse {
  signature: Uint8Array;
  error?: string;
}

interface VerifyDataRequest {
  data: Uint8Array;
  signature: Uint8Array;
}

interface GetIssuerDIDResponse {
  did: string;
  address: string;
  publicKey: Uint8Array;
}
```

## Security Considerations

### Web Worker Isolation

- All cryptographic operations run in isolated worker thread
- Main thread never has direct access to private keys
- Worker operates in separate execution context

### Storage Security

- IndexedDB stores encrypted vault state
- Each account has isolated database
- Automatic cleanup of expired tokens and sessions

### WASM Sandbox

- Extism provides secure WASM execution environment
- Memory isolation prevents side-channel attacks
- Limited host function access

### Best Practices

1. **Always use HTTPS** - Required for Web Workers and Service Workers
2. **Implement proper CORS** - Use Vite plugin for correct headers
3. **Validate tokens** - Check expiration and capabilities before use
4. **Handle errors** - Implement proper error handling for all operations
5. **Cleanup resources** - Call `cleanup()` when done

## Troubleshooting

### Worker Not Loading

```typescript
// Check if Web Workers are supported
if (typeof Worker === 'undefined') {
  console.error('Web Workers not supported');
}

// Verify WASM file is accessible
fetch('/enclave.wasm')
  .then(res => res.ok ? 'OK' : 'Not Found')
  .then(console.log);
```

### CORS Issues

Ensure your server sends required headers:
```
Cross-Origin-Embedder-Policy: require-corp
Cross-Origin-Opener-Policy: same-origin
```

### IndexedDB Issues

```typescript
// Check if IndexedDB is available
if (!('indexedDB' in window)) {
  console.error('IndexedDB not supported');
}

// Clear corrupted data
const client = new EnclaveWorkerClient();
await client.clearPersistedState();
```

## License

MIT
