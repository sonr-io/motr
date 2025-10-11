import { type EnclavePluginOptions, enclavePlugin } from '@sonr.io/enclave';
import { type VaultPluginOptions, vaultPlugin } from '@sonr.io/vault/vite-plugin';
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
   * Whether to enable the vault plugin (default: true)
   */
  enableVault?: boolean;
  /**
   * Vault plugin options
   */
  vaultOptions?: VaultPluginOptions;
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
 * Returns an array of plugins for proper Vite integration.
 *
 * @example
 * ```ts
 * import { esPlugin } from '@sonr.io/es/vite';
 *
 * export default defineConfig({
 *   plugins: [...esPlugin()],
 * });
 * ```
 */
export function esPlugin(options: ESPluginOptions = {}): Plugin[] {
  const {
    enableEnclave = true,
    enableVault = true,
    vaultOptions = {},
    excludeFromOptimize = true,
    configureWorkers = true,
    configureWasm = true,
    ...enclaveOptions
  } = options;

  const plugins: Plugin[] = [];

  // Add enclave plugin first if enabled
  if (enableEnclave) {
    plugins.push(enclavePlugin(enclaveOptions));
  }

  // Add vault plugin if enabled
  if (enableVault) {
    plugins.push(vaultPlugin(vaultOptions));
  }

  // Add ES-specific configuration plugin
  plugins.push({
    name: 'vite-plugin-sonr-es',
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
  });

  return plugins;
}

// Default export for convenience
export default esPlugin;
