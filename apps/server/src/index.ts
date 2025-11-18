import { Elysia } from 'elysia';
import { cors } from '@elysiajs/cors';
import { priceRoutes } from './routes/prices';
import { chainRoutes } from './routes/chains';
import { websocketRoutes } from './routes/websocket';

/**
 * Motr Server - Elysia.js API for realtime data aggregation
 *
 * This server provides:
 * - Real-time price feeds from public APIs
 * - Chain API proxying with rate limiting
 * - WebSocket/SSE endpoints for live data
 * - KV-based caching for performance
 */

const app = new Elysia()
  .use(
    cors({
      origin: '*',
      methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
      allowedHeaders: ['Content-Type', 'Authorization'],
      credentials: true,
    })
  )

  // Health check
  .get('/health', () => ({
    status: 'ok',
    service: 'motr-server',
    environment: process.env.ENVIRONMENT || 'development',
    timestamp: new Date().toISOString(),
  }))

  // API routes
  .use(priceRoutes)
  .use(chainRoutes)
  .use(websocketRoutes)

  // Error handling
  .onError(({ code, error, set }) => {
    console.error(`[Error ${code}]`, error);

    set.status = code === 'NOT_FOUND' ? 404 : 500;

    return {
      error: code === 'NOT_FOUND' ? 'Not Found' : 'Internal Server Error',
      message:
        process.env.ENVIRONMENT === 'development' ? error.message : 'An unexpected error occurred',
      timestamp: new Date().toISOString(),
    };
  })

  .listen(8788, ({ hostname, port }) => {
    console.log(`🚀 Motr Server running at http://${hostname}:${port}`);
  });

export type App = typeof app;
