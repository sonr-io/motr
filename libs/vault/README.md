# @sonr.io/vault

WebAssembly-based HTTP server running as a Service Worker for secure payment processing and OpenID Connect authorization flows.

## Overview

Vault provides a Go-based WASM HTTP server that runs in a Service Worker context, enabling:

- **W3C Payment Handler API**: Secure payment processing with browser-native payment flows
- **OpenID Connect (OIDC)**: Complete OAuth2/OIDC authorization and token management
- **Service Worker Integration**: Background HTTP server running independently of page lifecycle
- **Payment Gateway**: Multi-chain payment processing with validation and refunds
- **Offline Support**: Cached responses and offline payment capabilities
- **Zero Backend**: All payment and auth logic runs client-side in WASM sandbox

## Installation

```bash
pnpm add @sonr.io/vault
```

## Quick Start

### Basic Service Worker Setup

```typescript
// main.ts - Register the service worker
if ('serviceWorker' in navigator) {
  await navigator.serviceWorker.register('/vault-worker.js', {
    scope: '/',
    type: 'module'
  });

  console.log('Vault Service Worker registered');
}

// vault-worker.js - Service worker implementation
import { loadVault } from '@sonr.io/vault/loader';

self.addEventListener('install', (event) => {
  event.waitUntil(
    loadVault({
      wasmPath: '/vault.wasm',
      runtimePath: '/wasm_exec.js',
      debug: true
    }).then(() => {
      console.log('[Vault] WASM loaded in service worker');
      self.skipWaiting(); // Activate immediately
    })
  );
});

self.addEventListener('activate', (event) => {
  event.waitUntil(
    self.clients.claim() // Take control of all clients
  );
});
```

## Architecture

### Service Worker Pattern

```
┌─────────────────┐         ┌──────────────────┐
│                 │         │                  │
│  Main Thread    │◄───────►│  Service Worker  │
│  (UI/Pages)     │ Message │  (Background)    │
│                 │ Passing │                  │
└─────────────────┘         └──────────────────┘
        │                           │
        │                           ▼
        │                   ┌──────────────────┐
        │                   │  Go WASM         │
        │                   │  HTTP Server     │
        │                   │  - Payment API   │
        │                   │  - OIDC Server   │
        │                   └──────────────────┘
        │
        ▼
┌─────────────────┐
│  Payment        │
│  Request API    │
│  - Browser UI   │
│  - Native Flow  │
└─────────────────┘
```

### Request Flow

1. **Main Thread**: User initiates payment or auth request
2. **Service Worker**: Intercepts requests, routes to WASM server
3. **WASM Server**: Processes payment/auth logic, returns response
4. **Service Worker**: Caches response, sends to main thread
5. **Main Thread**: Updates UI with result

### HTTP Server Architecture

The vault runs a full HTTP server inside the Service Worker using `wasm-http-server`:

```
Service Worker Context
├── Go WASM Runtime
│   ├── HTTP Router (Chi)
│   ├── Payment Handler
│   ├── OIDC Provider
│   └── JWT Validation
└── Cache Storage
    ├── Payment Responses
    ├── OIDC Tokens
    └── Static Assets
```

## Usage Guide

### 1. Service Worker Registration

```typescript
// app/main.ts
import { registerVaultWorker } from '@sonr.io/vault/register';

async function initVault() {
  try {
    const registration = await registerVaultWorker({
      workerUrl: '/vault-worker.js',
      scope: '/',
      updateViaCache: 'none' // Always fetch fresh worker
    });

    // Wait for service worker to be ready
    await navigator.serviceWorker.ready;
    console.log('Vault ready:', registration.active);

    // Listen for vault messages
    navigator.serviceWorker.addEventListener('message', (event) => {
      if (event.data.type === 'vault-ready') {
        console.log('Vault WASM server started');
      }
    });

  } catch (error) {
    console.error('Vault registration failed:', error);
  }
}

initVault();
```

### 2. Service Worker Lifecycle

