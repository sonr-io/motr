/**
 * @sonr.io/react - Modern React hooks for Sonr enclave operations
 *
 * A comprehensive React hooks library for enclave management, WebAuthn authentication,
 * and transaction handling in the Sonr ecosystem.
 *
 * @packageDocumentation
 */

// Re-export all hooks
export * from "./hooks";

// Re-export all providers
export * from "./providers";

// Re-export all types
export * from "./types";

/**
 * Package version
 */
export const VERSION = "0.0.1";

/**
 * Get package information
 */
export function getPackageInfo() {
  return {
    name: "@sonr.io/react",
    version: VERSION,
    description: "Modern React hooks for Sonr enclave operations",
    features: [
      "Enclave Management (WASM-based cryptographic operations)",
      "WebAuthn Authentication",
      "Transaction Signing & Broadcasting",
      "UCAN Token Management",
      "IndexedDB Persistence",
      "TypeScript Support",
      "React Context Providers",
    ],
  };
}
