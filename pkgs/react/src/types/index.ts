/**
 * Type definitions for @sonr.io/react hooks and providers
 */

import type {
  StoredUCANToken,
  StoredVaultState,
  VaultClient,
  VaultConfigWithStorage,
} from '@sonr.io/enclave';
import type { ReactNode } from 'react';

/**
 * Enclave state
 */
export interface EnclaveState {
  isReady: boolean;
  isInitialized: boolean;
  accountAddress: string | null;
  error: Error | null;
}

/**
 * Transaction state
 */
export interface TransactionState {
  isPending: boolean;
  isSuccess: boolean;
  isError: boolean;
  data: any | null;
  error: Error | null;
}

/**
 * Enclave provider configuration
 */
export interface EnclaveProviderConfig extends VaultConfigWithStorage {
  wasmPath?: string;
  autoInitialize?: boolean;
}

/**
 * Enclave provider props
 */
export interface EnclaveProviderProps {
  children: ReactNode;
  config?: EnclaveProviderConfig;
  client?: VaultClient;
}

/**
 * WebAuthn registration options
 */
export interface WebAuthnRegistrationOptions {
  username: string;
  displayName?: string;
  timeout?: number;
}

/**
 * WebAuthn authentication options
 */
export interface WebAuthnAuthenticationOptions {
  timeout?: number;
}

/**
 * Hook return type with loading state
 */
export interface UseQueryResult<T> {
  data: T | null;
  isLoading: boolean;
  isError: boolean;
  error: Error | null;
  refetch: () => Promise<void>;
}

/**
 * Hook return type for mutations
 */
export interface UseMutationResult<TData, TVariables> {
  mutate: (variables: TVariables) => Promise<TData>;
  mutateAsync: (variables: TVariables) => Promise<TData>;
  data: TData | null;
  isLoading: boolean;
  isPending: boolean;
  isSuccess: boolean;
  isError: boolean;
  error: Error | null;
  reset: () => void;
}

/**
 * UCAN token operations result
 */
export interface UseUCANTokensResult {
  tokens: StoredUCANToken[];
  isLoading: boolean;
  isError: boolean;
  error: Error | null;
  refetch: () => Promise<void>;
  removeExpired: () => Promise<void>;
}

/**
 * Enclave storage result
 */
export interface UseEnclaveStorageResult {
  state: StoredVaultState | null;
  isLoading: boolean;
  isError: boolean;
  error: Error | null;
  persist: () => Promise<void>;
  clear: () => Promise<void>;
  refetch: () => Promise<void>;
}

/**
 * Account switching result
 */
export interface UseAccountSwitchResult {
  currentAccount: string | null;
  accounts: string[];
  isLoading: boolean;
  switchAccount: (address: string) => Promise<void>;
  removeAccount: (address: string) => Promise<void>;
}

/**
 * Sign data request
 */
export interface SignDataRequest {
  data: Uint8Array;
}

/**
 * Sign data response
 */
export interface SignDataResponse {
  signature: Uint8Array;
  publicKey?: Uint8Array;
}

/**
 * Broadcast transaction request
 */
export interface BroadcastTxRequest {
  txBytes: Uint8Array;
  mode?: 'sync' | 'async' | 'block';
}

/**
 * Broadcast transaction response
 */
export interface BroadcastTxResponse {
  txHash: string;
  code: number;
  height?: number;
  rawLog?: string;
}
