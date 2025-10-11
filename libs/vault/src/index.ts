/**
 * @sonr.io/vault - Motor Payment Gateway and OIDC WASM Service Worker
 *
 * This package provides a WebAssembly-based HTTP server that implements:
 * - W3C Payment Handler API
 * - OpenID Connect (OIDC) authorization flows
 * - Service Worker integration for secure payment processing
 *
 * @packageDocumentation
 */

export { loadVault, type VaultConfig, isServiceWorkerSupported, isServiceWorkerRegistered } from './loader.js'
export { vaultPlugin } from './vite-plugin-vault.js'

/**
 * Default ServiceWorker path for the vault module
 */
export const VAULT_SW_PATH = new URL('./sw.js', import.meta.url).pathname

/**
 * Check if the current environment supports WASM
 */
export function isWasmSupported(): boolean {
   return typeof WebAssembly !== 'undefined'
}
