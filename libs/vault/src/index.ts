/**
 * @sonr.io/vault - Modern Motor Vault with Service Worker Integration
 *
 * A comprehensive WebAssembly-based vault package with modern Service Worker
 * integration following W3C standards and MDN best practices for 2025.
 *
 * Features:
 * - WebAssembly HTTP server for secure payment processing and OIDC
 * - Modern Service Worker with advanced caching strategies
 * - Type-safe Service Worker registration and lifecycle management
 * - Vite plugin for seamless integration
 * - Comprehensive TypeScript support
 * - PWA capabilities with offline-first architecture
 * - Background sync and push notifications support
 *
 * @packageDocumentation
 */

// Core vault loader
export {
  loadVault,
  type VaultConfig,
  isServiceWorkerSupported,
  isServiceWorkerRegistered
} from './loader.js'

// Vite plugin for Service Worker integration
export {
  vaultPlugin,
  type VaultPluginOptions
} from './vite-plugin-vault.js'

// Service Worker registration helper
export {
  registerSW,
  isControlled,
  getRegistration,
  unregisterAll,
  type RegisterSWOptions,
  type ServiceWorkerController
} from './register-sw.js'

// TypeScript types for Service Worker APIs
export type {
  ServiceWorkerGlobalScope,
  CacheStorage,
  Cache,
  CacheQueryOptions,
  Clients,
  Client,
  WindowClient,
  ExtendableEvent,
  FetchEvent,
  ExtendableMessageEvent,
  SyncEvent,
  PushEvent,
  NotificationEvent,
  VaultServiceWorkerMessage,
  VaultMessageType,
  VaultCacheMessage,
  VaultVersionResponse,
  CacheStrategy,
  CacheStrategyConfig,
  RouteMatchCallback,
  RouteHandler,
  RouteDefinition
} from './types/service-worker.js'

/**
 * Package version
 */
export const VERSION = '0.0.1'

/**
 * Default ServiceWorker path for the vault module
 */
export const VAULT_SW_PATH = '/sw.js'

/**
 * Check if the current environment supports WASM
 */
export function isWasmSupported(): boolean {
  return typeof WebAssembly !== 'undefined'
}

/**
 * Check if the current environment is secure (HTTPS or localhost)
 */
export function isSecureContext(): boolean {
  return typeof window !== 'undefined' && window.isSecureContext
}

/**
 * Get vault package information
 */
export function getVaultInfo() {
  return {
    name: '@sonr.io/vault',
    version: VERSION,
    features: [
      'WebAssembly HTTP Server',
      'Modern Service Worker',
      'Advanced Caching Strategies',
      'PWA Support',
      'Background Sync',
      'Push Notifications',
      'Offline-First Architecture'
    ],
    requirements: {
      serviceWorker: typeof window !== 'undefined' && 'serviceWorker' in navigator,
      wasm: isWasmSupported(),
      secureContext: isSecureContext()
    }
  }
}
