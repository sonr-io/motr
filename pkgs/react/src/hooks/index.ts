/**
 * React hooks for @sonr.io/react
 */

// Enclave hooks
export { useEnclave } from './useEnclave';
export type { UseEnclaveResult } from './useEnclave';

export { useEnclaveClient } from './useVaultClient';
export type { UseVaultClientResult } from './useVaultClient';

export { useEnclaveStorage, useUCANTokens } from './useVaultStorage';

export { useAccountSwitch } from './useAccountSwitch';

// WebAuthn hooks
export { useWebAuthn } from './useWebAuthn';
export type { WebAuthnCredential } from './useWebAuthn';

// Transaction hooks
export { useSignData, useBroadcastTx, useTransaction } from './useTransaction';
