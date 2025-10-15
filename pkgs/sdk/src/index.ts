/**
 * @sonr.io/sdk - Sonr ES Module
 * Main entry point for browser/CDN usage
 */

// Re-export auth functions directly for CDN usage
export {
  registerWithPasskey,
  loginWithPasskey,
  isWebAuthnSupported,
  isWebAuthnAvailable,
  isConditionalMediationAvailable,
  bufferToBase64url,
  base64urlToBuffer,
} from "./client/auth/webauthn";

// Re-export client functionality
export * from "./client";

// Re-export codec utilities
export * from "./codec";

// Re-export wallet functionality (be selective to avoid conflicts)
export type { ChainInfo, ConnectedWallet, WalletType } from "./wallet";

// Re-export registry
export * from "./registry";

// Re-export protobufs
export * from "./protobufs";

// Export IPFS services namespace
export * as ipfs from "./client/services";
