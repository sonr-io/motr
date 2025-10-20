/**
 * Vite Plugin for Enclave Package
 *
 * Modern Vite plugin for Web Worker and WASM integration following 2025 best practices.
 *
 * Features:
 * - Web Worker bundling with TypeScript support
 * - WASM module integration
 * - Development and production optimization
 * - CORS and security headers configuration
 * - Extism plugin support
 *
 * @see https://vitejs.dev/guide/features.html#web-workers
 */

import { existsSync, readFileSync } from 'node:fs';
import { dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import type { Plugin, ResolvedConfig } from 'vite';

export interface EnclavePluginOptions {
  /**
   * Path to the enclave.wasm file relative to the project root
   * @default 'dist/enclave.wasm'
   */
  wasmPath?: string;

  /**
   * Virtual module ID for the WASM URL
   * @default 'virtual:enclave-wasm'
   */
  virtualModuleId?: string;

  /**
   * Enable Web Worker support
   * @default true
   */
  enableWorker?: boolean;

  /**
   * Web Worker script path
   * @default 'src/worker.ts'
   */
  workerPath?: string;

  /**
   * Enable debug logging
   * @default false
   */
  debug?: boolean;

  /**
   * Copy WASM to public directory
   * @default true
   */
  copyToPublic?: boolean;

  /**
   * Enable Extism plugin support
   * @default true
   */
  enableExtism?: boolean;
}

export function enclavePlugin(options: EnclavePluginOptions = {}): Plugin {
  const {
    wasmPath = 'dist/enclave.wasm',
    virtualModuleId = 'virtual:enclave-wasm',
    enableWorker = true,
    workerPath = 'src/worker.ts',
    debug = false,
    copyToPublic = true,
    enableExtism = true,
  } = options;

  let _config: ResolvedConfig;
  const __dirname = dirname(fileURLToPath(import.meta.url));

  return {
    name: 'vite-plugin-enclave',

    config() {
      return {
        // Optimize dependencies
        optimizeDeps: {
          exclude: ['@sonr.io/enclave', '@extism/extism'],
          esbuildOptions: {
            target: 'esnext',
            supported: {
              'top-level-await': true,
            },
          },
        },

        // Worker configuration
        worker: {
          format: 'es',
          plugins: () => [],
          rollupOptions: {
            output: {
              format: 'es',
              entryFileNames: '[name].js',
            },
          },
        },

        // Build configuration
        build: {
          target: 'esnext',
          // Enable top-level await
          modulePreload: {
            polyfill: true,
          },
        },

        // Server configuration
        server: {
          headers: {
            'Cross-Origin-Embedder-Policy': 'require-corp',
            'Cross-Origin-Opener-Policy': 'same-origin',
          },
          fs: {
            allow: [resolve(__dirname, '..')],
          },
        },

        // Preview server configuration
        preview: {
          headers: {
            'Cross-Origin-Embedder-Policy': 'require-corp',
            'Cross-Origin-Opener-Policy': 'same-origin',
          },
        },
      };
    },

    configResolved(resolvedConfig) {
      _config = resolvedConfig;
    },

    buildStart() {
      if (debug) {
        console.log('[EnclavePlugin] Build started');
      }

      // Emit WASM file if it exists
      const absoluteWasmPath = resolve(process.cwd(), wasmPath);
      if (existsSync(absoluteWasmPath) && copyToPublic) {
        const wasmContent = readFileSync(absoluteWasmPath);
        this.emitFile({
          type: 'asset',
          fileName: 'enclave.wasm',
          source: wasmContent,
        });

        if (debug) {
          console.log('[EnclavePlugin] Emitted WASM file');
        }
      }
    },

    resolveId(id: string) {
      // Resolve virtual module for WASM URL
      if (id === virtualModuleId) {
        return id;
      }

      // Resolve worker imports
      if (enableWorker && id.includes('worker?worker')) {
        return id;
      }

      return null;
    },

    load(id: string) {
      // Load virtual WASM module
      if (id === virtualModuleId) {
        return `export default new URL('${wasmPath}', import.meta.url).href;`;
      }

      return null;
    },

    async generateBundle(_options, bundle) {
      if (debug) {
        console.log('[EnclavePlugin] Generating bundle');
      }

      // Ensure WASM file is in the bundle
      const absoluteWasmPath = resolve(process.cwd(), wasmPath);
      if (existsSync(absoluteWasmPath) && copyToPublic) {
        const wasmContent = readFileSync(absoluteWasmPath);

        // Check if already emitted
        const wasmFileName = 'enclave.wasm';
        if (!bundle[wasmFileName]) {
          this.emitFile({
            type: 'asset',
            fileName: wasmFileName,
            source: wasmContent,
          });
        }

        if (debug) {
          console.log('[EnclavePlugin] WASM file added to bundle');
        }
      }
    },

    transformIndexHtml(html) {
      // Inject Web Worker support detection
      if (enableWorker) {
        const script = `
          <script type="module">
            if (typeof Worker === 'undefined') {
              console.warn('[Enclave] Web Workers not supported in this browser');
            } else {
              console.log('[Enclave] Web Workers supported');
            }
          </script>
        `;

        return html.replace('</head>', `${script}\n</head>`);
      }

      return html;
    },
  };
}

/**
 * Default export for convenience
 */
export default enclavePlugin;
