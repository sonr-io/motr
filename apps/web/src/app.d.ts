// See https://svelte.dev/docs/kit/types#app.d.ts
// for information about these interfaces

import type { SessionData } from '$lib/api/session';

declare global {
	namespace App {
		/**
		 * Custom error type for API errors
		 */
		interface Error {
			message: string;
			code?: string;
			status?: number;
		}

		/**
		 * Server-side locals available in hooks and endpoints
		 */
		interface Locals {
			session?: SessionData;
			userId?: string;
		}

		/**
		 * Page data passed from server to client
		 */
		interface PageData {
			session?: SessionData;
		}

		// interface PageState {}

		/**
		 * Cloudflare platform bindings (if needed)
		 */
		interface Platform {
			env?: {
				ENCLAVE?: Fetcher;
				SESSIONS?: KVNamespace;
				OTP_STORE?: KVNamespace;
				CHAIN_REGISTRY?: KVNamespace;
				ASSET_REGISTRY?: KVNamespace;
			};
		}
	}
}

export {};
