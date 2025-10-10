import { type EnclavePluginOptions, enclavePlugin } from '@sonr.io/enclave';
import type { Plugin, UserConfig } from 'vite';

/**
 * Options for the ES package Vite plugin
 */
export interface ESPluginOptions extends EnclavePluginOptions {
  /**
   * Whether to enable the enclave plugin (default: true)
   */
  enableEnclave?: boolean;
  /**
   * Whether to exclude @sonr.io/es from Vite optimization (recommended)
   * This prevents bundling issues with protobuf imports
   * Defaults to true
   */
  excludeFromOptimize?: boolean;
  /**
   * Whether to configure worker handling
   * Defaults to true
   */
  configureWorkers?: boolean;
  /**
   * Whether to configure WASM handling
   * Defaults to true
   */
  configureWasm?: boolean;
}

/**
 * Vite plugin for @sonr.io/es that configures WASM loading, workers, and optimization
 *
 * @example
 * ```ts
 * import { esPlugin } from '@sonr.io/es/vite-plugin';
 *
 * export default defineConfig({
 *   plugins: [esPlugin()],
 * });
 * ```
 */
export function esPlugin(options: ESPluginOptions = {}): Plugin {
  const {
    enableEnclave = true,
    excludeFromOptimize = true,
    configureWorkers = true,
    configureWasm = true,
    ...enclaveOptions
  } = options;

  return {
    name: 'vite-plugin-sonr-es',

    // Apply enclave plugin if enabled
    ...(enableEnclave && enclavePlugin(enclaveOptions)),

    config(): UserConfig {
      return {
        // Configure optimization to avoid protobuf bundling issues
        ...(excludeFromOptimize && {
          optimizeDeps: {
            exclude: ['@sonr.io/es'],
          },
        }),

        // Configure worker handling for Motor WASM service workers
        ...(configureWorkers && {
          worker: {
            format: 'es' as const,
            plugins: () => [],
          },
        }),

        // Configure WASM and build settings
        ...(configureWasm && {
          build: {
            target: 'esnext',
            commonjsOptions: {
              include: [/node_modules/, /packages/],
            },
          },
          assetsInclude: ['**/*.wasm'],
        }),
      };
    },
  };
}

// Default export for convenience
export default esPlugin;
