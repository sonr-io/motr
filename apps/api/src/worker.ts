/**
 * Motr Orchestrator Worker
 *
 * Central Cloudflare Worker that serves static Vite builds for multiple frontend apps
 * and routes requests based on session state, subdomain, and path using Hono framework.
 *
 * Architecture:
 * - Uses Hono for clean routing and middleware
 * - Serves static Vite builds bundled as worker assets
 * - Routes based on subdomain (console.sonr.id, profile.sonr.id, etc.)
 * - Routes based on path (/console, /profile, /search)
 * - Routes based on session state for authenticated users
 */

import { Hono, Context } from 'hono';
import { logger } from 'hono/logger';
import { etag } from 'hono/etag';
import { cors } from 'hono/cors';
import { getCookie, setCookie, deleteCookie } from 'hono/cookie';

/**
 * Cloudflare Worker Bindings
 * These are injected by the Cloudflare Workers runtime
 */
type Bindings = {
  // Service binding to Enclave worker
  ENCLAVE: Fetcher;

  // KV namespaces for various data stores
  SESSIONS: KVNamespace;
  OTP_STORE: KVNamespace;
  CHAIN_REGISTRY: KVNamespace;
  ASSET_REGISTRY: KVNamespace;

  // Environment variables
  ENVIRONMENT: 'development' | 'staging' | 'production';
  EMAIL_FROM?: string;
  RESEND_API_KEY?: string;
};

/**
 * Session data structure
 */
interface SessionData {
  userId?: string;
  username?: string;
  authenticated: boolean;
  createdAt: number;
  lastActivityAt: number;
  preferences?: {
    [key: string]: any;
  };
  auth?: {
    hasVisitedBefore: boolean;
    hasAccount: boolean;
    lastAuthPage?: 'register' | 'login';
    registrationStartedAt?: number;
  };
}

/**
 * Session configuration constants
 */
const SESSION_CONFIG = {
  MAX_AGE: 24 * 60 * 60, // 24 hours in seconds
  MAX_AGE_MS: 24 * 60 * 60 * 1000, // 24 hours in milliseconds
  COOKIE_NAME: 'session_id',
} as const;

const app = new Hono<{ Bindings: Bindings }>();

// Global middleware
app.use('*', logger());
app.use('*', etag());

// Error handling middleware
app.onError((err, c) => {
  console.error(`[Error] ${err.message}`, err);
  return c.json(
    {
      error: 'Internal Server Error',
      message: c.env.ENVIRONMENT === 'development' ? err.message : 'An unexpected error occurred',
      timestamp: new Date().toISOString(),
    },
    500
  );
});

// CORS middleware for API routes
app.use(
  '/api/*',
  cors({
    origin: '*',
    allowHeaders: ['Content-Type', 'Authorization'],
    allowMethods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
    exposeHeaders: ['Content-Length'],
    maxAge: 600,
    credentials: true,
  })
);

// Health check endpoint
app.get('/health', (c) => {
  return c.json({
    status: 'ok',
    service: 'motr-orchestrator',
    environment: c.env.ENVIRONMENT,
    timestamp: new Date().toISOString(),
  });
});

// API Routes
app.route('/api', createApiRoutes());

// Shared vendor chunks - served with aggressive caching
app.get('/shared/*', async (c) => {
  // These chunks are content-hashed, so they can be cached forever
  c.header('Cache-Control', 'public, max-age=31536000, immutable');
  // Request will be served by Wrangler's [assets] from public/shared/
  return c.notFound();
});

// Asset routing middleware - redirects /assets/* to web app
app.get('/assets/*', async (c) => {
  // All assets now belong to the consolidated web app
  const assetPath = c.req.path.replace('/assets', '');
  return c.redirect(`/web/assets${assetPath}`);
});

// Service worker and WASM files - serve from web app
app.get('/sw.js', async (c) => {
  return c.redirect('/web/sw.js');
});

app.get('/wasm_exec.js', async (c) => {
  return c.redirect('/web/wasm_exec.js');
});

app.get('/vault.wasm', async (c) => {
  return c.redirect('/web/vault.wasm');
});

