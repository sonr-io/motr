/**
 * Enclave Worker
 *
 * Web Worker wrapper for @sonr.io/enclave WASM operations.
 * Runs cryptographic operations off the main thread for better performance.
 *
 * This worker can be used directly:
 * ```typescript
 * const worker = new Worker('/workers/enclave-worker.js', { type: 'module' });
 * ```
 *
 * Or via the WorkerRegistry:
 * ```typescript
 * import { getWorkerRegistry, WorkerType } from '@sonr.io/browser';
 *
 * const registry = getWorkerRegistry();
 * const workerId = await registry.register({
 *   type: WorkerType.ENCLAVE,
 *   url: '/workers/enclave-worker.js',
 * });
 * ```
 */

/// <reference lib="webworker" />

// Import enclave worker from the enclave package
// The actual implementation comes from @sonr.io/enclave/worker
import "@sonr.io/enclave/worker";

// Note: The enclave package exports a worker.ts that handles all the worker logic.
// This file serves as an entry point that can be bundled by Vite.

declare const self: DedicatedWorkerGlobalScope;

// The worker is initialized by the enclave package's worker module
// No additional code needed here
