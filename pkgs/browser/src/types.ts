/**
 * Common types for @sonr.io/browser package
 */

/**
 * Browser capability check result
 */
export interface BrowserCapabilities {
  /** WebAuthn API available */
  webauthn: boolean;
  /** IndexedDB available */
  indexedDB: boolean;
  /** Web Crypto API available */
  crypto: boolean;
  /** Service Worker available */
  serviceWorker: boolean;
  /** Web Worker available */
  webWorker: boolean;
}

/**
 * Storage quota information
 */
export interface StorageQuota {
  /** Used storage in bytes */
  usage: number;
  /** Available quota in bytes */
  quota: number;
  /** Percentage used */
  percentage: number;
}

/**
 * Error types for browser operations
 */
export class BrowserError extends Error {
  constructor(
    message: string,
    public readonly code: string,
    public readonly originalError?: Error,
  ) {
    super(message);
    this.name = 'BrowserError';
  }
}
