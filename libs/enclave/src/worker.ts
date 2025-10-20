/**
 * Enclave Web Worker
 *
 * Dedicated Web Worker for running cryptographic operations off the main thread.
 * Follows W3C Web Workers API standards and MDN best practices for 2025.
 *
 * Features:
 * - Type-safe message passing
 * - Structured cloning for complex objects
 * - Error handling and propagation
 * - Transferable objects for large data
 * - Graceful degradation
 *
 * @see https://developer.mozilla.org/en-US/docs/Web/API/Web_Workers_API
 */

/// <reference lib="webworker" />

import { VaultClient } from './client.js';
import type {
  NewAttenuatedTokenRequest,
  NewOriginTokenRequest,
  SignDataRequest,
  VaultConfigWithStorage,
  VerifyDataRequest,
} from './types.js';

declare const self: DedicatedWorkerGlobalScope;

/**
 * Message types for worker communication
 */
export enum WorkerMessageType {
  // Initialization
  INIT = 'init',
  INIT_SUCCESS = 'init_success',
  INIT_ERROR = 'init_error',

  // Vault operations
  NEW_ORIGIN_TOKEN = 'new_origin_token',
  NEW_ATTENUATED_TOKEN = 'new_attenuated_token',
  SIGN_DATA = 'sign_data',
  VERIFY_DATA = 'verify_data',
  GET_ISSUER_DID = 'get_issuer_did',

  // Storage operations
  PERSIST_STATE = 'persist_state',
  LOAD_STATE = 'load_state',
  CLEAR_STATE = 'clear_state',
  SWITCH_ACCOUNT = 'switch_account',
  LIST_ACCOUNTS = 'list_accounts',
  REMOVE_ACCOUNT = 'remove_account',

  // Token management
  GET_TOKENS = 'get_tokens',
  REMOVE_EXPIRED_TOKENS = 'remove_expired_tokens',

  // Responses
  SUCCESS = 'success',
  ERROR = 'error',

  // Lifecycle
  PING = 'ping',
  PONG = 'pong',
  CLEANUP = 'cleanup',
  READY = 'ready',
}

/**
 * Worker message structure
 */
export interface WorkerMessage<T = any> {
  id: string;
  type: WorkerMessageType;
  payload?: T;
  error?: string;
  transferables?: Transferable[];
}

/**
 * Worker response structure
 */
export interface WorkerResponse<T = any> {
  id: string;
  type: WorkerMessageType;
  success: boolean;
  data?: T;
  error?: string;
}

/**
 * Initialize message payload
 */
export interface InitMessagePayload {
  wasmPath?: string;
  accountAddress?: string;
  config?: VaultConfigWithStorage;
}

/**
 * Enclave Worker class
 */
class EnclaveWorker {
  private vaultClient: VaultClient | null = null;
  private isInitialized = false;
  private initPromise: Promise<void> | null = null;

  constructor() {
    this.setupMessageHandler();
    this.notifyReady();
  }

  /**
   * Notify main thread that worker is ready
   */
  private notifyReady(): void {
    self.postMessage({
      id: 'worker-ready',
      type: WorkerMessageType.READY,
      success: true,
    } as WorkerResponse);
  }

  /**
   * Setup message event handler
   */
  private setupMessageHandler(): void {
    self.addEventListener('message', async (event: MessageEvent<WorkerMessage>) => {
      const message = event.data;

      try {
        await this.handleMessage(message);
      } catch (error) {
        this.sendError(message.id, error);
      }
    });
  }

