/**
 * @sonr.io/enclave - Cloudflare Worker Entrypoint
 *
 * Standalone Cloudflare Worker for Sonr Identity Durable Objects.
 * Provides a REST API for managing identities via the SonrIdentityDurable.
 */

// Export Durable Object class for Cloudflare Workers runtime
export { SonrIdentityDurable } from './durable/sonr-identity';

/**
 * Environment bindings for the Enclave Worker
 */
export interface Env {
  // Durable Object namespace for identity management
  SONR_IDENTITY: DurableObjectNamespace;

  // Environment identifier
  ENVIRONMENT?: string;
}

/**
 * Main Worker fetch handler
 *
 * Routes requests to the appropriate Durable Object instance based on account address.
 * URL Pattern: /identity/{accountAddress}/{action}
 *
 * Examples:
 * - POST /identity/sonr1abc.../initialize
 * - GET  /identity/sonr1abc.../status
 * - GET  /identity/sonr1abc.../did
 * - POST /identity/sonr1abc.../sign
 */
export default {
  async fetch(request: Request, env: Env): Promise<Response> {
    const url = new URL(request.url);

    // Health check endpoint
    if (url.pathname === '/health') {
      return Response.json({
        status: 'healthy',
        service: 'sonr-enclave',
        environment: env.ENVIRONMENT || 'unknown',
        timestamp: Date.now(),
      });
    }

    // Route: /identity/{accountAddress}/{action}
    const pathMatch = url.pathname.match(/^\/identity\/([^\/]+)(?:\/(.+))?$/);

    if (!pathMatch) {
      return Response.json(
        {
          error: 'Invalid path',
          message: 'Expected format: /identity/{accountAddress}/{action}',
          examples: [
            '/identity/sonr1abc.../initialize',
            '/identity/sonr1abc.../status',
            '/identity/sonr1abc.../did',
          ],
        },
        { status: 404 }
      );
    }

    const [, accountAddress, action = 'status'] = pathMatch;

    console.log(`[EnclaveWorker] Request: ${request.method} ${url.pathname}`);
    console.log(`[EnclaveWorker] Account: ${accountAddress}, Action: ${action}`);

    try {
      // Get or create Durable Object for this identity
      // Each account address gets its own isolated Durable Object instance
      const id = env.SONR_IDENTITY.idFromName(accountAddress);
      const stub = env.SONR_IDENTITY.get(id);

      // Forward request to Durable Object with the action path
      const doRequest = new Request(`https://identity/${action}`, {
        method: request.method,
        headers: request.headers,
        body: request.body,
      });

      return await stub.fetch(doRequest);
    } catch (error) {
      console.error('[EnclaveWorker] Error:', error);
      return Response.json(
        {
          error: 'Internal server error',
          message: error instanceof Error ? error.message : 'Unknown error',
          accountAddress,
          action,
        },
        { status: 500 }
      );
    }
  },
};
