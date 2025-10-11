/**
 * @sonr.io/es - Sonr ES Module
 * Main entry point for browser/CDN usage
 */

// Vault Plugin - MPC-based cryptographic vault
export { VaultClient, createVaultClient, getDefaultVaultClient } from './plugin';

// Re-export Vault types
export type {
  VaultConfig,
  VaultPlugin,
  EnclaveData,
  NewOriginTokenRequest,
  NewAttenuatedTokenRequest,
  UCANTokenResponse,
  SignDataRequest,
  SignDataResponse,
  VerifyDataRequest,
  VerifyDataResponse,
  GetIssuerDIDResponse,
} from './plugin';

// Re-export error classes
export { VaultError, VaultErrorCode } from './plugin';
// Re-export auth functions directly for CDN usage
export {
  registerWithPasskey,
  loginWithPasskey,
  isWebAuthnSupported,
  isWebAuthnAvailable,
  isConditionalMediationAvailable,
  bufferToBase64url,
  base64urlToBuffer,
} from './client/auth/webauthn';

// Re-export client functionality
export * from './client';

// Re-export codec utilities
export * from './codec';

// Re-export wallet functionality (be selective to avoid conflicts)
export type { ChainInfo, ConnectedWallet, WalletType } from './wallet';

// Re-export registry
export * from './registry';

// Re-export protobufs
export * from './protobufs';

// Export IPFS services namespace
export * as ipfs from './client/services';

// Vault Plugin - MPC-based cryptographic vault
export * as vault from './plugin';

// Motor Vault - Service worker integration (re-exports from @sonr.io/vault)
export * as motor from './worker';

// Vite plugin for build tooling (also available via '@sonr.io/es/vite-plugin')
export { esPlugin } from './vite';
