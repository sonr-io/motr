// Type definitions
export * from './types';

// Storage management
export {
  VaultStorageManager,
  AccountVaultDatabase,
  type StoredSession,
  type StoredMetadata,
} from './storage.js';

// Vault client
export {
  VaultClient,
  createVaultClient,
  getDefaultVaultClient,
} from './client.js';

// Vite plugin and loader
export { enclavePlugin, type EnclavePluginOptions } from './vite-plugin-enclave.js';
export {
  loadVaultWASM,
  loadVaultWASMCached,
  preloadVaultWASM,
  verifyWASM,
  getWASMInfo,
  wasmCache,
  type WASMLoadOptions,
} from './loader.js';