app.get('/enclave.wasm', async (c) => {
  return c.redirect('/web/enclave.wasm');
});

// Root route - serve the consolidated web app
app.get('/', async (c) => {
  const { sessionId } = await getSession(c);

  // Set session cookie if new session was created
  if (!getCookie(c, SESSION_CONFIG.COOKIE_NAME)) {
    setCookie(c, SESSION_CONFIG.COOKIE_NAME, sessionId, {
      httpOnly: true,
      secure: c.env.ENVIRONMENT === 'production',
      sameSite: 'Lax',
      maxAge: SESSION_CONFIG.MAX_AGE,
      path: '/',
    });
  }

  // Always serve the web app - it handles routing internally
  return c.redirect('/web/');
});

/**
 * SPA fallback handler
 * Wrangler's asset handler will try to serve files first.
 * If a route doesn't match a file, we catch it here and serve the web app's index.html
 * This enables SPA routing for the consolidated web app.
 */
app.notFound(async (c) => {
  const path = c.req.path;

  // If path starts with /web/, serve the web app's index.html for SPA routing
  if (path.startsWith('/web/')) {
    return c.redirect('/web/index.html');
  }

  // For other 404s, return standard 404
  return c.json({ error: 'Not Found', path }, 404);
});

/**
 * Create API routes
 */
function createApiRoutes() {
  const api = new Hono<{ Bindings: Bindings }>();

  // Session API
  api.get('/session', async (c) => {
    const { session, sessionId } = await getSession(c);

    // Set cookie if new session
    if (!getCookie(c, SESSION_CONFIG.COOKIE_NAME)) {
      setCookie(c, SESSION_CONFIG.COOKIE_NAME, sessionId, {
        httpOnly: true,
        secure: c.env.ENVIRONMENT === 'production',
        sameSite: 'Lax',
        maxAge: SESSION_CONFIG.MAX_AGE,
        path: '/',
      });
    }

    return c.json({
      authenticated: session.authenticated,
      userId: session.userId,
      username: session.username,
      preferences: session.preferences,
    });
  });

  api.post('/session/preferences', async (c) => {
    const { session, sessionId } = await getSession(c);
    const body = await c.req.json<{ [key: string]: any }>();

    // Update session with new preferences
    session.preferences = {
      ...session.preferences,
      ...body,
    };
    session.lastActivityAt = Date.now();

    // Store updated session
    await c.env.SESSIONS.put(sessionId, JSON.stringify(session), {
      expirationTtl: SESSION_CONFIG.MAX_AGE,
    });

    return c.json({
      success: true,
      preferences: session.preferences,
    });
  });

  api.post('/session/logout', async (c) => {
    const sessionId = getCookie(c, SESSION_CONFIG.COOKIE_NAME);

    if (sessionId) {
      // Delete session from KV
      await c.env.SESSIONS.delete(sessionId);
    }

    // Delete session cookie
    deleteCookie(c, SESSION_CONFIG.COOKIE_NAME, {
      path: '/',
    });

    return c.json({ success: true });
  });

  // Auth state tracking - track page visits
  api.post('/session/auth/visit', async (c) => {
    const { session, sessionId } = await getSession(c);
    const body = await c.req.json<{ page: 'register' | 'login' }>();

    // Update session auth state
    session.auth = {
      ...session.auth,
      hasVisitedBefore: true,
      hasAccount: session.auth?.hasAccount ?? false,
      lastAuthPage: body.page,
    };
    session.lastActivityAt = Date.now();

    // Store updated session
    await c.env.SESSIONS.put(sessionId, JSON.stringify(session), {
      expirationTtl: SESSION_CONFIG.MAX_AGE,
    });

    return c.json({ success: true });
  });

  // Auth state tracking - registration started
  api.post('/session/auth/registration-started', async (c) => {
    const { session, sessionId } = await getSession(c);

    // Update session auth state
    session.auth = {
      ...session.auth,
      hasVisitedBefore: true,
      hasAccount: false,
      lastAuthPage: 'register',
      registrationStartedAt: Date.now(),
    };
    session.lastActivityAt = Date.now();

    // Store updated session
    await c.env.SESSIONS.put(sessionId, JSON.stringify(session), {
      expirationTtl: SESSION_CONFIG.MAX_AGE,
    });

    return c.json({ success: true });
  });

  // Auth state tracking - registration completed
  api.post('/session/auth/registration-completed', async (c) => {
    const { session, sessionId } = await getSession(c);

    // Update session auth state
    session.auth = {
      ...session.auth,
      hasVisitedBefore: true,
      hasAccount: true,
      lastAuthPage: 'register',
      registrationStartedAt: undefined,
    };
    session.lastActivityAt = Date.now();

    // Store updated session
    await c.env.SESSIONS.put(sessionId, JSON.stringify(session), {
      expirationTtl: SESSION_CONFIG.MAX_AGE,
    });

    return c.json({ success: true });
  });

  // Identity API - forward to Enclave worker
  api.all('/identity/*', async (c) => {
    try {
      const response = await c.env.ENCLAVE.fetch(c.req.raw);
      return response;
    } catch (error) {
      console.error('[Identity API Error]', error);
      return c.json(
        {
          error: 'Identity Service Error',
          message: 'Failed to communicate with identity service',
        },
        503
      );
    }
  });

  return api;
}