```typescript
// vault-worker.js
import { loadVault } from '@sonr.io/vault/loader';

let vaultReady = false;

// Install: Load WASM module
self.addEventListener('install', (event) => {
  console.log('[Vault] Installing...');

  event.waitUntil(
    loadVault({
      wasmPath: '/vault.wasm',
      runtimePath: '/wasm_exec.js',
      debug: true
    }).then(() => {
      vaultReady = true;
      self.skipWaiting(); // Activate immediately
    }).catch((error) => {
      console.error('[Vault] Installation failed:', error);
      throw error;
    })
  );
});

// Activate: Take control of clients
self.addEventListener('activate', (event) => {
  console.log('[Vault] Activating...');

  event.waitUntil(
    Promise.all([
      self.clients.claim(), // Control all pages
      self.clients.matchAll().then((clients) => {
        // Notify all clients that vault is ready
        clients.forEach((client) => {
          client.postMessage({ type: 'vault-ready' });
        });
      })
    ])
  );
});

// Fetch: Intercept and route requests
self.addEventListener('fetch', (event) => {
  const url = new URL(event.request.url);

  // Only handle vault API requests
  if (url.pathname.startsWith('/api/') ||
      url.pathname.startsWith('/payment/') ||
      url.pathname.startsWith('/.well-known/')) {

    if (!vaultReady) {
      event.respondWith(
        new Response('Vault not ready', { status: 503 })
      );
      return;
    }

    // Let Go WASM server handle the request
    event.respondWith(
      handleVaultRequest(event.request)
    );
  }
  // Let other requests pass through
});

async function handleVaultRequest(request) {
  try {
    // The Go WASM server intercepts fetch() calls
    // This will be handled by wasm-http-server
    const response = await fetch(request);

    // Cache successful responses
    if (response.ok) {
      const cache = await caches.open('vault-cache-v1');
      await cache.put(request, response.clone());
    }

    return response;
  } catch (error) {
    console.error('[Vault] Request failed:', error);

    // Try to serve from cache
    const cached = await caches.match(request);
    if (cached) {
      return cached;
    }

    return new Response('Service unavailable', { status: 503 });
  }
}
```

### 3. Payment Handler API Integration

```typescript
// Register payment method
if ('PaymentRequest' in window) {
  const registration = await navigator.serviceWorker.ready;

  if (registration.paymentManager) {
    await registration.paymentManager.instruments.set('sonr-wallet', {
      name: 'Sonr Wallet',
      method: 'https://vault.sonr.io/pay',
      capabilities: {
        supportedNetworks: ['sonr', 'cosmos', 'ethereum'],
        supportedTypes: ['token-transfer', 'nft-purchase']
      }
    });

    console.log('Payment instrument registered');
  }
}

// Handle payment request from page
async function processPayment(amount, currency) {
  const paymentMethods = [{
    supportedMethods: 'https://vault.sonr.io/pay',
    data: {
      network: 'sonr',
      token: 'SNR'
    }
  }];

  const paymentDetails = {
    total: {
      label: 'Total',
      amount: { currency, value: amount.toString() }
    }
  };

  const request = new PaymentRequest(paymentMethods, paymentDetails);

  try {
    const response = await request.show();
    await response.complete('success');

    console.log('Payment completed:', response.details);
    return response.details;
  } catch (error) {
    console.error('Payment failed:', error);
    throw error;
  }
}
```

### 4. OIDC Authorization Flows

