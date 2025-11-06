/**
 * Sonr API Worker
 *
 * Backend API for Sonr applications providing:
 * - Session management
 * - Identity operations (forwarded to Enclave)
 * - Chain and asset registry queries
 * - OTP generation and verification
 *
 * Built with Hono framework on Cloudflare Workers
 */

import { Hono } from 'hono';
import { logger } from 'hono/logger';
import { cors } from 'hono/cors';
import type { Bindings } from './types';
import sessionRoutes from './routes/session';
import registryRoutes from './routes/registry';
import otpRoutes from './routes/otp';

const app = new Hono<{ Bindings: Bindings }>();

// Global middleware
app.use('*', logger());

// CORS middleware - allow all origins for API access
app.use(
  '*',
  cors({
    origin: '*',
    allowHeaders: ['Content-Type', 'Authorization', 'X-Requested-With'],
    allowMethods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
    exposeHeaders: ['Content-Length', 'X-Request-Id'],
    maxAge: 86400, // 24 hours
    credentials: true,
  })
);

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

// Health check endpoint
app.get('/health', (c) => {
  return c.json({
    status: 'ok',
    service: 'sonr-api',
    environment: c.env.ENVIRONMENT || 'development',
    timestamp: new Date().toISOString(),
  });
});

// API Routes
const api = new Hono<{ Bindings: Bindings }>();

// Mount route modules
api.route('/session', sessionRoutes);
api.route('/registry', registryRoutes);
api.route('/otp', otpRoutes);

// Identity Operations (Enclave Proxy)
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

app.route('/api', api);

// 404 handler
app.notFound((c) => {
  return c.json(
    {
      error: 'Not Found',
      message: 'The requested endpoint does not exist',
      path: c.req.path,
    },
    404
  );
});

/**
 * Export Hono app as default
 */
export default app;