  /**
   * Handle incoming messages
   */
  private async handleMessage(message: WorkerMessage): Promise<void> {
    const { id, type, payload } = message;

    switch (type) {
      case WorkerMessageType.PING:
        this.sendPong(id);
        break;

      case WorkerMessageType.INIT:
        await this.handleInit(id, payload as InitMessagePayload);
        break;

      case WorkerMessageType.NEW_ORIGIN_TOKEN:
        await this.handleNewOriginToken(id, payload as NewOriginTokenRequest);
        break;

      case WorkerMessageType.NEW_ATTENUATED_TOKEN:
        await this.handleNewAttenuatedToken(id, payload as NewAttenuatedTokenRequest);
        break;

      case WorkerMessageType.SIGN_DATA:
        await this.handleSignData(id, payload as SignDataRequest);
        break;

      case WorkerMessageType.VERIFY_DATA:
        await this.handleVerifyData(id, payload as VerifyDataRequest);
        break;

      case WorkerMessageType.GET_ISSUER_DID:
        await this.handleGetIssuerDID(id);
        break;

      case WorkerMessageType.PERSIST_STATE:
        await this.handlePersistState(id);
        break;

      case WorkerMessageType.LOAD_STATE:
        await this.handleLoadState(id);
        break;

      case WorkerMessageType.CLEAR_STATE:
        await this.handleClearState(id);
        break;

      case WorkerMessageType.SWITCH_ACCOUNT:
        await this.handleSwitchAccount(id, payload as { accountAddress: string });
        break;

      case WorkerMessageType.LIST_ACCOUNTS:
        await this.handleListAccounts(id);
        break;

      case WorkerMessageType.REMOVE_ACCOUNT:
        await this.handleRemoveAccount(id, payload as { accountAddress: string });
        break;

      case WorkerMessageType.GET_TOKENS:
        await this.handleGetTokens(id);
        break;

      case WorkerMessageType.REMOVE_EXPIRED_TOKENS:
        await this.handleRemoveExpiredTokens(id);
        break;

      case WorkerMessageType.CLEANUP:
        await this.handleCleanup(id);
        break;

      default:
        throw new Error(`Unknown message type: ${type}`);
    }
  }

  /**
   * Ensure vault client is initialized
   */
  private ensureInitialized(): void {
    if (!this.isInitialized || !this.vaultClient) {
      throw new Error('Vault client not initialized. Call initialize() first.');
    }
  }

  /**
   * Handle initialization
   */
  private async handleInit(id: string, payload: InitMessagePayload): Promise<void> {
    if (this.isInitialized) {
      this.sendResponse(id, WorkerMessageType.INIT_SUCCESS, { message: 'Already initialized' });
      return;
    }

    // Prevent concurrent initialization
    if (this.initPromise) {
      await this.initPromise;
      this.sendResponse(id, WorkerMessageType.INIT_SUCCESS, { message: 'Initialization complete' });
      return;
    }

    this.initPromise = (async () => {
      const { wasmPath, accountAddress, config } = payload;

      // Create vault client
      this.vaultClient = new VaultClient(config);

      // Initialize vault
      await this.vaultClient.initialize(wasmPath, accountAddress);

      this.isInitialized = true;
    })();

    try {
      await this.initPromise;
      this.sendResponse(id, WorkerMessageType.INIT_SUCCESS, {
        message: 'Initialization successful',
      });
    } catch (error) {
      this.initPromise = null;
      throw error;
    }
  }

  /**
   * Handle new origin token creation
   */
  private async handleNewOriginToken(id: string, request: NewOriginTokenRequest): Promise<void> {
    this.ensureInitialized();
    const response = await this.vaultClient!.newOriginToken(request);
    this.sendResponse(id, WorkerMessageType.SUCCESS, response);
  }

  /**
   * Handle new attenuated token creation
   */
  private async handleNewAttenuatedToken(
    id: string,
    request: NewAttenuatedTokenRequest
  ): Promise<void> {
    this.ensureInitialized();
    const response = await this.vaultClient!.newAttenuatedToken(request);
    this.sendResponse(id, WorkerMessageType.SUCCESS, response);
  }

  /**
   * Handle data signing
   */
  private async handleSignData(id: string, request: SignDataRequest): Promise<void> {
    this.ensureInitialized();

    // Convert array back to Uint8Array if needed
    const data =
      request.data instanceof Uint8Array
        ? request.data
        : new Uint8Array(request.data as unknown as number[]);

    const response = await this.vaultClient!.signData({ data });

    // Send response with transferable for large signatures
    this.sendResponse(id, WorkerMessageType.SUCCESS, {
      signature: Array.from(response.signature), // Convert to array for cloning
      error: response.error,
    });
  }

