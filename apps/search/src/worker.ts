/**
 * Cloudflare Worker for Sonr Search
 */

export interface Env {
  ASSETS: Fetcher;
  ENVIRONMENT?: string;
}

export default {
  async fetch(request: Request, env: Env): Promise<Response> {
    const url = new URL(request.url);

    // Health check endpoint
    if (url.pathname === '/api/health') {
      return Response.json({
        status: 'healthy',
        service: 'sonr-search',
        environment: env.ENVIRONMENT || 'development',
        timestamp: Date.now(),
      });
    }

    // Serve static assets
    return env.ASSETS.fetch(request);
  },
};
