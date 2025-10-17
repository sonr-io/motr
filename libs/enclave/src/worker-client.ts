/**
 * Enclave Worker Client
 *
 * Proxy client that runs on the main thread and communicates with the
 * Enclave Web Worker for background cryptographic operations.
 *
 * Features:
 * - Maintains the same API as VaultClient
 * - Type-safe async communication
 * - Promise-based message passing
 * - Automatic worker lifecycle management
 * - Connection pooling and health checks
 *
 * @see https://developer.mozilla.org/en-US/docs/Web/API/Web_Workers_API
 */

import type {
  VaultPlugin,
  VaultConfigWithStorage,
  NewOriginTokenRequest,
  NewAttenuatedTokenRequest,
  SignDataRequest,
  VerifyDataRequest,
  UCANTokenResponse,
  SignDataResponse,
  VerifyDataResponse,
  GetIssuerDIDResponse,
  StoredVaultState,
  StoredUCANToken,
} from './types.js';

import type {
  WorkerMessage,
  WorkerResponse,
  WorkerMessageType,
  InitMessagePayload,
} from './worker.js';

/**
 * Worker client configuration
 */
export interface WorkerClientConfig {
  /** Worker script URL */
  workerUrl?: string;
  /** Vault configuration */
  vaultConfig?: VaultConfigWithStorage;
  /** Request timeout in milliseconds */
  requestTimeout?: number;
  /** Enable debug logging */
  debug?: boolean;
  /** Health check interval in milliseconds */
  healthCheckInterval?: number;
}

/**
 * Pending request tracking
 */
interface PendingRequest<T = any> {
  resolve: (value: T) => void;
  reject: (reason: any) => void;
  timeoutId?: ReturnType<typeof setTimeout>;
}

/**
 * Enclave Worker Client
 *
 * Provides a proxy interface to the Enclave Worker for main thread usage
 */
export class EnclaveWorkerClient implements VaultPlugin {
  private worker: Worker | null = null;
  private config: WorkerClientConfig;
  private pendingRequests = new Map<string, PendingRequest>();
  private messageIdCounter = 0;
  private isInitialized = false;
  private initPromise: Promise<void> | null = null;
  private healthCheckInterval: ReturnType<typeof setInterval> | null = null;

  constructor(config: WorkerClientConfig = {}) {
    this.config = {
      requestTimeout: 30000, // 30 seconds default
      debug: false,
      healthCheckInterval: 60000, // 1 minute default
      ...config,
    };
  }

  /**
   * Initialize the worker client
   */
  async initialize(wasmPath?: string, accountAddress?: string): Promise<void> {
    if (this.isInitialized) {
      return;
    }

    // Prevent concurrent initialization
    if (this.initPromise) {
      return this.initPromise;
    }

    this.initPromise = (async () => {
      // Create worker
      const workerUrl = this.config.workerUrl || new URL('./worker.js', import.meta.url);
      this.worker = new Worker(workerUrl, {
        type: 'module',
        name: 'enclave-worker',
      });

      // Setup message handler
      this.worker.addEventListener('message', this.handleWorkerMessage.bind(this));
      this.worker.addEventListener('error', this.handleWorkerError.bind(this));

      // Wait for worker ready signal
      await this.waitForReady();

      // Initialize vault in worker
      const payload: InitMessagePayload = {
        wasmPath,
        accountAddress,
        config: this.config.vaultConfig,
      };

      await this.sendMessage('init', payload);

      this.isInitialized = true;

      // Start health checks
      this.startHealthChecks();

      if (this.config.debug) {
        console.log('[EnclaveWorkerClient] Initialized successfully');
      }
    })();

    try {
      await this.initPromise;
    } catch (error) {
      this.initPromise = null;
      throw error;
    }
  }

  /**
   * Wait for worker ready signal
   */
  private waitForReady(): Promise<void> {
    return new Promise((resolve, reject) => {
      const timeout = setTimeout(() => {
        reject(new Error('Worker initialization timeout'));
      }, this.config.requestTimeout!);

      const handler = (event: MessageEvent<WorkerResponse>) => {
        if (event.data.type === 'ready') {
          clearTimeout(timeout);
          this.worker?.removeEventListener('message', handler);
          resolve();
        }
      };

      this.worker?.addEventListener('message', handler);
    });
  }

