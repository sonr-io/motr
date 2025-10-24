/**
 * Worker Registry
 *
 * Central registry for managing Web Worker lifecycle, communication,
 * and health monitoring across the Sonr browser client.
 *
 * Features:
 * - Worker lifecycle management (create, terminate, restart)
 * - Health monitoring with automatic recovery
 * - Worker pool management
 * - Type-safe message routing
 * - Shared worker support for cross-tab state
 * - Automatic fallback to main thread
 *
 * @see https://developer.mozilla.org/en-US/docs/Web/API/Web_Workers_API
 */

/**
 * Worker types supported by the registry
 */
export enum WorkerType {
  ENCLAVE = "enclave",
  VAULT = "vault",
  SHARED = "shared",
}

/**
 * Worker state tracking
 */
export enum WorkerState {
  IDLE = "idle",
  INITIALIZING = "initializing",
  READY = "ready",
  BUSY = "busy",
  ERROR = "error",
  TERMINATED = "terminated",
}

/**
 * Worker instance configuration
 */
export interface WorkerConfig {
  /** Worker type identifier */
  type: WorkerType;
  /** Worker script URL */
  url: string | URL;
  /** Worker name for debugging */
  name?: string;
  /** Use SharedWorker instead of Worker */
  shared?: boolean;
  /** Maximum retry attempts on failure */
  maxRetries?: number;
  /** Health check interval in milliseconds */
  healthCheckInterval?: number;
  /** Request timeout in milliseconds */
  requestTimeout?: number;
  /** Worker-specific initialization data */
  initData?: any;
  /** Enable debug logging */
  debug?: boolean;
}

/**
 * Worker instance metadata
 */
export interface WorkerInstance {
  /** Unique worker ID */
  id: string;
  /** Worker type */
  type: WorkerType;
  /** Worker configuration */
  config: WorkerConfig;
  /** Worker or SharedWorker instance */
  worker: Worker | SharedWorker;
  /** Current worker state */
  state: WorkerState;
  /** Creation timestamp */
  createdAt: number;
  /** Last active timestamp */
  lastActiveAt: number;
  /** Retry count */
  retryCount: number;
  /** Health check interval ID */
  healthCheckId?: ReturnType<typeof setInterval>;
  /** Pending requests count */
  pendingRequests: number;
}

/**
 * Worker message envelope
 */
export interface WorkerMessage<T = any> {
  /** Unique message ID */
  id: string;
  /** Worker type this message is for */
  workerType: WorkerType;
  /** Message type/action */
  type: string;
  /** Message payload */
  payload?: T;
  /** Timestamp */
  timestamp: number;
}

/**
 * Worker response envelope
 */
export interface WorkerResponse<T = any> {
  /** Message ID this responds to */
  id: string;
  /** Success flag */
  success: boolean;
  /** Response data */
  data?: T;
  /** Error message if failed */
  error?: string;
  /** Timestamp */
  timestamp: number;
}

/**
 * Pending request tracking
 */
interface PendingRequest<T = any> {
  resolve: (value: T) => void;
  reject: (reason: any) => void;
  timeoutId?: ReturnType<typeof setTimeout>;
  workerId: string;
  timestamp: number;
}

/**
 * Worker Registry Options
 */
export interface WorkerRegistryOptions {
  /** Enable debug logging */
  debug?: boolean;
  /** Default request timeout */
  defaultTimeout?: number;
  /** Default max retries */
  defaultMaxRetries?: number;
  /** Default health check interval */
  defaultHealthCheckInterval?: number;
  /** Enable automatic recovery */
  autoRecover?: boolean;
}

/**
 * Worker Registry
 *
 * Central management system for all Web Workers in the browser client
 */
export class WorkerRegistry extends EventTarget {
  private workers = new Map<string, WorkerInstance>();
  private pendingRequests = new Map<string, PendingRequest>();
  private messageIdCounter = 0;
  private options: Required<WorkerRegistryOptions>;

  constructor(options: WorkerRegistryOptions = {}) {
    super();

    this.options = {
      debug: options.debug ?? false,
      defaultTimeout: options.defaultTimeout ?? 30000,
      defaultMaxRetries: options.defaultMaxRetries ?? 3,
      defaultHealthCheckInterval: options.defaultHealthCheckInterval ?? 60000,
      autoRecover: options.autoRecover ?? true,
    };

    if (this.options.debug) {
      console.log("[WorkerRegistry] Initialized with options:", this.options);
    }
  }