```typescript
// Main thread: Initiate OAuth2/OIDC flow
async function loginWithVault() {
  // Discover OIDC configuration
  const config = await fetch('/.well-known/openid-configuration')
    .then(res => res.json());

  console.log('OIDC Issuer:', config.issuer);
  console.log('Auth Endpoint:', config.authorization_endpoint);

  // Build authorization URL
  const state = crypto.randomUUID();
  const codeVerifier = generateCodeVerifier();
  const codeChallenge = await generateCodeChallenge(codeVerifier);

  sessionStorage.setItem('oauth_state', state);
  sessionStorage.setItem('code_verifier', codeVerifier);

  const authUrl = new URL(config.authorization_endpoint);
  authUrl.searchParams.set('client_id', 'my-app');
  authUrl.searchParams.set('redirect_uri', window.location.origin + '/callback');
  authUrl.searchParams.set('response_type', 'code');
  authUrl.searchParams.set('scope', 'openid profile email');
  authUrl.searchParams.set('state', state);
  authUrl.searchParams.set('code_challenge', codeChallenge);
  authUrl.searchParams.set('code_challenge_method', 'S256');

  // Redirect to authorization endpoint (handled by vault)
  window.location.href = authUrl.toString();
}

// Handle OAuth callback
async function handleCallback() {
  const params = new URLSearchParams(window.location.search);
  const code = params.get('code');
  const state = params.get('state');

  // Verify state
  if (state !== sessionStorage.getItem('oauth_state')) {
    throw new Error('Invalid state parameter');
  }

  // Exchange code for tokens
  const codeVerifier = sessionStorage.getItem('code_verifier');
  const tokenResponse = await fetch('/token', {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body: new URLSearchParams({
      grant_type: 'authorization_code',
      code,
      redirect_uri: window.location.origin + '/callback',
      client_id: 'my-app',
      code_verifier: codeVerifier
    })
  }).then(res => res.json());

  console.log('Access Token:', tokenResponse.access_token);
  console.log('ID Token:', tokenResponse.id_token);

  // Get user info
  const userInfo = await fetch('/userinfo', {
    headers: { 'Authorization': `Bearer ${tokenResponse.access_token}` }
  }).then(res => res.json());

  console.log('User:', userInfo);

  return { tokens: tokenResponse, user: userInfo };
}

// Helper: Generate PKCE code verifier
function generateCodeVerifier() {
  const array = new Uint8Array(32);
  crypto.getRandomValues(array);
  return base64UrlEncode(array);
}

// Helper: Generate PKCE code challenge
async function generateCodeChallenge(verifier) {
  const encoder = new TextEncoder();
  const data = encoder.encode(verifier);
  const hash = await crypto.subtle.digest('SHA-256', data);
  return base64UrlEncode(new Uint8Array(hash));
}

function base64UrlEncode(array) {
  return btoa(String.fromCharCode(...array))
    .replace(/\+/g, '-')
    .replace(/\//g, '_')
    .replace(/=/g, '');
}
```

### 5. HTTP Endpoint Usage

```typescript
// Health check
async function checkVaultHealth() {
  const response = await fetch('/health');
  const data = await response.json();
  console.log('Vault health:', data);
  // { status: "ok", timestamp: 1234567890 }
}

// Process payment
async function processPayment(details) {
  const response = await fetch('/api/payment/process', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      amount: details.amount,
      currency: details.currency,
      network: details.network,
      recipient: details.recipient,
      token: details.token
    })
  });

  if (!response.ok) {
    throw new Error(`Payment failed: ${response.statusText}`);
  }

  const result = await response.json();
  console.log('Payment processed:', result);
  // { transaction_id: "...", status: "success", ... }

  return result;
}

// Check payment status
async function getPaymentStatus(transactionId) {
  const response = await fetch(`/api/payment/status/${transactionId}`);
  const status = await response.json();
  console.log('Payment status:', status);
  // { status: "confirmed", confirmations: 12, ... }

  return status;
}

// Request refund
async function refundPayment(transactionId, reason) {
  const response = await fetch('/api/payment/refund', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      transaction_id: transactionId,
      reason
    })
  });

  const result = await response.json();
  console.log('Refund processed:', result);
  return result;
}

// Get JWKS for token verification
async function getJWKS() {
  const response = await fetch('/.well-known/jwks.json');
  const jwks = await response.json();
  console.log('Public keys:', jwks.keys);
  return jwks;
}
```

### 6. Cache Strategies

