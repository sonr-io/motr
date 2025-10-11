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

export { loadVault, type VaultConfig } from './loader.js'
export { vaultPlugin } from './vite-plugin-vault.js'

/**
 * Default WASM file path for the vault module
 */
export const VAULT_WASM_PATH = new URL('../dist/vault.wasm', import.meta.url).pathname

/**
 * Check if the current environment supports WASM
 */
export function isWasmSupported(): boolean {
  return typeof WebAssembly !== 'undefined'
}

/**
 * Check if Service Workers are supported
 */
export function isServiceWorkerSupported(): boolean {
  return typeof navigator !== 'undefined' && 'serviceWorker' in navigator
}