  /**
   * Register a new worker
   */
  async register(config: WorkerConfig): Promise<string> {
    const workerId = this.generateWorkerId(config.type);

    if (this.options.debug) {
      console.log(`[WorkerRegistry] Registering worker: ${workerId}`, config);
    }

    // Check if worker type already exists (singleton pattern)
    const existing = this.getWorkerByType(config.type);
    if (existing) {
      if (this.options.debug) {
        console.log(
          `[WorkerRegistry] Worker of type ${config.type} already exists: ${existing.id}`,
        );
      }
      return existing.id;
    }

    try {
      // Create worker instance
      const worker = this.createWorker(config);

      // Create worker metadata
      const instance: WorkerInstance = {
        id: workerId,
        type: config.type,
        config: {
          maxRetries: this.options.defaultMaxRetries,
          healthCheckInterval: this.options.defaultHealthCheckInterval,
          requestTimeout: this.options.defaultTimeout,
          debug: this.options.debug,
          ...config,
        },
        worker,
        state: WorkerState.INITIALIZING,
        createdAt: Date.now(),
        lastActiveAt: Date.now(),
        retryCount: 0,
        pendingRequests: 0,
      };

      // Setup message handlers
      this.setupMessageHandlers(instance);

      // Wait for worker ready signal
      await this.waitForReady(instance);

      // Initialize worker with custom data if provided
      if (config.initData) {
        await this.sendMessage(workerId, "init", config.initData);
      }

      // Update state
      instance.state = WorkerState.READY;

      // Store worker instance
      this.workers.set(workerId, instance);

      // Start health monitoring
      this.startHealthMonitoring(instance);

      // Emit registration event
      this.dispatchEvent(
        new CustomEvent("worker:registered", {
          detail: { workerId, type: config.type },
        }),
      );

      if (this.options.debug) {
        console.log(`[WorkerRegistry] Worker registered: ${workerId}`);
      }

      return workerId;
    } catch (error) {
      if (this.options.debug) {
        console.error(`[WorkerRegistry] Failed to register worker:`, error);
      }
      throw error;
    }
  }

  /**
   * Create worker instance
   */
  private createWorker(config: WorkerConfig): Worker | SharedWorker {
    const url = typeof config.url === "string" ? new URL(config.url, location.origin) : config.url;

    if (config.shared && typeof SharedWorker !== "undefined") {
      return new SharedWorker(url, {
        name: config.name || `sonr-${config.type}-worker`,
        type: "module",
      });
    }

    if (typeof Worker === "undefined") {
      throw new Error("Web Workers are not supported in this environment");
    }

    return new Worker(url, {
      name: config.name || `sonr-${config.type}-worker`,
      type: "module",
    });
  }

  /**
   * Setup message handlers for worker
   */
  private setupMessageHandlers(instance: WorkerInstance): void {
    const target =
      instance.worker instanceof SharedWorker ? instance.worker.port : instance.worker;

    target.addEventListener("message", (event: MessageEvent<WorkerResponse>) => {
      this.handleWorkerMessage(instance, event.data);
    });

    target.addEventListener("error", (event: ErrorEvent) => {
      this.handleWorkerError(instance, event);
    });

    target.addEventListener("messageerror", (event: MessageEvent) => {
      console.error(`[WorkerRegistry] Message error from ${instance.id}:`, event);
    });

    // Start SharedWorker port if needed
    if (instance.worker instanceof SharedWorker) {
      instance.worker.port.start();
    }
  }

  /**
   * Wait for worker ready signal
   */
  private async waitForReady(instance: WorkerInstance): Promise<void> {
    return new Promise((resolve, reject) => {
      const timeout = setTimeout(() => {
        reject(new Error(`Worker ${instance.id} initialization timeout`));
      }, instance.config.requestTimeout!);

      const target =
        instance.worker instanceof SharedWorker ? instance.worker.port : instance.worker;

      const handler = (event: MessageEvent<WorkerResponse>) => {
        if (event.data.success && (event.data as any).type === "ready") {
          clearTimeout(timeout);
          target.removeEventListener("message", handler);
          resolve();
        }
      };

      target.addEventListener("message", handler);
    });
  }

  /**
   * Handle incoming worker messages
   */
  private handleWorkerMessage(instance: WorkerInstance, response: WorkerResponse): void {
    instance.lastActiveAt = Date.now();

    if (instance.state === WorkerState.BUSY && instance.pendingRequests > 0) {
      instance.pendingRequests--;
    }

    if (instance.pendingRequests === 0 && instance.state === WorkerState.BUSY) {
      instance.state = WorkerState.READY;
    }

    const pending = this.pendingRequests.get(response.id);
    if (!pending) {
      if (this.options.debug) {
        console.warn(
          `[WorkerRegistry] Received response for unknown request: ${response.id}`,
        );
      }
      return;
    }

    // Clear timeout
    if (pending.timeoutId) {
      clearTimeout(pending.timeoutId);
    }

    // Remove from pending
    this.pendingRequests.delete(response.id);

    // Resolve or reject
    if (response.success) {
      pending.resolve(response.data);
    } else {
      pending.reject(new Error(response.error || "Unknown worker error"));
    }

    if (this.options.debug) {
      console.log(`[WorkerRegistry] Response received for ${response.id}`);
    }
  }

