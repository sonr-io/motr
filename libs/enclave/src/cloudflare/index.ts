/**
 * @sonr.io/enclave - Cloudflare Workers Integration
 *
 * This module provides Cloudflare Workers-specific exports for the Sonr Enclave.
 * It includes Durable Objects for identity management and a Worker entrypoint.
 *
 * Usage in Cloudflare Workers:
 *
 * ```typescript
 * // Import in your worker
 * import { SonrIdentityDurable } from '@sonr.io/enclave/cloudflare';
 *
 * // Export for Cloudflare runtime
 * export { SonrIdentityDurable };
 * ```
 *
 * Or use the standalone worker:
 *
 * ```typescript
 * import worker from '@sonr.io/enclave/cloudflare/worker';
 * export default worker;
 * ```
 */

// Export all Durable Objects
export * from './durable';

// Re-export worker entrypoint for convenience
export { default as worker } from './worker';
export type { Env as WorkerEnv } from './worker';