```typescript
// vault-worker.js - Advanced caching

const CACHE_NAME = 'vault-cache-v1';
const CACHE_URLS = [
  '/vault.wasm',
  '/wasm_exec.js',
  '/.well-known/openid-configuration',
  '/.well-known/jwks.json'
];

// Cache-first strategy for static assets
self.addEventListener('fetch', (event) => {
  const url = new URL(event.request.url);

  // Cache OIDC discovery documents
  if (url.pathname.startsWith('/.well-known/')) {
    event.respondWith(cacheFirst(event.request));
    return;
  }

  // Network-first for payment API (always fresh data)
  if (url.pathname.startsWith('/api/payment/')) {
    event.respondWith(networkFirst(event.request));
    return;
  }

  // Network-only for auth endpoints (security)
  if (url.pathname.startsWith('/authorize') ||
      url.pathname.startsWith('/token')) {
    event.respondWith(fetch(event.request));
    return;
  }
});

async function cacheFirst(request) {
  const cached = await caches.match(request);
  if (cached) {
    return cached;
  }

  const response = await fetch(request);
  if (response.ok) {
    const cache = await caches.open(CACHE_NAME);
    await cache.put(request, response.clone());
  }

  return response;
}

async function networkFirst(request) {
  try {
    const response = await fetch(request);
    if (response.ok) {
      const cache = await caches.open(CACHE_NAME);
      await cache.put(request, response.clone());
    }
    return response;
  } catch (error) {
    const cached = await caches.match(request);
    if (cached) {
      return cached;
    }
    throw error;
  }
}

// Cleanup old caches on activation
self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames
          .filter((name) => name !== CACHE_NAME)
          .map((name) => caches.delete(name))
      );
    })
  );
});
```

### 7. Message Passing Patterns

```typescript
// Main thread: Send messages to service worker
async function sendMessageToVault(message) {
  const registration = await navigator.serviceWorker.ready;

  return new Promise((resolve, reject) => {
    const channel = new MessageChannel();

    channel.port1.onmessage = (event) => {
      if (event.data.error) {
        reject(new Error(event.data.error));
      } else {
        resolve(event.data);
      }
    };

    registration.active.postMessage(message, [channel.port2]);
  });
}

// Example: Request vault status
const status = await sendMessageToVault({ type: 'get-status' });
console.log('Vault status:', status);

// Service worker: Handle messages
self.addEventListener('message', (event) => {
  const { type, data } = event.data;

  switch (type) {
    case 'get-status':
      event.ports[0].postMessage({
        ready: vaultReady,
        version: '1.0.0',
        uptime: Date.now() - installTime
      });
      break;

    case 'clear-cache':
      caches.delete(CACHE_NAME).then(() => {
        event.ports[0].postMessage({ success: true });
      });
      break;

    default:
      event.ports[0].postMessage({
        error: `Unknown message type: ${type}`
      });
  }
});
```

## Advanced Usage

### Custom Configuration

```typescript
// vault-worker.js with advanced config
import { loadVault } from '@sonr.io/vault/loader';

const VAULT_CONFIG = {
  wasmPath: '/vault.wasm',
  runtimePath: '/wasm_exec.js',
  debug: process.env.NODE_ENV === 'development',

  // Payment configuration
  payment: {
    supportedNetworks: ['sonr', 'cosmos', 'ethereum'],
    maxTransactionAmount: 1000000,
    requireConfirmations: 3
  },

  // OIDC configuration
  oidc: {
    issuer: 'https://vault.sonr.io',
    tokenExpiry: 3600, // 1 hour
    refreshTokenExpiry: 2592000 // 30 days
  },

  // Cache configuration
  cache: {
    maxAge: 86400000, // 24 hours
    maxEntries: 100
  }
};

self.addEventListener('install', (event) => {
  event.waitUntil(
    loadVault(VAULT_CONFIG).then(() => {
      console.log('[Vault] Loaded with custom config');
    })
  );
});
```

### Error Handling

```typescript
// Comprehensive error handling
async function safeVaultRequest(endpoint, options = {}) {
  try {
    const response = await fetch(endpoint, options);

    if (!response.ok) {
      // Parse error response
      const error = await response.json().catch(() => ({
        message: response.statusText
      }));

      throw new VaultError(
        error.message || 'Request failed',
        response.status,
        error
      );
    }

    return response.json();

  } catch (error) {
    if (error instanceof VaultError) {
      throw error;
    }

    // Network error or service worker not available
    if (error.message.includes('Failed to fetch')) {
      throw new VaultError(
        'Vault service unavailable. Is the service worker running?',
        503
      );
    }

    throw new VaultError('Unexpected error: ' + error.message, 500);
  }
}

class VaultError extends Error {
  constructor(message, status, details) {
    super(message);
    this.name = 'VaultError';
    this.status = status;
    this.details = details;
  }
}

// Usage
try {
  const result = await safeVaultRequest('/api/payment/process', {
    method: 'POST',
    body: JSON.stringify(paymentData)
  });
  console.log('Success:', result);
} catch (error) {
  if (error instanceof VaultError) {
    if (error.status === 503) {
      console.error('Service unavailable - show offline UI');
    } else if (error.status === 400) {
      console.error('Invalid payment data:', error.details);
    } else {
      console.error('Payment failed:', error.message);
    }
  }
}
```

