/**
 * @sonr.io/browser - Framework-agnostic browser client
 *
 * Modern ESM package for Web Worker-based WASM integration with the Sonr ecosystem.
 * Provides a complete browser client with cryptographic operations, blockchain interaction,
 * and Web Standards-based APIs.
 *
 * @packageDocumentation
 */

// Core exports
export * from "./core/worker-registry.js";

// Client exports
export * from "./client/browser-client.js";

// Web APIs exports
export * from "./web-apis/elements/sonr-wallet.js";

// Plugin exports
export * from "./plugin/vite-plugin.js";

/**
 * Package version
 */
export const VERSION = "0.0.1";

/**
 * Package information
 */
export function getPackageInfo() {
  return {
    name: "@sonr.io/browser",
    version: VERSION,
    description: "Framework-agnostic browser client with Web Worker WASM integration",
    features: [
      "Web Worker Architecture",
      "WASM-based Cryptography (Enclave & Vault)",
      "Framework-Agnostic Design",
      "Custom Elements API",
      "TypeScript Support",
      "Vite Plugin for Asset Bundling",
      "IndexedDB Persistence",
      "Cross-Tab Synchronization",
      "WebAuthn Authentication",
      "Blockchain Integration",
    ],
    exports: {
      client: "@sonr.io/browser/client",
      workers: "@sonr.io/browser/workers",
      elements: "@sonr.io/browser/elements",
      storage: "@sonr.io/browser/storage",
      plugin: "@sonr.io/browser/vite-plugin",
    },
  };
}

/**
 * Check browser compatibility
 */
export function checkBrowserCompatibility() {
  const features = {
    webWorkers: typeof Worker !== "undefined",
    sharedWorkers: typeof SharedWorker !== "undefined",
    webAssembly: typeof WebAssembly !== "undefined",
    indexedDB: typeof indexedDB !== "undefined",
    customElements: typeof customElements !== "undefined",
    broadcastChannel: typeof BroadcastChannel !== "undefined",
    crypto: typeof crypto !== "undefined" && typeof crypto.subtle !== "undefined",
  };

  const isCompatible = features.webWorkers && features.webAssembly && features.indexedDB;

  return {
    compatible: isCompatible,
    features,
    warnings: [
      !features.sharedWorkers && "SharedWorker not supported (cross-tab sync unavailable)",
      !features.customElements && "Custom Elements not supported (web components unavailable)",
      !features.broadcastChannel && "BroadcastChannel not supported (cross-tab messaging unavailable)",
    ].filter(Boolean),
  };
}

/**
 * Initialize browser environment
 */
export async function initializeBrowserEnvironment() {
  const compat = checkBrowserCompatibility();

  if (!compat.compatible) {
    throw new Error(
      "Browser not compatible. Required: Web Workers, WebAssembly, IndexedDB",
    );
  }

  if (compat.warnings.length > 0) {
    console.warn("[Sonr Browser] Compatibility warnings:", compat.warnings);
  }

  return compat;
}
