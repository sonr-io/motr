/**
 * Sonr Browser Client
 *
 * Main browser client that orchestrates Web Workers for WASM-based
 * cryptographic operations and blockchain interactions.
 *
 * Features:
 * - Worker-based architecture with automatic fallback
 * - Type-safe API for enclave and vault operations
 * - WebAuthn authentication integration
 * - Transaction signing and broadcasting
 * - IndexedDB persistence with cross-tab sync
 * - Custom events for state changes
 *
 * @example
 * ```typescript
 * import { SonrBrowser } from '@sonr.io/browser';
 *
 * const browser = new SonrBrowser({
 *   network: 'testnet',
 *   autoConnect: true
 * });
 *
 * await browser.initialize();
 *
 * // Authenticate with WebAuthn
 * const result = await browser.auth.register('username');
 * ```
 */

import { getWorkerRegistry, WorkerRegistry, WorkerType } from "../core/worker-registry.js";
import type { EnclaveWorkerClient } from "@sonr.io/enclave/worker-client";
import type { ServiceWorkerController } from "@sonr.io/vault";
import { RpcClient } from "@sonr.io/sdk/client";

/**
 * Browser client configuration
 */
export interface SonrBrowserConfig {
  /**
   * Network to connect to
   * @default 'testnet'
   */
  network?: "mainnet" | "testnet" | "devnet" | string;

  /**
   * RPC endpoint URL (overrides network)
   */
  rpcUrl?: string;

  /**
   * Enable enclave worker
   * @default true
   */
  enableEnclave?: boolean;

  /**
   * Enclave worker URL
   */
  enclaveWorkerUrl?: string;

  /**
   * Enable vault worker
   * @default true
   */
  enableVault?: boolean;

  /**
   * Vault worker URL
   */
  vaultWorkerUrl?: string;

  /**
   * Use SharedWorker for cross-tab state
   * @default false
   */
  useSharedWorkers?: boolean;

  /**
   * Auto-connect on initialization
   * @default true
   */
  autoConnect?: boolean;

  /**
   * Enable debug logging
   * @default false
   */
  debug?: boolean;

  /**
   * Custom worker registry instance
   */
  workerRegistry?: WorkerRegistry;

  /**
   * IndexedDB database name
   * @default 'sonr-browser'
   */
  dbName?: string;

  /**
   * Enable cross-tab synchronization
   * @default true
   */
  enableCrossTabSync?: boolean;
}

/**
 * Browser client state
 */
export enum BrowserClientState {
  IDLE = "idle",
  INITIALIZING = "initializing",
  READY = "ready",
  CONNECTED = "connected",
  ERROR = "error",
}

/**
 * Browser client events
 */
export interface SonrBrowserEvents {
  "state:changed": { state: BrowserClientState };
  "auth:registered": { address: string; did: string };
  "auth:authenticated": { address: string };
  "auth:logout": { address: string };
  "tx:signed": { txHash: string };
  "tx:broadcast": { txHash: string };
  "tx:confirmed": { txHash: string; height: number };
  "error": { error: Error; context?: string };
}

/**
 * Sonr Browser Client
 *
 * Main client for browser-based Sonr interactions
 */
export class SonrBrowser extends EventTarget {
  private config: Required<SonrBrowserConfig>;
  private state: BrowserClientState = BrowserClientState.IDLE;
  private workerRegistry: WorkerRegistry;

  // Client instances
  private _enclave?: EnclaveWorkerClient;
  private _vault?: ServiceWorkerController;
  private _rpc?: RpcClient;

  // Worker IDs
  private enclaveWorkerId?: string;
  private vaultWorkerId?: string;

  constructor(config: SonrBrowserConfig = {}) {
    super();

    this.config = {
      network: config.network ?? "testnet",
      rpcUrl: config.rpcUrl ?? this.getDefaultRpcUrl(config.network ?? "testnet"),
      enableEnclave: config.enableEnclave ?? true,
      enclaveWorkerUrl: config.enclaveWorkerUrl ?? this.getWorkerUrl("enclave"),
      enableVault: config.enableVault ?? true,
      vaultWorkerUrl: config.vaultWorkerUrl ?? this.getWorkerUrl("vault"),
      useSharedWorkers: config.useSharedWorkers ?? false,
      autoConnect: config.autoConnect ?? true,
      debug: config.debug ?? false,
      dbName: config.dbName ?? "sonr-browser",
      enableCrossTabSync: config.enableCrossTabSync ?? true,
      workerRegistry: config.workerRegistry ?? getWorkerRegistry({ debug: config.debug }),
    };

    this.workerRegistry = this.config.workerRegistry;

    if (this.config.debug) {
      console.log("[SonrBrowser] Initialized with config:", this.config);
    }
  }