### React Integration

```typescript
import { createContext, useContext, useEffect, useState } from 'react';

interface VaultContextType {
  ready: boolean;
  registration: ServiceWorkerRegistration | null;
  error: Error | null;
  sendMessage: (message: any) => Promise<any>;
}

const VaultContext = createContext<VaultContextType | null>(null);

export function VaultProvider({ children }: { children: React.ReactNode }) {
  const [ready, setReady] = useState(false);
  const [registration, setRegistration] = useState<ServiceWorkerRegistration | null>(null);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    async function initVault() {
      if (!('serviceWorker' in navigator)) {
        setError(new Error('Service Workers not supported'));
        return;
      }

      try {
        const reg = await navigator.serviceWorker.register('/vault-worker.js', {
          scope: '/'
        });

        await navigator.serviceWorker.ready;
        setRegistration(reg);
        setReady(true);

        // Listen for updates
        reg.addEventListener('updatefound', () => {
          console.log('Vault update available');
          const newWorker = reg.installing;
          newWorker?.addEventListener('statechange', () => {
            if (newWorker.state === 'activated') {
              window.location.reload();
            }
          });
        });

      } catch (err) {
        console.error('Vault registration failed:', err);
        setError(err as Error);
      }
    }

    initVault();

    return () => {
      // Cleanup if needed
    };
  }, []);

  const sendMessage = async (message: any) => {
    if (!registration?.active) {
      throw new Error('Service worker not active');
    }

    return new Promise((resolve, reject) => {
      const channel = new MessageChannel();

      channel.port1.onmessage = (event) => {
        if (event.data.error) {
          reject(new Error(event.data.error));
        } else {
          resolve(event.data);
        }
      };

      registration.active.postMessage(message, [channel.port2]);
    });
  };

  return (
    <VaultContext.Provider value={{ ready, registration, error, sendMessage }}>
      {children}
    </VaultContext.Provider>
  );
}

export function useVault() {
  const context = useContext(VaultContext);
  if (!context) {
    throw new Error('useVault must be used within VaultProvider');
  }
  return context;
}

// Usage in component
function PaymentComponent() {
  const vault = useVault();
  const [processing, setProcessing] = useState(false);

  async function handlePayment(amount: number, recipient: string) {
    if (!vault.ready) {
      console.error('Vault not ready');
      return;
    }

    setProcessing(true);
    try {
      const result = await fetch('/api/payment/process', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ amount, recipient, network: 'sonr' })
      }).then(res => res.json());

      console.log('Payment successful:', result);
    } catch (error) {
      console.error('Payment failed:', error);
    } finally {
      setProcessing(false);
    }
  }

  if (vault.error) {
    return <div>Vault unavailable: {vault.error.message}</div>;
  }

  if (!vault.ready) {
    return <div>Loading vault...</div>;
  }

  return (
    <button onClick={() => handlePayment(100, 'sonr1...')} disabled={processing}>
      {processing ? 'Processing...' : 'Pay 100 SNR'}
    </button>
  );
}
```

## Vite Plugin

### Setup

```typescript
// vite.config.ts
import { defineConfig } from 'vite';
import { vaultPlugin } from '@sonr.io/vault/vite-plugin';

export default defineConfig({
  plugins: [
    vaultPlugin({
      // Public path for vault assets
      publicPath: '/motor-vault',

      // Copy WASM files to public directory
      copyToPublic: true,

      // Enable debug logging
      debug: true,

      // Set CORP/COEP headers
      enableSecurityHeaders: true,

      // Custom WASM path
      wasmPath: 'dist/vault.wasm'
    })
  ]
});
```

