/**
 * @sonr.io/sdk - Sonr ES Module
 * Main entry point for browser/CDN usage
 */

// Re-export client functionality
export * from './client';
// Re-export auth functions directly for CDN usage
export {
  base64urlToBuffer,
  bufferToBase64url,
  isConditionalMediationAvailable,
  isWebAuthnAvailable,
  isWebAuthnSupported,
  loginWithPasskey,
  registerWithPasskey,
} from './client/auth/webauthn';
// Export IPFS services namespace
export * as ipfs from './client/services';
// Re-export codec utilities
export * from './codec';
// Re-export protobufs
export * from './protobufs';
// Re-export registry
export * from './registry';
// Re-export wallet functionality (be selective to avoid conflicts)
export type { ChainInfo, ConnectedWallet, WalletType } from './wallet';