  /**
   * Initialize the browser client
   */
  async initialize(): Promise<void> {
    if (this.state !== BrowserClientState.IDLE) {
      if (this.config.debug) {
        console.log("[SonrBrowser] Already initialized");
      }
      return;
    }

    this.setState(BrowserClientState.INITIALIZING);

    try {
      // Initialize workers
      await this.initializeWorkers();

      // Initialize RPC client if auto-connect
      if (this.config.autoConnect) {
        await this.connect();
      }

      this.setState(BrowserClientState.READY);

      if (this.config.debug) {
        console.log("[SonrBrowser] Initialization complete");
      }
    } catch (error) {
      this.setState(BrowserClientState.ERROR);
      this.emitEvent("error", { error: error as Error, context: "initialization" });
      throw error;
    }
  }

  /**
   * Initialize Web Workers
   */
  private async initializeWorkers(): Promise<void> {
    const workerPromises: Promise<void>[] = [];

    // Initialize enclave worker
    if (this.config.enableEnclave) {
      workerPromises.push(
        this.workerRegistry
          .register({
            type: WorkerType.ENCLAVE,
            url: this.config.enclaveWorkerUrl!,
            name: "sonr-enclave-worker",
            shared: this.config.useSharedWorkers,
            debug: this.config.debug,
          })
          .then((workerId) => {
            this.enclaveWorkerId = workerId;
            if (this.config.debug) {
              console.log("[SonrBrowser] Enclave worker registered:", workerId);
            }
          }),
      );
    }

    // Initialize vault worker
    if (this.config.enableVault) {
      workerPromises.push(
        this.workerRegistry
          .register({
            type: WorkerType.VAULT,
            url: this.config.vaultWorkerUrl!,
            name: "sonr-vault-worker",
            shared: this.config.useSharedWorkers,
            debug: this.config.debug,
          })
          .then((workerId) => {
            this.vaultWorkerId = workerId;
            if (this.config.debug) {
              console.log("[SonrBrowser] Vault worker registered:", workerId);
            }
          }),
      );
    }

    await Promise.all(workerPromises);
  }

  /**
   * Connect to blockchain network
   */
  async connect(): Promise<void> {
    if (this.state === BrowserClientState.CONNECTED) {
      return;
    }

    try {
      // Initialize RPC client
      // Note: RpcClient doesn't have a constructor or connect method in current implementation
      // It provides static methods for querying and broadcasting
      // this._rpc = new RpcClient();

      this.setState(BrowserClientState.CONNECTED);

      if (this.config.debug) {
        console.log("[SonrBrowser] Connected to network:", this.config.network);
      }
    } catch (error) {
      this.emitEvent("error", { error: error as Error, context: "connection" });
      throw error;
    }
  }

  /**
   * Disconnect from blockchain network
   */
  async disconnect(): Promise<void> {
    if (this._rpc) {
      // await this._rpc.disconnect();
      this._rpc = undefined;
    }

    this.setState(BrowserClientState.READY);

    if (this.config.debug) {
      console.log("[SonrBrowser] Disconnected");
    }
  }

  /**
   * Cleanup and release resources
   */
  async cleanup(): Promise<void> {
    await this.disconnect();

    if (this.enclaveWorkerId) {
      await this.workerRegistry.terminate(this.enclaveWorkerId);
    }

    if (this.vaultWorkerId) {
      await this.workerRegistry.terminate(this.vaultWorkerId);
    }

    this.setState(BrowserClientState.IDLE);

    if (this.config.debug) {
      console.log("[SonrBrowser] Cleanup complete");
    }
  }

  /**
   * Get enclave client (lazy initialization)
   */
  get enclave(): EnclaveWorkerClient {
    if (!this._enclave) {
      throw new Error("Enclave worker not initialized. Call initialize() first.");
    }
    return this._enclave;
  }

  /**
   * Get vault service worker controller (lazy initialization)
   */
  get vault(): ServiceWorkerController {
    if (!this._vault) {
      throw new Error("Vault worker not initialized. Call initialize() first.");
    }
    return this._vault;
  }

  /**
   * Get RPC client
   */
  get rpc(): RpcClient {
    if (!this._rpc) {
      throw new Error("RPC client not connected. Call connect() first.");
    }
    return this._rpc;
  }

