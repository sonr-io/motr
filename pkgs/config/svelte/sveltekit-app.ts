import { resolve } from 'node:path';
import { sveltekit } from '@sveltejs/kit/vite';
import { type UserConfig, defineConfig } from 'vite';
import { createMonoRepoAliases } from '../vite/aliases.ts';

/**
 * Base Vite configuration for SvelteKit applications
 *
 * @param options - Configuration options
 * @param options.root - Project root directory (default: process.cwd())
 * @param options.port - Dev server port (default: 5173)
 * @param options.plugins - Additional Vite plugins to include
 * @param options.alias - Additional path aliases
 * @param options.server - Server configuration overrides
 * @returns Vite UserConfig
 */
export function createSvelteKitAppConfig(options: {
	root?: string;
	port?: number;
	plugins?: UserConfig['plugins'];
	alias?: Record<string, string>;
	server?: UserConfig['server'];
} = {}): UserConfig {
	const root = options.root || process.cwd();

	return defineConfig({
		plugins: [sveltekit(), ...(options.plugins || [])],
		resolve: {
			alias: {
				$lib: resolve(root, './src/lib'),
				...createMonoRepoAliases(),
				...options.alias,
			},
		},
		server: {
			port: options.port || 5173,
			strictPort: false,
			...options.server,
		},
		build: {
			target: 'esnext',
		},
		optimizeDeps: {
			exclude: ['@sonr.io/enclave', '@sonr.io/vault'],
		},
	});
}

export default createSvelteKitAppConfig;