  /**
   * Handle data verification
   */
  private async handleVerifyData(id: string, request: VerifyDataRequest): Promise<void> {
    this.ensureInitialized();

    // Convert arrays back to Uint8Array if needed
    const data =
      request.data instanceof Uint8Array
        ? request.data
        : new Uint8Array(request.data as unknown as number[]);

    const signature =
      request.signature instanceof Uint8Array
        ? request.signature
        : new Uint8Array(request.signature as unknown as number[]);

    const response = await this.vaultClient!.verifyData({ data, signature });
    this.sendResponse(id, WorkerMessageType.SUCCESS, response);
  }

  /**
   * Handle get issuer DID
   */
  private async handleGetIssuerDID(id: string): Promise<void> {
    this.ensureInitialized();
    const response = await this.vaultClient!.getIssuerDID();
    this.sendResponse(id, WorkerMessageType.SUCCESS, response);
  }

  /**
   * Handle persist state
   */
  private async handlePersistState(id: string): Promise<void> {
    this.ensureInitialized();
    await this.vaultClient!.persistState();
    this.sendResponse(id, WorkerMessageType.SUCCESS, { message: 'State persisted' });
  }

  /**
   * Handle load state
   */
  private async handleLoadState(id: string): Promise<void> {
    this.ensureInitialized();
    const state = await this.vaultClient!.loadPersistedState();
    this.sendResponse(id, WorkerMessageType.SUCCESS, state);
  }

  /**
   * Handle clear state
   */
  private async handleClearState(id: string): Promise<void> {
    this.ensureInitialized();
    await this.vaultClient!.clearPersistedState();
    this.sendResponse(id, WorkerMessageType.SUCCESS, { message: 'State cleared' });
  }

  /**
   * Handle switch account
   */
  private async handleSwitchAccount(
    id: string,
    payload: { accountAddress: string }
  ): Promise<void> {
    this.ensureInitialized();
    await this.vaultClient!.switchAccount(payload.accountAddress);
    this.sendResponse(id, WorkerMessageType.SUCCESS, { message: 'Account switched' });
  }

  /**
   * Handle list accounts
   */
  private async handleListAccounts(id: string): Promise<void> {
    this.ensureInitialized();
    const accounts = await this.vaultClient!.listPersistedAccounts();
    this.sendResponse(id, WorkerMessageType.SUCCESS, accounts);
  }

  /**
   * Handle remove account
   */
  private async handleRemoveAccount(
    id: string,
    payload: { accountAddress: string }
  ): Promise<void> {
    this.ensureInitialized();
    await this.vaultClient!.removeAccount(payload.accountAddress);
    this.sendResponse(id, WorkerMessageType.SUCCESS, { message: 'Account removed' });
  }

  /**
   * Handle get tokens
   */
  private async handleGetTokens(id: string): Promise<void> {
    this.ensureInitialized();
    const tokens = await this.vaultClient!.getPersistedTokens();
    this.sendResponse(id, WorkerMessageType.SUCCESS, tokens);
  }

  /**
   * Handle remove expired tokens
   */
  private async handleRemoveExpiredTokens(id: string): Promise<void> {
    this.ensureInitialized();
    await this.vaultClient!.removeExpiredTokens();
    this.sendResponse(id, WorkerMessageType.SUCCESS, { message: 'Expired tokens removed' });
  }

  /**
   * Handle cleanup
   */
  private async handleCleanup(id: string): Promise<void> {
    if (this.vaultClient) {
      await this.vaultClient.cleanup();
      this.vaultClient = null;
    }

    this.isInitialized = false;
    this.initPromise = null;

    this.sendResponse(id, WorkerMessageType.SUCCESS, { message: 'Cleanup complete' });
  }

  /**
   * Send pong response
   */
  private sendPong(id: string): void {
    this.sendResponse(id, WorkerMessageType.PONG, { timestamp: Date.now() });
  }

  /**
   * Send success response
   */
  private sendResponse<T>(id: string, type: WorkerMessageType, data?: T): void {
    const response: WorkerResponse<T> = {
      id,
      type,
      success: true,
      data,
    };

    self.postMessage(response);
  }

  /**
   * Send error response
   */
  private sendError(id: string, error: any): void {
    const response: WorkerResponse = {
      id,
      type: WorkerMessageType.ERROR,
      success: false,
      error: error instanceof Error ? error.message : String(error),
    };

    self.postMessage(response);
  }
}

// Initialize worker
new EnclaveWorker();

// Export for TypeScript type checking
