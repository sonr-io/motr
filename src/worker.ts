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
import { serveStatic } from 'hono/cloudflare-workers';
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
    defaultApp?: 'console' | 'profile' | 'search';
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

/**
 * Target app types
 */
type TargetApp = 'auth' | 'console' | 'profile' | 'search';

/**
 * Static asset configuration
 */
const STATIC_ASSET_CONFIG = {
  auth: { root: './auth', path: '/auth' },
  console: { root: './console', path: '/console' },
  profile: { root: './profile', path: '/profile' },
  search: { root: './search', path: '/search' },
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

// Static asset serving for each app using configuration
Object.entries(STATIC_ASSET_CONFIG).forEach(([appName, config]) => {
  app.use(
    `${config.path}/*`,
    serveStatic({
      root: config.root,
      rewriteRequestPath: (path) => path.replace(new RegExp(`^${config.path}`), ''),
    })
  );
});

// Root route - smart routing based on session and subdomain
app.get('/', async (c) => {
  const { session, sessionId } = await getSession(c);
  const url = new URL(c.req.url);
  const targetApp = determineTargetApp(url, session);

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

  return c.redirect(`/${targetApp}/`);
});

// Catch-all for SPA routing - serve index.html from appropriate app
app.get('*', serveStatic({ root: './' }));

// 404 handler - if static files are not found
app.notFound((c) => {
  return c.json(
    {
      error: 'Not Found',
      message: 'The requested resource was not found',
      path: c.req.path,
      timestamp: new Date().toISOString(),
    },
    404
  );
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
    const body = await c.req.json<{ defaultApp?: 'console' | 'profile' | 'search' }>();

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
 * Determine which frontend app to serve based on request
 */
function determineTargetApp(url: URL, session: SessionData): TargetApp {
  const subdomain = url.hostname.split('.')[0];

  // Subdomain routing (highest priority)
  if (subdomain === 'console') return 'console';
  if (subdomain === 'profile') return 'profile';
  if (subdomain === 'search') return 'search';

  // Path-based routing
  if (url.pathname.startsWith('/console')) return 'console';
  if (url.pathname.startsWith('/profile')) return 'profile';
  if (url.pathname.startsWith('/search')) return 'search';

  // Session-based routing for authenticated users
  if (session.authenticated) {
    const defaultApp = session.preferences?.defaultApp;
    if (defaultApp) return defaultApp;
    // Default to console for authenticated users
    return 'console';
  }

  // Default: auth app for unauthenticated users
  return 'auth';
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
  };
}

/**
 * Export the Hono app as the default export
 *
 * This works with Cloudflare Workers because Hono apps implement the
 * Workers' fetch handler interface. When a request comes in, the Workers
 * runtime calls app.fetch(request, env, ctx).
 *
 * This is compatible with the modern ES Modules Workers format:
 * export default {
 *   async fetch(request: Request, env: Env, ctx: ExecutionContext) {
 *     return new Response('Hello World');
 *   }
 * }
 */
export default app;
