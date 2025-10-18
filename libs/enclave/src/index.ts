/**
 * @sonr.io/enclave - Modern Enclave with Web Worker Integration
 *
 * A comprehensive WebAssembly-based cryptographic vault package with modern
 * Web Worker integration following W3C standards and MDN best practices for 2025.
 *
 * Features:
 * - WebAssembly cryptographic operations with Extism
 * - Modern Web Workers for background processing
 * - Type-safe worker communication
 * - IndexedDB persistence with Dexie
 * - Comprehensive TypeScript support
 * - IPFS integration for distributed storage
 *
 * @packageDocumentation
 */

// Type definitions
export * from './types';

// Storage management
export {
  VaultStorageManager,
  AccountVaultDatabase,
  type StoredSession,
  type StoredMetadata,
} from './storage.js';

// Vault client (main thread - synchronous WASM execution)
export {
  VaultClient,
  createVaultClient,
  getDefaultVaultClient,
} from './client.js';

// Web Worker client (main thread - async background execution)
export {
  EnclaveWorkerClient,
  createWorkerClient,
  getDefaultWorkerClient,
  isWorkerSupported,
  type WorkerClientConfig,
} from './worker-client.js';

// Web Worker message types (for advanced usage)
export {
  WorkerMessageType,
  type WorkerMessage,
  type WorkerResponse,
  type InitMessagePayload,
} from './worker.js';

// Vite plugin is available via '@sonr.io/enclave/vite-plugin' import
// DO NOT export it from main entry point to avoid bundling Node.js dependencies

// WASM loader utilities
export {
  loadVaultWASM,
  loadVaultWASMCached,
  preloadVaultWASM,
  verifyWASM,
  getWASMInfo,
  wasmCache,
  type WASMLoadOptions,
} from './loader.js';

/**
 * Package version
 */
export const VERSION = '0.0.1';

/**
 * Check if Web Workers are supported
 */
export function isWebWorkerSupported(): boolean {
  return typeof Worker !== 'undefined';
}

/**
 * Check if WebAssembly is supported
 */
export function isWasmSupported(): boolean {
  return typeof WebAssembly !== 'undefined';
}

/**
 * Check if the current environment is secure (HTTPS or localhost)
 */
export function isSecureContext(): boolean {
  return typeof window !== 'undefined' && window.isSecureContext;
}

/**
 * Get enclave package information
 */
export function getEnclaveInfo() {
  return {
    name: '@sonr.io/enclave',
    version: VERSION,
    features: [
      'WebAssembly Cryptographic Operations',
      'Web Worker Background Processing',
      'Type-Safe Communication',
      'IndexedDB Persistence',
      'IPFS Integration',
      'MPC Enclave Support',
      'UCAN Token Management',
    ],
    requirements: {
      webWorker: isWebWorkerSupported(),
      wasm: isWasmSupported(),
      secureContext: isSecureContext(),
    },
  };
}