  /**
   * Handle worker errors
   */
  private handleWorkerError(instance: WorkerInstance, event: ErrorEvent): void {
    console.error(`[WorkerRegistry] Worker error in ${instance.id}:`, event.error || event.message);

    instance.state = WorkerState.ERROR;

    // Reject all pending requests for this worker
    const pendingForWorker = Array.from(this.pendingRequests.entries()).filter(
      ([_id, req]) => req.workerId === instance.id,
    );

    for (const [id, pending] of pendingForWorker) {
      if (pending.timeoutId) {
        clearTimeout(pending.timeoutId);
      }
      pending.reject(new Error(event.message || "Worker error"));
      this.pendingRequests.delete(id);
    }

    // Emit error event
    this.dispatchEvent(
      new CustomEvent("worker:error", {
        detail: {
          workerId: instance.id,
          type: instance.type,
          error: event.error || event.message,
        },
      }),
    );

    // Attempt recovery if enabled
    if (this.options.autoRecover && instance.retryCount < instance.config.maxRetries!) {
      this.recoverWorker(instance);
    }
  }

  /**
   * Attempt to recover a failed worker
   */
  private async recoverWorker(instance: WorkerInstance): Promise<void> {
    if (this.options.debug) {
      console.log(
        `[WorkerRegistry] Attempting to recover worker ${instance.id} (attempt ${instance.retryCount + 1}/${instance.config.maxRetries})`,
      );
    }

    instance.retryCount++;

    // Terminate existing worker
    await this.terminate(instance.id);

    // Wait before retry
    await new Promise((resolve) => setTimeout(resolve, 1000 * instance.retryCount));

    try {
      // Re-register worker
      await this.register(instance.config);

      if (this.options.debug) {
        console.log(`[WorkerRegistry] Worker ${instance.id} recovered successfully`);
      }

      // Emit recovery event
      this.dispatchEvent(
        new CustomEvent("worker:recovered", {
          detail: { workerId: instance.id, type: instance.type },
        }),
      );
    } catch (error) {
      console.error(`[WorkerRegistry] Failed to recover worker ${instance.id}:`, error);

      // Emit recovery failure event
      this.dispatchEvent(
        new CustomEvent("worker:recovery-failed", {
          detail: { workerId: instance.id, type: instance.type, error },
        }),
      );
    }
  }

  /**
   * Start health monitoring for worker
   */
  private startHealthMonitoring(instance: WorkerInstance): void {
    if (instance.config.healthCheckInterval! <= 0) {
      return;
    }

    instance.healthCheckId = setInterval(async () => {
      try {
        await this.ping(instance.id);

        if (this.options.debug) {
          console.log(`[WorkerRegistry] Health check passed for ${instance.id}`);
        }
      } catch (error) {
        console.error(`[WorkerRegistry] Health check failed for ${instance.id}:`, error);

        if (this.options.autoRecover) {
          this.recoverWorker(instance);
        }
      }
    }, instance.config.healthCheckInterval);
  }

  /**
   * Stop health monitoring
   */
  private stopHealthMonitoring(instance: WorkerInstance): void {
    if (instance.healthCheckId) {
      clearInterval(instance.healthCheckId);
      instance.healthCheckId = undefined;
    }
  }

  /**
   * Ping worker to check health
   */
  async ping(workerId: string): Promise<number> {
    const response = await this.sendMessage<{ timestamp: number }>(workerId, "ping");
    return response.timestamp;
  }

  /**
   * Send message to worker
   */
  async sendMessage<T = any>(
    workerId: string,
    type: string,
    payload?: any,
  ): Promise<T> {
    const instance = this.workers.get(workerId);
    if (!instance) {
      throw new Error(`Worker not found: ${workerId}`);
    }

    if (instance.state === WorkerState.TERMINATED) {
      throw new Error(`Worker is terminated: ${workerId}`);
    }

    return new Promise<T>((resolve, reject) => {
      const messageId = this.generateMessageId();

      // Setup timeout
      const timeoutId = setTimeout(() => {
        this.pendingRequests.delete(messageId);
        instance.pendingRequests--;
        reject(new Error(`Request timeout: ${type} to ${workerId}`));
      }, instance.config.requestTimeout);

      // Track pending request
      this.pendingRequests.set(messageId, {
        resolve,
        reject,
        timeoutId,
        workerId,
        timestamp: Date.now(),
      });

      // Update worker state
      instance.state = WorkerState.BUSY;
      instance.pendingRequests++;

      // Create message
      const message: WorkerMessage = {
        id: messageId,
        workerType: instance.type,
        type,
        payload,
        timestamp: Date.now(),
      };

      // Send to worker
      const target =
        instance.worker instanceof SharedWorker ? instance.worker.port : instance.worker;

      target.postMessage(message);

      if (this.options.debug) {
        console.log(`[WorkerRegistry] Sent message to ${workerId}:`, type, payload);
      }
    });
  }