/**
 * Get or create session from request
 * Returns both session data and session ID for cookie management
 */
async function getSession(
  c: Context<{ Bindings: Bindings }>
): Promise<{ session: SessionData; sessionId: string }> {
  const sessionId = getCookie(c, SESSION_CONFIG.COOKIE_NAME);

  // No session cookie - create new session
  if (!sessionId) {
    const newSessionId = crypto.randomUUID();
    const session = createNewSession();

    // Store new session in KV
    await c.env.SESSIONS.put(newSessionId, JSON.stringify(session), {
      expirationTtl: SESSION_CONFIG.MAX_AGE,
    });

    return { session, sessionId: newSessionId };
  }

  // Try to retrieve existing session
  const sessionData = (await c.env.SESSIONS.get(sessionId, 'json')) as SessionData | null;

  // Session not found in KV - create new session
  if (!sessionData) {
    const newSessionId = crypto.randomUUID();
    const session = createNewSession();

    await c.env.SESSIONS.put(newSessionId, JSON.stringify(session), {
      expirationTtl: SESSION_CONFIG.MAX_AGE,
    });

    return { session, sessionId: newSessionId };
  }

  // Check if session is expired
  const now = Date.now();
  const sessionAge = now - sessionData.createdAt;

  if (sessionAge > SESSION_CONFIG.MAX_AGE_MS) {
    // Session expired - delete and create new
    await c.env.SESSIONS.delete(sessionId);
    const newSessionId = crypto.randomUUID();
    const session = createNewSession();

    await c.env.SESSIONS.put(newSessionId, JSON.stringify(session), {
      expirationTtl: SESSION_CONFIG.MAX_AGE,
    });

    return { session, sessionId: newSessionId };
  }

  // Update last activity timestamp
  sessionData.lastActivityAt = now;

  // Update session in KV
  await c.env.SESSIONS.put(sessionId, JSON.stringify(sessionData), {
    expirationTtl: SESSION_CONFIG.MAX_AGE,
  });

  return { session: sessionData, sessionId };
}

/**
 * Create a new session
 */
function createNewSession(): SessionData {
  return {
    authenticated: false,
    createdAt: Date.now(),
    lastActivityAt: Date.now(),
    auth: {
      hasVisitedBefore: false,
      hasAccount: false,
    },
  };
}

/**
 * Export the Hono app as the default export
 *
 * This works with Cloudflare Workers because Hono apps implement the
 * Workers' fetch handler interface. When a request comes in, the Workers
 * runtime calls app.fetch(request, env, ctx).
 *
 * When used with Wrangler's [assets], any unmatched routes will automatically
 * fall through to the asset handler which serves files from public/.
 *
 * For SPA routes (like /auth/register), Wrangler's asset handler will
 * serve the index.html if the exact path doesn't exist.
 */
export default app;