### Features

- Automatically copies WASM and runtime files to build output
- Sets required security headers (COEP, COOP) for WASM
- Provides virtual modules for asset URLs
- Optimizes dependencies for Service Worker context
- Injects service worker registration code

### Virtual Module

```typescript
// Import asset URLs from virtual module
import { wasmUrl, runtimeUrl } from 'virtual:vault';

await loadVault({
  wasmPath: wasmUrl,
  runtimePath: runtimeUrl
});
```

## API Reference

### Health & Status Endpoints

#### GET /health
Health check endpoint

**Response**:
```json
{
  "status": "ok",
  "timestamp": 1234567890,
  "version": "1.0.0"
}
```

#### GET /status
Detailed service status

**Response**:
```json
{
  "vault": "active",
  "uptime": 3600,
  "requests_handled": 1234,
  "cache_size": "2.5MB"
}
```

### Payment Handler API Endpoints

#### GET /payment/instruments
List available payment instruments

**Response**:
```json
{
  "instruments": [
    {
      "method": "https://vault.sonr.io/pay",
      "name": "Sonr Wallet",
      "capabilities": {
        "supportedNetworks": ["sonr", "cosmos"],
        "supportedTypes": ["token-transfer"]
      }
    }
  ]
}
```

#### POST /payment/canmakepayment
Check if payment method is supported

**Request**:
```json
{
  "method": "https://vault.sonr.io/pay",
  "network": "sonr"
}
```

**Response**:
```json
{
  "canMakePayment": true
}
```

#### POST /payment/paymentrequest
Handle payment request from Payment Request API

**Request**:
```json
{
  "methodData": {
    "supportedMethods": "https://vault.sonr.io/pay",
    "data": { "network": "sonr" }
  },
  "details": {
    "total": {
      "label": "Total",
      "amount": { "currency": "SNR", "value": "100" }
    }
  }
}
```

**Response**:
```json
{
  "methodName": "https://vault.sonr.io/pay",
  "details": {
    "transaction_id": "tx_123",
    "status": "success"
  }
}
```

### Payment Gateway Endpoints

#### POST /api/payment/process
Process a payment transaction

**Request**:
```json
{
  "amount": 100,
  "currency": "SNR",
  "network": "sonr",
  "recipient": "sonr1abc...",
  "token": "optional_ucan_token"
}
```

**Response**:
```json
{
  "transaction_id": "tx_123",
  "status": "success",
  "hash": "0x123...",
  "confirmations": 0
}
```

#### POST /api/payment/validate
Validate payment method and recipient

**Request**:
```json
{
  "network": "sonr",
  "recipient": "sonr1abc...",
  "amount": 100
}
```

**Response**:
```json
{
  "valid": true,
  "recipient_exists": true,
  "sufficient_funds": true
}
```

#### GET /api/payment/status/:id
Get payment transaction status

**Response**:
```json
{
  "transaction_id": "tx_123",
  "status": "confirmed",
  "confirmations": 12,
  "hash": "0x123...",
  "timestamp": 1234567890
}
```

#### POST /api/payment/refund
Request payment refund

**Request**:
```json
{
  "transaction_id": "tx_123",
  "reason": "Customer request"
}
```

**Response**:
```json
{
  "refund_id": "ref_456",
  "status": "processing",
  "original_transaction": "tx_123",
  "amount": 100
}
```

### OIDC Endpoints

#### GET /.well-known/openid-configuration
OIDC discovery document

**Response**:
```json
{
  "issuer": "https://vault.sonr.io",
  "authorization_endpoint": "https://vault.sonr.io/authorize",
  "token_endpoint": "https://vault.sonr.io/token",
  "userinfo_endpoint": "https://vault.sonr.io/userinfo",
  "jwks_uri": "https://vault.sonr.io/.well-known/jwks.json",
  "response_types_supported": ["code"],
  "grant_types_supported": ["authorization_code", "refresh_token"],
  "code_challenge_methods_supported": ["S256"]
}
```

#### GET /.well-known/jwks.json
JSON Web Key Set for token verification

