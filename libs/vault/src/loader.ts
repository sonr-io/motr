/**
 * WASM loader for Motor Vault service worker
 *
 * Provides utilities to load and initialize the Go WASM HTTP server
 * that powers the Payment Gateway and OIDC services.
 */

export interface VaultConfig {
  /** Path to the ServiceWorker file */
  serviceWorkerPath?: string;
  /** Environment variables to pass to the WASM module */
  env?: Record<string, string>;
  /** Enable debug logging */
  debug?: boolean;
}

/**
 * Load and initialize the Motor Vault WASM module via ServiceWorker
 *
 * @param config Configuration options
 * @returns Promise that resolves when the vault is ready
 *
 * @example
 * ```typescript
 * import { loadVault } from '@sonr.io/vault/loader'
 *
 * await loadVault({
 *   serviceWorkerPath: '/vault/sw.js',
 *   debug: true
 * })
 * ```
 */
export async function loadVault(config: VaultConfig = {}): Promise<void> {
  const { serviceWorkerPath = '/vault/sw.js', env: _env = {}, debug = false } = config;

  if (debug) {
    console.log('[Vault] Loading Motor vault via ServiceWorker...');
    console.log('[Vault] ServiceWorker path:', serviceWorkerPath);
  }

  // Check if ServiceWorker is supported
  if (!isServiceWorkerSupported()) {
    throw new Error('ServiceWorker is not supported in this environment');
  }

  // Register ServiceWorker if not already registered
  if (!isServiceWorkerRegistered()) {
    await registerServiceWorker(serviceWorkerPath, debug);
  }

  if (debug) {
    console.log('[Vault] Motor vault ServiceWorker is ready');
  }
}

/**
 * Register the ServiceWorker for the vault
 */
async function registerServiceWorker(serviceWorkerPath: string, debug: boolean): Promise<void> {
  if (debug) {
    console.log('[Vault] Registering ServiceWorker...');
  }

  try {
    const _registration = await navigator.serviceWorker.register(serviceWorkerPath);
    if (debug) {
      console.log('[Vault] ServiceWorker registered successfully');
    }
  } catch (error) {
    console.error('[Vault] Failed to register ServiceWorker:', error);
    const err = new Error('Failed to register ServiceWorker');
    (err as any).cause = error;
    throw err;
  }
}

/**
 * Check if ServiceWorker is supported
 */
export function isServiceWorkerSupported(): boolean {
  return typeof navigator !== 'undefined' && 'serviceWorker' in navigator;
}

/**
 * Check if ServiceWorker is already registered
 */
export function isServiceWorkerRegistered(): boolean {
  return navigator.serviceWorker.controller !== null;
}

/**
 * Helper to check if the vault is already loaded
 */
export function isVaultLoaded(): boolean {
  return typeof (globalThis as any).Go !== 'undefined';
}
