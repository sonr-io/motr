/**
 * Vite plugin module for @sonr.io/sdk
 *
 * Provides integration with Vite for WASM loading, enclave support, and ES optimization.
 *
 * @example
 * ```ts
 * import { esPlugin } from '@sonr.io/sdk/vite'
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