**Response**:
```json
{
  "keys": [
    {
      "kty": "RSA",
      "use": "sig",
      "kid": "key1",
      "n": "...",
      "e": "AQAB"
    }
  ]
}
```

#### GET /authorize
OAuth2/OIDC authorization endpoint

**Query Parameters**:
- `client_id`: Client application ID
- `redirect_uri`: Callback URL
- `response_type`: `code` (authorization code flow)
- `scope`: Space-separated scopes (e.g., `openid profile email`)
- `state`: CSRF protection token
- `code_challenge`: PKCE challenge
- `code_challenge_method`: `S256`

**Response**: Redirects to `redirect_uri` with authorization code

#### POST /token
Token exchange endpoint

**Request** (application/x-www-form-urlencoded):
```
grant_type=authorization_code
&code=auth_code_123
&redirect_uri=https://app.example.com/callback
&client_id=my-app
&code_verifier=pkce_verifier
```

**Response**:
```json
{
  "access_token": "eyJ...",
  "token_type": "Bearer",
  "expires_in": 3600,
  "refresh_token": "refresh_123",
  "id_token": "eyJ..."
}
```

#### GET /userinfo
User information endpoint (requires authentication)

**Headers**:
```
Authorization: Bearer eyJ...
```

**Response**:
```json
{
  "sub": "user_123",
  "name": "John Doe",
  "email": "john@example.com",
  "email_verified": true,
  "did": "did:sonr:abc123"
}
```

## Type Definitions

```typescript
// Vault configuration
interface VaultConfig {
  wasmPath: string;
  runtimePath: string;
  debug?: boolean;
  payment?: PaymentConfig;
  oidc?: OIDCConfig;
  cache?: CacheConfig;
}

interface PaymentConfig {
  supportedNetworks: string[];
  maxTransactionAmount: number;
  requireConfirmations: number;
}

interface OIDCConfig {
  issuer: string;
  tokenExpiry: number;
  refreshTokenExpiry: number;
}

interface CacheConfig {
  maxAge: number;
  maxEntries: number;
}

// Payment types
interface PaymentRequest {
  amount: number;
  currency: string;
  network: string;
  recipient: string;
  token?: string;
}

interface PaymentResponse {
  transaction_id: string;
  status: 'success' | 'pending' | 'failed';
  hash: string;
  confirmations: number;
}

interface PaymentStatus {
  transaction_id: string;
  status: 'pending' | 'confirmed' | 'failed';
  confirmations: number;
  hash: string;
  timestamp: number;
}

// OIDC types
interface TokenResponse {
  access_token: string;
  token_type: 'Bearer';
  expires_in: number;
  refresh_token?: string;
  id_token?: string;
}

interface UserInfo {
  sub: string;
  name?: string;
  email?: string;
  email_verified?: boolean;
  did?: string;
}

// Service Worker types
interface VaultMessage {
  type: string;
  data?: any;
}

interface VaultResponse {
  success?: boolean;
  error?: string;
  data?: any;
}
```

## Security Considerations

### Service Worker Security

- Service workers must be served over HTTPS in production
- Service worker scope determines which pages it can control
- Always validate `origin` in fetch event handlers
- Implement rate limiting for payment endpoints

### CORS and Headers

Required headers for WASM execution:

```typescript
// In your server configuration
headers: {
  'Cross-Origin-Embedder-Policy': 'require-corp',
  'Cross-Origin-Opener-Policy': 'same-origin',
  'Cross-Origin-Resource-Policy': 'cross-origin'
}
```

### Payment Security

1. **Transaction Validation**: All payment requests validated before processing
2. **Rate Limiting**: Prevents payment spam and DoS attacks
3. **Amount Limits**: Configurable maximum transaction amounts
4. **Confirmation Requirements**: Waits for blockchain confirmations
5. **Refund Controls**: Time-limited refund windows

### OIDC Security

1. **PKCE**: Proof Key for Code Exchange prevents authorization code interception
2. **State Parameter**: CSRF protection for OAuth flows
3. **Token Expiry**: Short-lived access tokens (1 hour default)
4. **JWT Validation**: Cryptographic signature verification
5. **Secure Storage**: Tokens stored in secure contexts only