  /**
   * Terminate worker
   */
  async terminate(workerId: string): Promise<void> {
    const instance = this.workers.get(workerId);
    if (!instance) {
      return;
    }

    if (this.options.debug) {
      console.log(`[WorkerRegistry] Terminating worker: ${workerId}`);
    }

    // Stop health monitoring
    this.stopHealthMonitoring(instance);

    // Send cleanup message
    try {
      await this.sendMessage(workerId, "cleanup");
    } catch (error) {
      console.error(`[WorkerRegistry] Cleanup failed for ${workerId}:`, error);
    }

    // Terminate worker
    if (instance.worker instanceof SharedWorker) {
      instance.worker.port.close();
    } else {
      instance.worker.terminate();
    }

    // Update state
    instance.state = WorkerState.TERMINATED;

    // Remove from registry
    this.workers.delete(workerId);

    // Emit termination event
    this.dispatchEvent(
      new CustomEvent("worker:terminated", {
        detail: { workerId, type: instance.type },
      }),
    );

    if (this.options.debug) {
      console.log(`[WorkerRegistry] Worker terminated: ${workerId}`);
    }
  }

  /**
   * Terminate all workers
   */
  async terminateAll(): Promise<void> {
    const workerIds = Array.from(this.workers.keys());
    await Promise.all(workerIds.map((id) => this.terminate(id)));
  }

  /**
   * Get worker by ID
   */
  getWorker(workerId: string): WorkerInstance | undefined {
    return this.workers.get(workerId);
  }

  /**
   * Get worker by type
   */
  getWorkerByType(type: WorkerType): WorkerInstance | undefined {
    return Array.from(this.workers.values()).find((w) => w.type === type);
  }

  /**
   * Get all workers
   */
  getAllWorkers(): WorkerInstance[] {
    return Array.from(this.workers.values());
  }

  /**
   * Check if worker type is registered
   */
  hasWorkerType(type: WorkerType): boolean {
    return this.getWorkerByType(type) !== undefined;
  }

  /**
   * Get worker statistics
   */
  getStatistics() {
    const workers = Array.from(this.workers.values());

    return {
      total: workers.length,
      byState: {
        idle: workers.filter((w) => w.state === WorkerState.IDLE).length,
        initializing: workers.filter((w) => w.state === WorkerState.INITIALIZING).length,
        ready: workers.filter((w) => w.state === WorkerState.READY).length,
        busy: workers.filter((w) => w.state === WorkerState.BUSY).length,
        error: workers.filter((w) => w.state === WorkerState.ERROR).length,
        terminated: workers.filter((w) => w.state === WorkerState.TERMINATED).length,
      },
      byType: {
        enclave: workers.filter((w) => w.type === WorkerType.ENCLAVE).length,
        vault: workers.filter((w) => w.type === WorkerType.VAULT).length,
        shared: workers.filter((w) => w.type === WorkerType.SHARED).length,
      },
      pendingRequests: this.pendingRequests.size,
    };
  }

  /**
   * Generate unique worker ID
   */
  private generateWorkerId(type: WorkerType): string {
    return `worker-${type}-${Date.now()}-${Math.random().toString(36).substring(2, 9)}`;
  }

  /**
   * Generate unique message ID
   */
  private generateMessageId(): string {
    return `msg-${Date.now()}-${++this.messageIdCounter}`;
  }

  /**
   * Check if Web Workers are supported
   */
  static isSupported(): boolean {
    return typeof Worker !== "undefined";
  }

  /**
   * Check if SharedWorkers are supported
   */
  static isSharedWorkerSupported(): boolean {
    return typeof SharedWorker !== "undefined";
  }
}

/**
 * Create a global worker registry instance
 */
let globalRegistry: WorkerRegistry | null = null;

/**
 * Get or create the global worker registry
 */
export function getWorkerRegistry(options?: WorkerRegistryOptions): WorkerRegistry {
  if (!globalRegistry) {
    globalRegistry = new WorkerRegistry(options);
  }
  return globalRegistry;
}

/**
 * Reset global registry (useful for testing)
 */
export function resetWorkerRegistry(): void {
  if (globalRegistry) {
    globalRegistry.terminateAll();
    globalRegistry = null;
  }
}