  /**
   * Start health checks
   */
  private startHealthChecks(): void {
    if (this.config.healthCheckInterval! > 0) {
      this.healthCheckInterval = setInterval(() => {
        this.ping().catch((error) => {
          console.error('[EnclaveWorkerClient] Health check failed:', error);
        });
      }, this.config.healthCheckInterval);
    }
  }

  /**
   * Stop health checks
   */
  private stopHealthChecks(): void {
    if (this.healthCheckInterval) {
      clearInterval(this.healthCheckInterval);
      this.healthCheckInterval = null;
    }
  }

  /**
   * Ping worker to check health
   */
  async ping(): Promise<number> {
    const response = await this.sendMessage<{ timestamp: number }>('ping');
    return response.timestamp;
  }

  /**
   * Generate unique message ID
   */
  private generateMessageId(): string {
    return `msg-${Date.now()}-${++this.messageIdCounter}`;
  }

  /**
   * Send message to worker and wait for response
   */
  private sendMessage<T = any>(type: string, payload?: any): Promise<T> {
    if (!this.worker) {
      return Promise.reject(new Error('Worker not initialized'));
    }

    return new Promise<T>((resolve, reject) => {
      const id = this.generateMessageId();

      // Setup timeout
      const timeoutId = setTimeout(() => {
        this.pendingRequests.delete(id);
        reject(new Error(`Request timeout: ${type}`));
      }, this.config.requestTimeout);

      // Track pending request
      this.pendingRequests.set(id, {
        resolve,
        reject,
        timeoutId,
      });

      // Send message
      const message: WorkerMessage = {
        id,
        type: type as WorkerMessageType,
        payload,
      };

      // Null check for TypeScript (worker is guaranteed to exist from check above)
      if (!this.worker) {
        reject(new Error('Worker was terminated'));
        return;
      }

      this.worker.postMessage(message);

      if (this.config.debug) {
        console.log('[EnclaveWorkerClient] Sent message:', type, payload);
      }
    });
  }

  /**
   * Handle worker messages
   */
  private handleWorkerMessage(event: MessageEvent<WorkerResponse>): void {
    const response = event.data;
    const pending = this.pendingRequests.get(response.id);

    if (!pending) {
      if (this.config.debug) {
        console.warn('[EnclaveWorkerClient] Received response for unknown request:', response.id);
      }
      return;
    }

    // Clear timeout
    if (pending.timeoutId) {
      clearTimeout(pending.timeoutId);
    }

    // Remove from pending
    this.pendingRequests.delete(response.id);

    // Resolve or reject based on response
    if (response.success) {
      pending.resolve(response.data);
    } else {
      pending.reject(new Error(response.error || 'Unknown error'));
    }

    if (this.config.debug) {
      console.log('[EnclaveWorkerClient] Received response:', response);
    }
  }

  /**
   * Handle worker errors
   */
  private handleWorkerError(event: ErrorEvent): void {
    console.error('[EnclaveWorkerClient] Worker error:', event.error || event.message);

    // Reject all pending requests
    for (const [id, pending] of this.pendingRequests) {
      if (pending.timeoutId) {
        clearTimeout(pending.timeoutId);
      }
      pending.reject(new Error(event.message || 'Worker error'));
    }

    this.pendingRequests.clear();
  }

  /**
   * Ensure worker is initialized
   */
  private ensureInitialized(): void {
    if (!this.isInitialized) {
      throw new Error('Worker client not initialized. Call initialize() first.');
    }
  }

  // ============= VaultPlugin Interface Implementation =============

  /**
   * Create a new origin UCAN token
   */
  async newOriginToken(request: NewOriginTokenRequest): Promise<UCANTokenResponse> {
    this.ensureInitialized();
    return this.sendMessage('new_origin_token', request);
  }

  /**
   * Create a new attenuated UCAN token
   */
  async newAttenuatedToken(request: NewAttenuatedTokenRequest): Promise<UCANTokenResponse> {
    this.ensureInitialized();
    return this.sendMessage('new_attenuated_token', request);
  }

  /**
   * Sign data with the vault's MPC enclave
   */
  async signData(request: SignDataRequest): Promise<SignDataResponse> {
    this.ensureInitialized();

    // Convert Uint8Array to array for structured cloning
    const payload = {
      data: Array.from(request.data),
    };

    const response = await this.sendMessage<{ signature: number[]; error?: string }>('sign_data', payload);

    return {
      signature: new Uint8Array(response.signature),
      error: response.error,
    };
  }