### WASM Sandbox

- Go WASM runs in isolated sandbox environment
- Limited access to browser APIs
- No direct file system access
- Memory isolation prevents side-channel attacks

### Best Practices

1. **Always use HTTPS** - Required for Service Workers
2. **Validate all inputs** - Never trust client data
3. **Implement timeouts** - Prevent hanging requests
4. **Handle errors gracefully** - Don't expose internal details
5. **Update regularly** - Keep service worker and WASM updated
6. **Monitor usage** - Log suspicious payment patterns
7. **Test offline** - Ensure cache fallbacks work

## Troubleshooting

### Service Worker Not Registering

```typescript
// Check if Service Workers are supported
if (!('serviceWorker' in navigator)) {
  console.error('Service Workers not supported');
}

// Verify HTTPS (required except localhost)
if (location.protocol !== 'https:' && location.hostname !== 'localhost') {
  console.error('Service Workers require HTTPS');
}

// Check registration errors
navigator.serviceWorker.register('/vault-worker.js')
  .then(reg => console.log('Registered:', reg))
  .catch(err => console.error('Registration failed:', err));
```

### WASM Loading Failures

```typescript
// Verify WASM file is accessible
fetch('/vault.wasm')
  .then(res => {
    if (!res.ok) {
      console.error('WASM not found:', res.status);
    } else {
      console.log('WASM accessible');
    }
  });

// Check Content-Type header
// Should be: application/wasm
```

### CORS Issues

Ensure your server sends required headers:

```
Cross-Origin-Embedder-Policy: require-corp
Cross-Origin-Opener-Policy: same-origin
```

For Vite, use the plugin:

```typescript
vaultPlugin({
  enableSecurityHeaders: true
})
```

### Payment Handler Not Working

```typescript
// Check Payment Request API support
if (!('PaymentRequest' in window)) {
  console.error('Payment Request API not supported');
}

// Verify service worker has payment manager
const registration = await navigator.serviceWorker.ready;
if (!registration.paymentManager) {
  console.error('Payment Manager not available');
}

// Check payment instrument registration
const instruments = await registration.paymentManager.instruments.keys();
console.log('Registered instruments:', Array.from(instruments));
```

### Service Worker Update Issues

```typescript
// Force update check
const registration = await navigator.serviceWorker.getRegistration();
await registration?.update();

// Clear old caches
const cacheNames = await caches.keys();
await Promise.all(
  cacheNames
    .filter(name => name.startsWith('vault-'))
    .map(name => caches.delete(name))
);

// Unregister and re-register
await registration?.unregister();
location.reload();
```

### Debugging Tips

```typescript
// Enable debug mode
const VAULT_CONFIG = {
  debug: true // Logs all requests/responses
};

// Monitor service worker lifecycle
navigator.serviceWorker.addEventListener('controllerchange', () => {
  console.log('New service worker activated');
});

// Listen for service worker messages
navigator.serviceWorker.addEventListener('message', (event) => {
  console.log('Message from vault:', event.data);
});

// Check service worker state
const registration = await navigator.serviceWorker.getRegistration();
console.log('Active:', registration?.active?.state);
console.log('Installing:', registration?.installing?.state);
console.log('Waiting:', registration?.waiting?.state);
```

## Development

### Building

```bash
# Build WASM and TypeScript
pnpm build

# Build only WASM
pnpm build:wasm

# Build only TypeScript
pnpm build:ts

# Watch mode for development
pnpm watch
```

### Testing

```bash
# Run Go tests
pnpm test

# Format Go code
pnpm lint

# Test service worker locally
pnpm dev  # Starts dev server with service worker support
```

### Clean

```bash
# Remove build artifacts
pnpm clean
```

## Architecture Details

Built using:

- **Go 1.24+** - Server implementation
- **GOOS=js GOARCH=wasm** - Standard Go WASM compilation
- **wasm-http-server** - HTTP server library for Go WASM
- **Chi Router** - Lightweight HTTP router
- **TypeScript** - Client-side loader and utilities
- **Vite** - Build tooling and development server

## License

MIT
