/**
 * SvelteKit Server Hooks
 * Handle server-side request processing
 */

import type { Handle } from '@sveltejs/kit';
import { dev } from '$app/environment';

/**
 * API Proxy Handler
 * In development, proxy /api/* requests to the API worker
 * This avoids CORS issues during development
 */
const apiProxyHandle: Handle = async ({ event, resolve }) => {
	const { pathname } = event.url;

	// Only proxy in development
	if (dev && pathname.startsWith('/api/')) {
		const apiUrl = `http://localhost:5165${pathname}${event.url.search}`;

		try {
			const response = await fetch(apiUrl, {
				method: event.request.method,
				headers: event.request.headers,
				body: event.request.body,
				duplex: 'half',
			} as RequestInit);

			// Clone the response to read it
			const clonedResponse = response.clone();
			const contentType = response.headers.get('content-type');

			// If JSON, parse and return
			if (contentType?.includes('application/json')) {
				const data = await clonedResponse.json();
				return new Response(JSON.stringify(data), {
					status: response.status,
					statusText: response.statusText,
					headers: response.headers,
				});
			}

			// Otherwise return as-is
			return response;
		} catch (error) {
			console.error('[API Proxy Error]', error);
			return new Response(
				JSON.stringify({
					error: 'API Proxy Error',
					message: error instanceof Error ? error.message : 'Failed to proxy request',
				}),
				{
					status: 503,
					headers: {
						'Content-Type': 'application/json',
					},
				}
			);
		}
	}

	// Not an API request, continue normally
	return resolve(event);
};

/**
 * Session Cookie Handler
 * Ensure session cookies are properly set
 */
const sessionHandle: Handle = async ({ event, resolve }) => {
	// You can add session management logic here
	// For now, just pass through
	return resolve(event);
};

/**
 * Combine all handlers
 * Handlers are executed in order
 */
export const handle: Handle = async ({ event, resolve }) => {
	// Execute API proxy handler first
	return apiProxyHandle({ event, resolve });
};