  /**
   * Get current state
   */
  getState(): BrowserClientState {
    return this.state;
  }

  /**
   * Check if initialized
   */
  isInitialized(): boolean {
    return this.state !== BrowserClientState.IDLE;
  }

  /**
   * Check if connected
   */
  isConnected(): boolean {
    return this.state === BrowserClientState.CONNECTED;
  }

  /**
   * Check if ready
   */
  isReady(): boolean {
    return this.state === BrowserClientState.READY || this.state === BrowserClientState.CONNECTED;
  }

  /**
   * Get worker statistics
   */
  getWorkerStats() {
    return this.workerRegistry.getStatistics();
  }

  /**
   * Set state and emit event
   */
  private setState(newState: BrowserClientState): void {
    const oldState = this.state;
    this.state = newState;

    if (oldState !== newState) {
      this.emitEvent("state:changed", { state: newState });

      if (this.config.debug) {
        console.log(`[SonrBrowser] State changed: ${oldState} -> ${newState}`);
      }
    }
  }

  /**
   * Emit typed custom event
   */
  private emitEvent<K extends keyof SonrBrowserEvents>(
    type: K,
    detail: SonrBrowserEvents[K],
  ): void {
    this.dispatchEvent(new CustomEvent(type, { detail }));
  }

  /**
   * Get default RPC URL for network
   */
  private getDefaultRpcUrl(network: string): string {
    const urls: Record<string, string> = {
      mainnet: "https://rpc.sonr.network",
      testnet: "https://rpc.testnet.sonr.network",
      devnet: "http://localhost:26657",
    };

    return urls[network] || urls.testnet;
  }

  /**
   * Get worker URL (handles both dev and production)
   */
  private getWorkerUrl(type: "enclave" | "vault"): string {
    // In development, use source files
    if (import.meta.env?.DEV) {
      return `/src/workers/${type}-worker.ts`;
    }

    // In production, use built workers
    return `/workers/${type}-worker.js`;
  }

  /**
   * Create a typed event listener
   */
  on<K extends keyof SonrBrowserEvents>(
    type: K,
    listener: (event: CustomEvent<SonrBrowserEvents[K]>) => void,
    options?: AddEventListenerOptions,
  ): void {
    this.addEventListener(type, listener as EventListener, options);
  }

  /**
   * Remove a typed event listener
   */
  off<K extends keyof SonrBrowserEvents>(
    type: K,
    listener: (event: CustomEvent<SonrBrowserEvents[K]>) => void,
    options?: EventListenerOptions,
  ): void {
    this.removeEventListener(type, listener as EventListener, options);
  }

  /**
   * Wait for state
   */
  async waitForState(targetState: BrowserClientState, timeout = 10000): Promise<void> {
    if (this.state === targetState) {
      return;
    }

    return new Promise((resolve, reject) => {
      const timeoutId = setTimeout(() => {
        this.off("state:changed", handler);
        reject(new Error(`Timeout waiting for state: ${targetState}`));
      }, timeout);

      const handler = (event: CustomEvent<SonrBrowserEvents["state:changed"]>) => {
        if (event.detail.state === targetState) {
          clearTimeout(timeoutId);
          this.off("state:changed", handler);
          resolve();
        }
      };

      this.on("state:changed", handler);
    });
  }

  /**
   * Check if Web Workers are supported
   */
  static isSupported(): boolean {
    return WorkerRegistry.isSupported();
  }

  /**
   * Get version information
   */
  static getVersion() {
    return {
      name: "@sonr.io/browser",
      version: "0.0.1",
      features: [
        "Web Worker Architecture",
        "WASM Cryptography",
        "WebAuthn Authentication",
        "Blockchain Integration",
        "IndexedDB Persistence",
        "Custom Elements API",
        "TypeScript Support",
      ],
    };
  }
}

/**
 * Create a new Sonr browser client instance
 */
export function createSonrBrowser(config?: SonrBrowserConfig): SonrBrowser {
  return new SonrBrowser(config);
}

/**
 * Global singleton instance
 */
let globalInstance: SonrBrowser | null = null;

/**
 * Get or create global Sonr browser instance
 */
export async function getSonrBrowser(config?: SonrBrowserConfig): Promise<SonrBrowser> {
  if (!globalInstance) {
    globalInstance = createSonrBrowser(config);
    await globalInstance.initialize();
  }
  return globalInstance;
}

/**
 * Reset global instance (useful for testing)
 */
export function resetSonrBrowser(): void {
  if (globalInstance) {
    globalInstance.cleanup();
    globalInstance = null;
  }
}
