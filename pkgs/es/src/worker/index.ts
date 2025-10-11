/**
 * Motor Vault service worker integration for @sonr.io/es
 *
 * This module re-exports the Motor Vault WASM service worker functionality
 * from the @sonr.io/vault package, providing a convenient single import point
 * for Payment Gateway and OIDC Authorization services.
 *
 * @packageDocumentation
 */

// Re-export everything from @sonr.io/vault loader
export { loadVault, isVaultLoaded, type VaultConfig } from '@sonr.io/vault/loader';

// Re-export Vite plugin
export { vaultPlugin } from '@sonr.io/vault/vite-plugin';

// Re-export utilities
export { isWasmSupported, isServiceWorkerSupported, VAULT_SW_PATH } from '@sonr.io/vault';

/**
 * @deprecated Use `loadVault` from '@sonr.io/vault/loader' instead
 *
 * Legacy alias for backward compatibility
 */
export { loadVault as initializeMotorServiceWorker } from '@sonr.io/vault/loader';
