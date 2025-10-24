/**
 * Vault Worker
 *
 * Web Worker wrapper for @sonr.io/vault WASM operations.
 * Provides persistent storage and cryptographic vault operations off the main thread.
 *
 * This worker can be used directly:
 * ```typescript
 * const worker = new Worker('/workers/vault-worker.js', { type: 'module' });
 * ```
 *
 * Or via the WorkerRegistry:
 * ```typescript
 * import { getWorkerRegistry, WorkerType } from '@sonr.io/browser';
 *
 * const registry = getWorkerRegistry();
 * const workerId = await registry.register({
 *   type: WorkerType.VAULT,
 *   url: '/workers/vault-worker.js',
 * });
 * ```
 */

/// <reference lib="webworker" />

// Import vault worker implementation
// Note: The actual worker implementation would come from @sonr.io/vault
// For now, this is a placeholder that demonstrates the structure

declare const self: DedicatedWorkerGlobalScope;

interface VaultWorkerMessage {
  id: string;
  type: string;
  payload?: any;
}

interface VaultWorkerResponse {
  id: string;
  success: boolean;
  data?: any;
  error?: string;
}

// Notify that worker is ready
self.postMessage({
  id: "worker-ready",
  type: "ready",
  success: true,
} as VaultWorkerResponse);

// Handle incoming messages
self.addEventListener("message", async (event: MessageEvent<VaultWorkerMessage>) => {
  const message = event.data;

  try {
    // Handle different message types
    switch (message.type) {
      case "ping":
        self.postMessage({
          id: message.id,
          success: true,
          data: { timestamp: Date.now() },
        } as VaultWorkerResponse);
        break;

      case "init":
        // Initialize vault
        self.postMessage({
          id: message.id,
          success: true,
          data: { message: "Vault initialized" },
        } as VaultWorkerResponse);
        break;

      case "cleanup":
        self.postMessage({
          id: message.id,
          success: true,
          data: { message: "Cleanup complete" },
        } as VaultWorkerResponse);
        break;

      default:
        throw new Error(`Unknown message type: ${message.type}`);
    }
  } catch (error) {
    self.postMessage({
      id: message.id,
      success: false,
      error: error instanceof Error ? error.message : String(error),
    } as VaultWorkerResponse);
  }
});

// Handle errors
self.addEventListener("error", (event: ErrorEvent) => {
  console.error("[VaultWorker] Error:", event.error || event.message);
});
