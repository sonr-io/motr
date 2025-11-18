/**
 * Cloudflare Worker for serving the Sonr.id frontend
 *
 * This worker serves the static Vite build and provides access to:
 * - KV namespaces
 * - Durable Objects
 * - R2 buckets
 * - Analytics Engine
 * - AI/Vectorize
 * - And all other Cloudflare features
 */

// Export local workflows
console.log('[Worker Init] Loading Cloudflare features...');
export { OTPEmailWorkflow } from './workflows';
console.log('[Worker Init] ✓ Loaded Workflows: OTPEmailWorkflow');

export interface Env {
  // Assets binding for serving static files
  ASSETS: Fetcher;

  // Environment variables
  ENVIRONMENT: string;

  // Service bindings
  ENCLAVE: Fetcher; // Sonr Enclave Worker (SonrIdentityDurable)

  // Local workflows
  OTP_EMAIL_WORKFLOW: Workflow;

  // KV namespaces
  OTP_STORE: KVNamespace;
  CHAIN_REGISTRY: KVNamespace;
  ASSET_REGISTRY: KVNamespace;

  // Environment variables
  EMAIL_FROM?: string;
  RESEND_API_KEY?: string;

  // Add your Cloudflare bindings here:
  // MY_KV: KVNamespace;
  // MY_BUCKET: R2Bucket;
  // AI: Ai;
}

export default {
  async fetch(
    request: Request,
    env: Env,
    _ctx: ExecutionContext,
  ): Promise<Response> {
    const url = new URL(request.url);
    console.log(`[Worker] Request received: ${request.method} ${url.pathname}`);

    // Payment method manifest endpoint
    if (url.pathname === "/pay" || url.pathname === "/pay/") {
      // Serve the payment manifest JSON directly with Link header
      const manifestUrl = `${url.origin}/pay/payment-manifest.json`;

      // Build supported origins list (no wildcards allowed by Payment Handler API)
      // Each entry must be a complete origin starting with https:// or http:// (localhost only)
      const supportedOrigins = [url.origin];

      // Add production domains if not localhost
      if (
        !url.hostname.includes("localhost") &&
        !url.hostname.includes("127.0.0.1")
      ) {
        supportedOrigins.push("https://sonr.id");
        // Add specific subdomains if needed (no wildcard patterns allowed)
        // supportedOrigins.push('https://www.sonr.id', 'https://app.sonr.id');
      }

      const manifest = {
        default_applications: [`${url.origin}/site.webmanifest`],
        supported_origins: supportedOrigins,
      };

      return new Response(JSON.stringify(manifest), {
        status: 200,
        headers: {
          "Content-Type": "application/json",
          Link: `<${manifestUrl}>; rel="payment-method-manifest"`,
          "Access-Control-Allow-Origin": "*",
        },
      });
    }

    // API routes - add your custom API handlers here
    if (url.pathname.startsWith("/api/")) {
      return handleApiRequest(request, env, _ctx);
    }

    // Health check endpoint
    if (url.pathname === "/health") {
      return new Response(
        JSON.stringify({
          status: "ok",
          environment: env.ENVIRONMENT,
          timestamp: new Date().toISOString(),
        }),
        {
          headers: { "Content-Type": "application/json" },
        },
      );
    }

    // Serve static assets from the ASSETS binding
    // This automatically handles SPA routing with not_found_handling = "single-page-application"
    try {
      return await env.ASSETS.fetch(request);
    } catch (error) {
      console.error("Error serving asset:", error);
      return new Response("Internal Server Error", { status: 500 });
    }
  },
} satisfies ExportedHandler<Env>;

/**
 * Handle API requests
 * Add your custom API logic here
 */
