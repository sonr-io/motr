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

export interface Env {
	// Assets binding for serving static files
	ASSETS: Fetcher;

	// Environment variables
	ENVIRONMENT: string;

	// Add your Cloudflare bindings here:
	// MY_KV: KVNamespace;
	// MY_BUCKET: R2Bucket;
	// MY_DURABLE_OBJECT: DurableObjectNamespace;
	// AI: Ai;
}

export default {
	async fetch(request: Request, env: Env, _ctx: ExecutionContext): Promise<Response> {
		const url = new URL(request.url);

		// API routes - add your custom API handlers here
		if (url.pathname.startsWith('/api/')) {
			return handleApiRequest(request, env, ctx);
		}

		// Health check endpoint
		if (url.pathname === '/health') {
			return new Response(JSON.stringify({
				status: 'ok',
				environment: env.ENVIRONMENT,
				timestamp: new Date().toISOString()
			}), {
				headers: { 'Content-Type': 'application/json' }
			});
		}

		// Serve static assets from the ASSETS binding
		// This automatically handles SPA routing with not_found_handling = "single-page-application"
		try {
			return await env.ASSETS.fetch(request);
		} catch (error) {
			console.error('Error serving asset:', error);
			return new Response('Internal Server Error', { status: 500 });
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
	_ctx: ExecutionContext
): Promise<Response> {
	const url = new URL(request.url);

	// Example API endpoint
	if (url.pathname === '/api/version') {
		return Response.json({
			version: '1.0.0',
			environment: env.ENVIRONMENT,
		});
	}

	// Example: Access Cloudflare features
	// if (url.pathname === '/api/kv-example' && env.MY_KV) {
	//   const value = await env.MY_KV.get('key');
	//   return Response.json({ value });
	// }

	return new Response('Not Found', { status: 404 });
}
