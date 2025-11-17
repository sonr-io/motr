/**
 * Session Routes
 * User session management
 */

import { Hono, Context } from 'hono';
import { getCookie, setCookie, deleteCookie } from 'hono/cookie';
import type { Bindings, Variables, SessionData } from '../types';
import { validateBody, sessionAuthSchema } from '../middleware/validation';
import { rateLimit, RATE_LIMITS } from '../middleware/ratelimit';

const session = new Hono<{ Bindings: Bindings; Variables: Variables }>();

const SESSION_CONFIG = {
  MAX_AGE: 24 * 60 * 60, // 24 hours in seconds
  MAX_AGE_MS: 24 * 60 * 60 * 1000, // 24 hours in milliseconds
  COOKIE_NAME: 'session_id',
} as const;

/**
 * GET /session - Get current session
 */
session.get('/', async (c) => {
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
  });
});

/**
 * POST /session/logout - Logout and destroy session
 */
session.post('/logout', async (c) => {
  const sessionId = getCookie(c, SESSION_CONFIG.COOKIE_NAME);

  if (sessionId) {
    await c.env.SESSIONS.delete(sessionId);
  }

  deleteCookie(c, SESSION_CONFIG.COOKIE_NAME, {
    path: '/',
  });

  return c.json({ success: true });
});

/**
 * POST /session/authenticate - Authenticate session with user data
 */
session.post(
  '/authenticate',
  rateLimit(RATE_LIMITS.SESSION_AUTH),
  validateBody(sessionAuthSchema),
  async (c) => {
    try {
      const { session, sessionId } = await getSession(c);
      const body = c.get('validatedBody') as { userId: string; username: string };

      // Update session with authentication
      session.authenticated = true;
      session.userId = body.userId;
      session.username = body.username;
      session.lastActivityAt = Date.now();

      await c.env.SESSIONS.put(sessionId, JSON.stringify(session), {
        expirationTtl: SESSION_CONFIG.MAX_AGE,
      });

      return c.json({
        success: true,
        session: {
          authenticated: session.authenticated,
          userId: session.userId,
          username: session.username,
        },
      });
    } catch (error) {
      console.error('[Session Authentication Error]', error);
      return c.json({ error: 'Failed to authenticate session' }, 500);
    }
  }
);

/**
 * Get or create session from request
 */
async function getSession(
  c: Context<{ Bindings: Bindings; Variables: Variables }>
): Promise<{ session: SessionData; sessionId: string }> {
  const sessionId = getCookie(c, SESSION_CONFIG.COOKIE_NAME);

  // No session cookie - create new session
  if (!sessionId) {
    const newSessionId = crypto.randomUUID();
    const session = createNewSession();

    await c.env.SESSIONS.put(newSessionId, JSON.stringify(session), {
      expirationTtl: SESSION_CONFIG.MAX_AGE,
    });

    return { session, sessionId: newSessionId };
  }

  // Try to retrieve existing session
  const sessionData = (await c.env.SESSIONS.get(sessionId, 'json')) as SessionData | null;

  // Session not found - create new
  if (!sessionData) {
    const newSessionId = crypto.randomUUID();
    const session = createNewSession();

    await c.env.SESSIONS.put(newSessionId, JSON.stringify(session), {
      expirationTtl: SESSION_CONFIG.MAX_AGE,
    });

    return { session, sessionId: newSessionId };
  }

  // Check if session expired
  const now = Date.now();
  const sessionAge = now - sessionData.createdAt;

  if (sessionAge > SESSION_CONFIG.MAX_AGE_MS) {
    await c.env.SESSIONS.delete(sessionId);
    const newSessionId = crypto.randomUUID();
    const session = createNewSession();

    await c.env.SESSIONS.put(newSessionId, JSON.stringify(session), {
      expirationTtl: SESSION_CONFIG.MAX_AGE,
    });

    return { session, sessionId: newSessionId };
  }

  // Update last activity
  sessionData.lastActivityAt = now;

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

export default session;