async function handleApiRequest(
  request: Request,
  env: Env,
  _ctx: ExecutionContext,
): Promise<Response> {
  const url = new URL(request.url);

  // Example API endpoint
  if (url.pathname === "/api/version") {
    return Response.json({
      version: "1.0.0",
      environment: env.ENVIRONMENT,
    });
  }

  // Chain Registry API endpoints
  if (url.pathname === "/api/chains") {
    // List all available chains from CHAIN_REGISTRY
    const chains = await env.CHAIN_REGISTRY.list();
    return Response.json({
      chains: chains.keys.map(k => k.name),
      count: chains.keys.length,
    });
  }

  if (url.pathname.startsWith("/api/chains/")) {
    const chainId = url.pathname.split("/api/chains/")[1];

    if (!chainId) {
      return Response.json({ error: "Chain ID required" }, { status: 400 });
    }

    // Get chain info
    const chainInfo = await env.CHAIN_REGISTRY.get(chainId, "json");
    const assetList = await env.ASSET_REGISTRY.get(chainId, "json");

    if (!chainInfo && !assetList) {
      return Response.json({ error: "Chain not found" }, { status: 404 });
    }

    return Response.json({
      chain: chainInfo,
      assets: assetList,
    });
  }

  // Sonr Identity endpoints - forward to Enclave service
  if (url.pathname.startsWith('/api/identity/')) {
    console.log('[Service Binding] Forwarding to Enclave Worker');

    // Extract identity ID from path (e.g., /api/identity/sonr1abc.../initialize)
    const pathParts = url.pathname.split('/');
    const identityId = pathParts[3]; // /api/identity/{id}/{action}

    if (!identityId) {
      return Response.json({ error: 'Identity ID required' }, { status: 400 });
    }

    // Forward to enclave service: /identity/{id}/{action}
    const enclavePath = `/identity/${pathParts.slice(3).join('/')}`;
    const enclaveUrl = new URL(request.url);
    enclaveUrl.pathname = enclavePath;

    console.log('[Service Binding] Forwarding to:', enclavePath);
    return env.ENCLAVE.fetch(enclaveUrl.toString(), {
      method: request.method,
      headers: request.headers,
      body: request.body,
    });
  }

  // Get OTP Status
  if (url.pathname === '/api/auth/otp-status' && request.method === 'POST') {
    const body = await request.json() as { email: string };

    try {
      const key = `otp:${body.email}`;
      const storedData = await env.OTP_STORE.get(key);

      if (!storedData) {
        return Response.json({
          validated: false,
          canSend: true,
          remainingSeconds: 0,
        });
      }

      const data = JSON.parse(storedData);
      const now = Date.now();

      // Calculate rate limit
      const timeSinceLastSent = now - (data.lastSentAt || 0);
      const rateLimitMs = 60 * 1000; // 1 minute
      const canSend = timeSinceLastSent >= rateLimitMs;
      const remainingSeconds = canSend ? 0 : Math.ceil((rateLimitMs - timeSinceLastSent) / 1000);

      return Response.json({
        validated: data.validated || false,
        canSend,
        remainingSeconds,
        expiresAt: data.expiresAt,
      });
    } catch (error) {
      console.error('[OTP] Status check error:', error);
      return Response.json(
        {
          success: false,
          error: error instanceof Error ? error.message : 'Status check failed',
        },
        { status: 500 }
      );
    }
  }

  // Send OTP Email Workflow
  if (url.pathname === '/api/auth/send-otp' && request.method === 'POST') {
    console.log('[Workflow] Starting OTPEmailWorkflow');
    const body = await request.json() as {
      email: string;
      username?: string;
      purpose?: 'registration' | 'login' | 'password-reset';
      expiresInMinutes?: number;
    };

    try {
      // Check rate limiting
      const key = `otp:${body.email}`;
      const storedData = await env.OTP_STORE.get(key);

      if (storedData) {
        const data = JSON.parse(storedData);
        const now = Date.now();
        const timeSinceLastSent = now - (data.lastSentAt || 0);
        const rateLimitMs = 60 * 1000; // 1 minute

        // Check if already validated
        if (data.validated) {
          return Response.json(
            {
              success: false,
              error: 'Email already verified',
            },
            { status: 400 }
          );
        }

        // Check rate limit
        if (timeSinceLastSent < rateLimitMs) {
          const remainingSeconds = Math.ceil((rateLimitMs - timeSinceLastSent) / 1000);
          return Response.json(
            {
              success: false,
              error: `Please wait ${remainingSeconds} seconds before requesting another code`,
              remainingSeconds,
            },
            { status: 429 }
          );
        }
      }

      const instance = await env.OTP_EMAIL_WORKFLOW.create({
        params: {
          email: body.email,
          username: body.username,
          purpose: body.purpose || 'registration',
          expiresInMinutes: body.expiresInMinutes || 10,
        },
      });

      console.log('[Workflow] OTPEmailWorkflow instance created with ID:', instance.id);

      return Response.json({
        success: true,
        instanceId: instance.id,
        message: 'OTP email sent successfully',
      });
    } catch (error) {
      console.error('[Workflow] Failed to create OTPEmailWorkflow:', error);
      return Response.json(
        {
          success: false,
          error: error instanceof Error ? error.message : 'Failed to send OTP email',
        },
        { status: 500 }
      );
    }
  }

  // Validate OTP Code
  if (url.pathname === '/api/auth/verify-otp' && request.method === 'POST') {
    const body = await request.json() as { email: string; code: string };

    try {
      const key = `otp:${body.email}`;
      const storedData = await env.OTP_STORE.get(key);

      if (!storedData) {
        return Response.json(
          {
            success: false,
            error: 'OTP code expired or not found',
          },
          { status: 400 }
        );
      }

      const data = JSON.parse(storedData);

      // Check if already validated
      if (data.validated) {
        return Response.json({
          success: true,
          message: 'Email already verified',
          alreadyValidated: true,
        });
      }

      // Check if OTP is expired
      if (Date.now() > data.expiresAt) {
        await env.OTP_STORE.delete(key);
        return Response.json(
          {
            success: false,
            error: 'OTP code expired',
          },
          { status: 400 }
        );
      }

      // Verify the code
      if (body.code !== data.code) {
        return Response.json(
          {
            success: false,
            error: 'Invalid OTP code',
          },
          { status: 400 }
        );
      }

      // Valid OTP - mark as validated (keep in KV for status checking)
      data.validated = true;
      data.validatedAt = Date.now();

      // Store validated status for 24 hours
      await env.OTP_STORE.put(key, JSON.stringify(data), {
        expirationTtl: 24 * 60 * 60,
      });

      return Response.json({
        success: true,
        message: 'OTP verified successfully',
      });
    } catch (error) {
      console.error('[OTP] Verification error:', error);
      return Response.json(
        {
          success: false,
          error: error instanceof Error ? error.message : 'Verification failed',
        },
        { status: 500 }
      );
    }
  }

  return new Response("Not Found", { status: 404 });
}
