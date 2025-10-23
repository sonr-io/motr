/**
 * Motr Orchestrator Worker
 *
 * Central Cloudflare Worker that serves static assets for multiple frontend apps
 * and routes requests based on session state, subdomain, and path.
 *
 * Architecture:
 * - Serves static Vite builds from multiple frontend apps
 * - Routes based on subdomain (console.sonr.id, profile.sonr.id, etc.)
 * - Routes based on path (/console, /profile, /search)
 * - Routes based on session state for authenticated users
 */

export interface Env {
  // Service binding to Enclave
  ENCLAVE: Fetcher;

  // KV namespaces
  SESSIONS: KVNamespace;
  OTP_STORE: KVNamespace;
  CHAIN_REGISTRY: KVNamespace;
  ASSET_REGISTRY: KVNamespace;

  // Environment variables
  ENVIRONMENT: string;
  EMAIL_FROM?: string;
  RESEND_API_KEY?: string;
}

interface SessionData {
  userId?: string;
  username?: string;
  authenticated: boolean;
  createdAt: number;
  lastActivityAt: number;
  preferences?: {
    defaultApp?: 'console' | 'profile' | 'search';
  };
}

export default {
  async fetch(
    request: Request,
    env: Env,
    ctx: ExecutionContext,
  ): Promise<Response> {
    const url = new URL(request.url);
    console.log(`[Orchestrator] ${request.method} ${url.hostname}${url.pathname}`);

    // Health check endpoint
    if (url.pathname === '/health') {
      return Response.json({
        status: 'ok',
        service: 'motr-orchestrator',
        environment: env.ENVIRONMENT,
        timestamp: new Date().toISOString(),
      });
    }

    // API routes
    if (url.pathname.startsWith('/api/')) {
      return handleApiRequest(request, env, ctx);
    }

    // Get session from cookie
    const session = await getSession(request, env);
    console.log(`[Orchestrator] Session: authenticated=${session.authenticated}, userId=${session.userId}`);

    // Determine which frontend to serve based on routing logic
    const targetApp = determineTargetApp(url, session);
    console.log(`[Orchestrator] Routing to: ${targetApp}`);

    // In production, this would serve the appropriate static assets
    // For now, return a simple response
    return new Response(`Routing to ${targetApp} app`, {
      headers: {
        'Content-Type': 'text/plain',
        'X-Target-App': targetApp,
      },
    });
  },
} satisfies ExportedHandler<Env>;

/**
 * Determine which frontend app to serve based on request
 */
function determineTargetApp(
  url: URL,
  session: SessionData,
): 'auth' | 'console' | 'profile' | 'search' {
  const subdomain = url.hostname.split('.')[0];

  // Subdomain routing (highest priority)
  if (subdomain === 'console') {
    return 'console';
  }

  if (subdomain === 'profile') {
    return 'profile';
  }

  if (subdomain === 'search') {
    return 'search';
  }

  // Path-based routing
  if (url.pathname.startsWith('/console')) {
    return 'console';
  }

  if (url.pathname.startsWith('/profile')) {
    return 'profile';
  }

  if (url.pathname.startsWith('/search')) {
    return 'search';
  }

  // Session-based routing for authenticated users
  if (session.authenticated) {
    const defaultApp = session.preferences?.defaultApp;

    if (defaultApp === 'console') {
      return 'console';
    }

    if (defaultApp === 'profile') {
      return 'profile';
    }

    if (defaultApp === 'search') {
      return 'search';
    }

    // Default to console for authenticated users
    return 'console';
  }

  // Default: auth app for unauthenticated users
  return 'auth';
}

/**
 * Get or create session from request
 */
async function getSession(request: Request, env: Env): Promise<SessionData> {
  const cookieHeader = request.headers.get('Cookie');

  if (!cookieHeader) {
    return createNewSession();
  }

  // Parse session ID from cookie
  const sessionIdMatch = cookieHeader.match(/session_id=([^;]+)/);
  if (!sessionIdMatch) {
    return createNewSession();
  }

  const sessionId = sessionIdMatch[1];
  const sessionData = await env.SESSIONS.get(sessionId, 'json') as SessionData | null;

  if (!sessionData) {
    return createNewSession();
  }

  // Check if session is expired (24 hours)
  const now = Date.now();
  const sessionAge = now - sessionData.createdAt;
  const maxAge = 24 * 60 * 60 * 1000; // 24 hours

  if (sessionAge > maxAge) {
    return createNewSession();
  }

  // Update last activity
  sessionData.lastActivityAt = now;

  return sessionData;
}

/**
 * Create a new session
 */
function createNewSession(): SessionData {
  return {
    authenticated: false,
    createdAt: Date.now(),
    lastActivityAt: Date.now(),
  };
}

/**
 * Handle API requests
 */
async function handleApiRequest(
  request: Request,
  env: Env,
  ctx: ExecutionContext,
): Promise<Response> {
  const url = new URL(request.url);

  // Session API endpoints
  if (url.pathname.startsWith('/api/session')) {
    return handleSessionAPI(request, env);
  }

  // Forward to enclave for identity-related requests
  if (url.pathname.startsWith('/api/identity/')) {
    return env.ENCLAVE.fetch(request);
  }

  return new Response('Not Found', { status: 404 });
}

/**
 * Session management API endpoints
 */
async function handleSessionAPI(
  request: Request,
  env: Env,
): Promise<Response> {
  const url = new URL(request.url);
  const session = await getSession(request, env);

  // Get session info
  if (url.pathname === '/api/session' && request.method === 'GET') {
    return Response.json({
      authenticated: session.authenticated,
      userId: session.userId,
      username: session.username,
      preferences: session.preferences,
    });
  }

  // Update session preferences
  if (url.pathname === '/api/session/preferences' && request.method === 'POST') {
    const body = await request.json() as { defaultApp?: 'console' | 'profile' | 'search' };

    session.preferences = {
      ...session.preferences,
      ...body,
    };

    // Store updated session
    const sessionId = crypto.randomUUID();
    await env.SESSIONS.put(sessionId, JSON.stringify(session), {
      expirationTtl: 24 * 60 * 60, // 24 hours
    });

    return Response.json({
      success: true,
      preferences: session.preferences,
    });
  }

  // Logout
  if (url.pathname === '/api/session/logout' && request.method === 'POST') {
    const cookieHeader = request.headers.get('Cookie');
    const sessionIdMatch = cookieHeader?.match(/session_id=([^;]+)/);

    if (sessionIdMatch) {
      await env.SESSIONS.delete(sessionIdMatch[1]);
    }

    return Response.json({ success: true });
  }

  return new Response('Not Found', { status: 404 });
}
