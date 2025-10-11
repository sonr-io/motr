/**
 * Vite plugin module for @sonr.io/es
 *
 * Provides integration with Vite for WASM loading, enclave support, and ES optimization.
 *
 * @example
 * ```ts
 * import { esPlugin } from '@sonr.io/es/vite'
 *
 * export default defineConfig({
 *   plugins: [
 *     // ... other plugins
 *     ...esPlugin(), // Spread the plugin array
 *   ],
 * })
 * ```
 */
export * from './plugin';
