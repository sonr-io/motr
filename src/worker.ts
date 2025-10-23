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

import { Hono } from 'hono';
import { serveStatic } from 'hono/cloudflare-workers';
import { logger } from 'hono/logger';
import { etag } from 'hono/etag';
import { cors } from 'hono/cors';

type Bindings = {
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
};

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

const app = new Hono<{ Bindings: Bindings }>();

// Global middleware
app.use('*', logger());
app.use('*', etag());
app.use('/api/*', cors());

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

// Static asset serving for each app
app.use('/auth/*', serveStatic({ root: './auth', rewriteRequestPath: (path) => path.replace(/^\/auth/, '') }));
app.use('/console/*', serveStatic({ root: './console', rewriteRequestPath: (path) => path.replace(/^\/console/, '') }));
app.use('/profile/*', serveStatic({ root: './profile', rewriteRequestPath: (path) => path.replace(/^\/profile/, '') }));
app.use('/search/*', serveStatic({ root: './search', rewriteRequestPath: (path) => path.replace(/^\/search/, '') }));

// Root route - smart routing based on session and subdomain
app.get('/', async (c) => {
  const session = await getSession(c.req.raw, c.env);
  const url = new URL(c.req.url);
  const targetApp = determineTargetApp(url, session);

  return c.redirect(`/${targetApp}/`);
});

// Catch-all for SPA routing - serve index.html from appropriate app
app.get('*', serveStatic({ root: './' }));

/**
 * Create API routes
 */
function createApiRoutes() {
  const api = new Hono<{ Bindings: Bindings }>();

  // Session API
  api.get('/session', async (c) => {
    const session = await getSession(c.req.raw, c.env);
    return c.json({
      authenticated: session.authenticated,
      userId: session.userId,
      username: session.username,
      preferences: session.preferences,
    });
  });

  api.post('/session/preferences', async (c) => {
    const session = await getSession(c.req.raw, c.env);
    const body = await c.req.json<{ defaultApp?: 'console' | 'profile' | 'search' }>();

    session.preferences = {
      ...session.preferences,
      ...body,
    };

    // Store updated session
    const sessionId = crypto.randomUUID();
    await c.env.SESSIONS.put(sessionId, JSON.stringify(session), {
      expirationTtl: 24 * 60 * 60, // 24 hours
    });

    return c.json({
      success: true,
      preferences: session.preferences,
    });
  });

  api.post('/session/logout', async (c) => {
    const cookieHeader = c.req.header('Cookie');
    const sessionIdMatch = cookieHeader?.match(/session_id=([^;]+)/);

    if (sessionIdMatch) {
      await c.env.SESSIONS.delete(sessionIdMatch[1]);
    }

    return c.json({ success: true });
  });

  // Identity API - forward to Enclave worker
  api.all('/identity/*', async (c) => {
    return c.env.ENCLAVE.fetch(c.req.raw);
  });

  return api;
}

/**
 * Determine which frontend app to serve based on request
 */
function determineTargetApp(
  url: URL,
  session: SessionData,
): 'auth' | 'console' | 'profile' | 'search' {
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
 */
async function getSession(request: Request, env: Bindings): Promise<SessionData> {
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
  const sessionData = (await env.SESSIONS.get(sessionId, 'json')) as SessionData | null;

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

export default app;
