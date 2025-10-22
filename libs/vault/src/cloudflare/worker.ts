/**
 * @sonr.io/vault - Cloudflare Worker Entrypoint
 *
 * Standalone Cloudflare Worker for Vault Durable Objects.
 * Provides payment processing and OIDC authentication via WASM HTTP server.
 */

// Export Durable Object class for Cloudflare Workers runtime
export { VaultDurable } from "./durable/vault";

/**
 * Environment bindings for the Vault Worker
 */
export interface Env {
  // Durable Object namespace for vault instances
  VAULT: DurableObjectNamespace;

  // Environment identifier
  ENVIRONMENT?: string;
}

/**
 * Main Worker fetch handler
 *
 * Routes requests to the appropriate Durable Object instance.
 * Each user/session can have their own isolated vault instance.
 *
 * URL Patterns:
 * - /vault/{vaultId}/payment/* - Payment processing endpoints
 * - /vault/{vaultId}/api/* - General API endpoints
 * - /vault/{vaultId}/.well-known/* - OIDC discovery endpoints
 * - /vault/{vaultId}/authorize - OAuth2 authorization
 * - /vault/{vaultId}/token - Token exchange
 * - /vault/{vaultId}/userinfo - User info endpoint
 *
 * Examples:
 * - POST /vault/user123/api/payment/process
 * - GET  /vault/user123/.well-known/openid-configuration
 * - GET  /vault/user123/health
 */
export default {
  async fetch(request: Request, env: Env): Promise<Response> {
    const url = new URL(request.url);

    // Global health check endpoint (no vault ID needed)
    if (url.pathname === "/health") {
      return Response.json({
        status: "healthy",
        service: "motr-vault",
        environment: env.ENVIRONMENT || "unknown",
        timestamp: Date.now(),
      });
    }

    // Route: /vault/{vaultId}/{path}
    const pathMatch = url.pathname.match(/^\/vault\/([^/]+)(?:\/(.*))?$/);

    if (!pathMatch) {
      return Response.json(
        {
          error: "Invalid path",
          message: "Expected format: /vault/{vaultId}/{path}",
          examples: [
            "/vault/user123/api/payment/process",
            "/vault/user123/.well-known/openid-configuration",
            "/vault/user123/health",
          ],
        },
        { status: 404 },
      );
    }

    const [, vaultId, path = ""] = pathMatch;

    console.log(`[VaultWorker] Request: ${request.method} ${url.pathname}`);
    console.log(`[VaultWorker] Vault ID: ${vaultId}, Path: ${path}`);

    try {
      // Get or create Durable Object for this vault
      // Each vault ID gets its own isolated Durable Object instance
      const id = env.VAULT.idFromName(vaultId);
      const stub = env.VAULT.get(id);

      // Forward request to Durable Object with the path
      // The WASM server inside the DO will handle the routing
      const doRequest = new Request(`https://vault/${path}`, {
        method: request.method,
        headers: request.headers,
        body: request.body,
      });

      return await stub.fetch(doRequest);
    } catch (error) {
      console.error("[VaultWorker] Error:", error);
      return Response.json(
        {
          error: "Internal server error",
          message: error instanceof Error ? error.message : "Unknown error",
          vaultId,
          path,
        },
        { status: 500 },
      );
    }
  },
};