  /**
   * Verify a signature with the vault's MPC enclave
   */
  async verifyData(request: VerifyDataRequest): Promise<VerifyDataResponse> {
    this.ensureInitialized();

    // Convert Uint8Arrays to arrays for structured cloning
    const payload = {
      data: Array.from(request.data),
      signature: Array.from(request.signature),
    };

    return this.sendMessage('verify_data', payload);
  }

  /**
   * Get the issuer DID and address from the vault
   */
  async getIssuerDID(): Promise<GetIssuerDIDResponse> {
    this.ensureInitialized();
    return this.sendMessage('get_issuer_did');
  }

  /**
   * Check if the vault is ready
   */
  isReady(): boolean {
    return this.isInitialized;
  }

  // ============= Storage Management Methods =============

  /**
   * Persist current vault state
   */
  async persistState(): Promise<void> {
    this.ensureInitialized();
    await this.sendMessage('persist_state');
  }

  /**
   * Load persisted vault state
   */
  async loadPersistedState(): Promise<StoredVaultState | null> {
    this.ensureInitialized();
    return this.sendMessage('load_state');
  }

  /**
   * Clear persisted vault state
   */
  async clearPersistedState(): Promise<void> {
    this.ensureInitialized();
    await this.sendMessage('clear_state');
  }

  // ============= Account Management Methods =============

  /**
   * Switch to a different account
   */
  async switchAccount(newAccountAddress: string): Promise<void> {
    this.ensureInitialized();
    await this.sendMessage('switch_account', { accountAddress: newAccountAddress });
  }

  /**
   * List all persisted accounts
   */
  async listPersistedAccounts(): Promise<string[]> {
    this.ensureInitialized();
    return this.sendMessage('list_accounts');
  }

  /**
   * Remove an account and its data
   */
  async removeAccount(accountAddress: string): Promise<void> {
    this.ensureInitialized();
    await this.sendMessage('remove_account', { accountAddress });
  }

  // ============= Token Management Methods =============

  /**
   * Get all persisted tokens
   */
  async getPersistedTokens(): Promise<StoredUCANToken[]> {
    this.ensureInitialized();
    return this.sendMessage('get_tokens');
  }

  /**
   * Remove expired tokens
   */
  async removeExpiredTokens(): Promise<void> {
    this.ensureInitialized();
    await this.sendMessage('remove_expired_tokens');
  }

  // ============= Lifecycle Management =============

  /**
   * Cleanup and release resources
   */
  async cleanup(): Promise<void> {
    this.stopHealthChecks();

    if (this.worker) {
      // Send cleanup message to worker
      try {
        await this.sendMessage('cleanup');
      } catch (error) {
        console.error('[EnclaveWorkerClient] Cleanup message failed:', error);
      }

      // Terminate worker
      this.worker.terminate();
      this.worker = null;
    }

    // Clear pending requests
    for (const [id, pending] of this.pendingRequests) {
      if (pending.timeoutId) {
        clearTimeout(pending.timeoutId);
      }
      pending.reject(new Error('Worker terminated'));
    }

    this.pendingRequests.clear();
    this.isInitialized = false;
    this.initPromise = null;

    if (this.config.debug) {
      console.log('[EnclaveWorkerClient] Cleanup complete');
    }
  }
}

/**
 * Create a new worker client instance
 */
export function createWorkerClient(config?: WorkerClientConfig): EnclaveWorkerClient {
  return new EnclaveWorkerClient(config);
}

/**
 * Default worker client instance (singleton pattern)
 */
let defaultWorkerClient: EnclaveWorkerClient | null = null;

/**
 * Get or create the default worker client
 */
export async function getDefaultWorkerClient(config?: WorkerClientConfig): Promise<EnclaveWorkerClient> {
  if (!defaultWorkerClient) {
    defaultWorkerClient = createWorkerClient(config);
    await defaultWorkerClient.initialize();
  }
  return defaultWorkerClient;
}

/**
 * Check if Web Workers are supported
 */
export function isWorkerSupported(): boolean {
  return typeof Worker !== 'undefined';
}
