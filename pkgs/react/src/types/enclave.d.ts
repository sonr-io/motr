/**
 * Temporary type declarations for @sonr.io/enclave
 * These will be replaced when the enclave package properly exports its types
 */
declare module '@sonr.io/enclave' {
  // Re-export all types from enclave source
  export {
    EnclaveData,
    VaultConfig,
    NewOriginTokenRequest,
    NewAttenuatedTokenRequest,
    UCANTokenResponse,
    SignDataRequest,
    SignDataResponse,
    VerifyDataRequest,
    VerifyDataResponse,
    GetIssuerDIDResponse,
    VaultPlugin,
    VaultErrorCode,
    VaultError,
    VaultEventType,
    VaultEvent,
    VaultEventListener,
    VaultStorageConfig,
    VaultConfigWithStorage,
    StoredVaultState,
    StoredUCANToken,
    StoragePersistenceStatus,
    StorageStats,
    VaultIPFSConfig,
    VaultConfigWithIPFS,
    IPFSEnclaveReference,
    VaultStateWithIPFS,
  } from '../../../libs/enclave/src/types';

  export {
    VaultStorageManager,
    AccountVaultDatabase,
    type StoredSession,
    type StoredMetadata,
  } from '../../../libs/enclave/src/storage';

  export {
    VaultClient,
    createVaultClient,
    getDefaultVaultClient,
  } from '../../../libs/enclave/src/client';

  export {
    loadVaultWASM,
    loadVaultWASMCached,
    preloadVaultWASM,
    verifyWASM,
    getWASMInfo,
    wasmCache,
    type WASMLoadOptions,
  } from '../../../libs/enclave/src/loader';

  export {
    EnclaveWorkerClient,
    createWorkerClient,
    getDefaultWorkerClient,
    isWorkerSupported,
    type WorkerClientConfig,
  } from '../../../libs/enclave/src/worker-client';

  export {
    WorkerMessageType,
    type WorkerMessage,
    type WorkerResponse,
    type InitMessagePayload,
  } from '../../../libs/enclave/src/worker';
}
