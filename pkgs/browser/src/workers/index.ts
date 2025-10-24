/**
 * Worker exports
 *
 * Re-exports worker-related types and utilities.
 * The actual worker scripts (enclave-worker.ts, vault-worker.ts) are
 * meant to be imported as Worker modules and registered via the WorkerRegistry.
 */

export type { WorkerMessage, WorkerResponse } from "../core/worker-registry.js";
export { WorkerType, WorkerState } from "../core/worker-registry.js";
