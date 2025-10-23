/**
 * Sonr Browser Vite Plugin
 *
 * Modern Vite plugin that bundles WASM binaries as Web Workers for the Sonr browser client.
 * Integrates enclave and vault WASM modules with automatic worker generation.
 *
 * Features:
 * - WASM module bundling and asset management
 * - Web Worker script generation and bundling
 * - Automatic WASM path resolution
 * - Development and production optimization
 * - CORS and security headers for WASM/Worker support
 * - TypeScript support for workers
 * - Source map generation
 *
 * @see https://vitejs.dev/guide/features.html#web-workers
 */

import { existsSync, readFileSync } from "node:fs";
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";
import type { Plugin, ResolvedConfig } from "vite";

export interface SonrBrowserPluginOptions {
  /**
   * Enable enclave worker
   * @default true
   */
  enableEnclave?: boolean;

  /**
   * Enclave WASM path relative to node_modules/@sonr.io/enclave
   * @default 'dist/enclave.wasm'
   */
  enclaveWasmPath?: string;

  /**
   * Enable vault worker
   * @default true
   */
  enableVault?: boolean;

  /**
   * Vault WASM path relative to node_modules/@sonr.io/vault
   * @default 'dist/vault.wasm'
   */
  vaultWasmPath?: string;

  /**
   * Path to custom worker scripts directory
   */
  customWorkersPath?: string;

  /**
   * Enable debug logging
   * @default false
   */
  debug?: boolean;

  /**
   * Copy WASM files to public directory
   * @default true
   */
  copyToPublic?: boolean;

  /**
   * Enable SharedWorker support
   * @default false
   */
  enableSharedWorkers?: boolean;

  /**
   * Worker output directory in build
   * @default 'workers'
   */
  workerOutDir?: string;

  /**
   * Enable service worker integration
   * @default false
   */
  enableServiceWorker?: boolean;

  /**
   * Enable WASM streaming compilation
   * @default true
   */
  enableWasmStreaming?: boolean;
}

interface WasmAsset {
  name: string;
  path: string;
  content: Buffer;
  type: "enclave" | "vault";
}

export function sonrBrowserPlugin(options: SonrBrowserPluginOptions = {}): Plugin {
  const {
    enableEnclave = true,
    enclaveWasmPath = "dist/enclave.wasm",
    enableVault = true,
    vaultWasmPath = "dist/vault.wasm",
    customWorkersPath,
    debug = false,
    copyToPublic = true,
    enableSharedWorkers = false,
    workerOutDir = "workers",
    enableServiceWorker = false,
    enableWasmStreaming = true,
  } = options;

  let config: ResolvedConfig;
  const wasmAssets: WasmAsset[] = [];
  const workerScripts: Map<string, string> = new Map();

  return {
    name: "vite-plugin-sonr-browser",

    config() {
      return {
        // Optimize dependencies
        optimizeDeps: {
          exclude: [
            "@sonr.io/browser",
            "@sonr.io/enclave",
            "@sonr.io/vault",
            "@sonr.io/sdk",
            "@extism/extism",
          ],
          esbuildOptions: {
            target: "esnext",
            supported: {
              "top-level-await": true,
            },
          },
        },

        // Worker configuration
        worker: {
          format: "es",
          plugins: () => [],
          rollupOptions: {
            output: {
              format: "es",
              entryFileNames: `${workerOutDir}/[name].js`,
              chunkFileNames: `${workerOutDir}/[name]-[hash].js`,
              assetFileNames: `${workerOutDir}/[name].[ext]`,
            },
          },
        },

        // Build configuration
        build: {
          target: "esnext",
          modulePreload: {
            polyfill: true,
          },
          rollupOptions: {
            output: {
              // Separate WASM files
              assetFileNames: (assetInfo) => {
                if (assetInfo.name?.endsWith(".wasm")) {
                  return "wasm/[name].[ext]";
                }
                return "assets/[name]-[hash].[ext]";
              },
            },
          },
        },

        // Server configuration
        server: {
          headers: {
            // Required for SharedArrayBuffer and WASM
            "Cross-Origin-Embedder-Policy": "require-corp",
            "Cross-Origin-Opener-Policy": "same-origin",
            // Enable WASM MIME type
            "Access-Control-Allow-Origin": "*",
          },
          fs: {
            // Allow serving files from workspace packages
            allow: [".."],
          },
        },

        // Preview server configuration
        preview: {
          headers: {
            "Cross-Origin-Embedder-Policy": "require-corp",
            "Cross-Origin-Opener-Policy": "same-origin",
          },
        },
      };
    },

    configResolved(resolvedConfig) {
      config = resolvedConfig;

      if (debug) {
        console.log("[SonrBrowserPlugin] Config resolved:", {
          mode: config.mode,
          command: config.command,
          root: config.root,
        });
      }
    },

    buildStart() {
      if (debug) {
        console.log("[SonrBrowserPlugin] Build started");
      }

      // Locate and load WASM assets
      this.loadWasmAssets();
    },

    async loadWasmAssets() {
      wasmAssets.length = 0;

      // Load enclave WASM
      if (enableEnclave) {
        try {
          const enclavePath = this.resolvePackageAsset("@sonr.io/enclave", enclaveWasmPath);
          if (existsSync(enclavePath)) {
            wasmAssets.push({
              name: "enclave.wasm",
              path: enclavePath,
              content: readFileSync(enclavePath),
              type: "enclave",
            });

            if (debug) {
              console.log("[SonrBrowserPlugin] Loaded enclave WASM:", enclavePath);
            }
          } else {
            console.warn("[SonrBrowserPlugin] Enclave WASM not found:", enclavePath);
          }
        } catch (error) {
          console.error("[SonrBrowserPlugin] Failed to load enclave WASM:", error);
        }
      }

      // Load vault WASM
      if (enableVault) {
        try {
          const vaultPath = this.resolvePackageAsset("@sonr.io/vault", vaultWasmPath);
          if (existsSync(vaultPath)) {
            wasmAssets.push({
              name: "vault.wasm",
              path: vaultPath,
              content: readFileSync(vaultPath),
              type: "vault",
            });

            if (debug) {
              console.log("[SonrBrowserPlugin] Loaded vault WASM:", vaultPath);
            }
          } else {
            console.warn("[SonrBrowserPlugin] Vault WASM not found:", vaultPath);
          }
        } catch (error) {
          console.error("[SonrBrowserPlugin] Failed to load vault WASM:", error);
        }
      }

      // Emit WASM assets
      if (copyToPublic) {
        for (const asset of wasmAssets) {
          this.emitFile({
            type: "asset",
            fileName: `wasm/${asset.name}`,
            source: asset.content,
          });

          if (debug) {
            console.log(`[SonrBrowserPlugin] Emitted WASM asset: wasm/${asset.name}`);
          }
        }
      }
    },

    resolvePackageAsset(packageName: string, assetPath: string): string {
      // Try multiple resolution strategies
      const strategies = [
        // Strategy 1: Relative to current working directory
        () => resolve(process.cwd(), "node_modules", packageName, assetPath),
        // Strategy 2: Relative to project root
        () => resolve(config?.root || process.cwd(), "node_modules", packageName, assetPath),
        // Strategy 3: Workspace resolution (monorepo)
        () => {
          const pkgPath = packageName.replace("@sonr.io/", "");
          return resolve(process.cwd(), "..", pkgPath, assetPath);
        },
        // Strategy 4: Workspace from root
        () => {
          const pkgPath = packageName.replace("@sonr.io/", "libs/");
          return resolve(config?.root || process.cwd(), "..", pkgPath, assetPath);
        },
      ];

      for (const strategy of strategies) {
        try {
          const path = strategy();
          if (existsSync(path)) {
            return path;
          }
        } catch {
          // Continue to next strategy
        }
      }

      throw new Error(`Could not resolve ${packageName}/${assetPath}`);
    },

    resolveId(id: string) {
      // Resolve virtual modules for WASM URLs
      if (id === "virtual:sonr-browser/enclave-wasm") {
        return id;
      }
      if (id === "virtual:sonr-browser/vault-wasm") {
        return id;
      }
      if (id === "virtual:sonr-browser/worker-urls") {
        return id;
      }

      return null;
    },

    load(id: string) {
      // Provide virtual module for enclave WASM URL
      if (id === "virtual:sonr-browser/enclave-wasm") {
        const wasmPath = config.command === "serve"
          ? "/@sonr.io/enclave/dist/enclave.wasm"
          : "/wasm/enclave.wasm";
        return `export default ${JSON.stringify(wasmPath)};`;
      }

      // Provide virtual module for vault WASM URL
      if (id === "virtual:sonr-browser/vault-wasm") {
        const wasmPath = config.command === "serve"
          ? "/@sonr.io/vault/dist/vault.wasm"
          : "/wasm/vault.wasm";
        return `export default ${JSON.stringify(wasmPath)};`;
      }

      // Provide virtual module for worker URLs
      if (id === "virtual:sonr-browser/worker-urls") {
        const workerUrls = {
          enclave: enableEnclave
            ? config.command === "serve"
              ? "/src/workers/enclave-worker.ts"
              : `/workers/enclave-worker.js`
            : null,
          vault: enableVault
            ? config.command === "serve"
              ? "/src/workers/vault-worker.ts"
              : `/workers/vault-worker.js`
            : null,
        };

        return `export default ${JSON.stringify(workerUrls)};`;
      }

      return null;
    },

    async generateBundle(_options, bundle) {
      if (debug) {
        console.log("[SonrBrowserPlugin] Generating bundle");
      }

      // Ensure all WASM assets are in the bundle
      for (const asset of wasmAssets) {
        const fileName = `wasm/${asset.name}`;
        if (!bundle[fileName]) {
          this.emitFile({
            type: "asset",
            fileName,
            source: asset.content,
          });

          if (debug) {
            console.log(`[SonrBrowserPlugin] Added WASM to bundle: ${fileName}`);
          }
        }
      }

      // Generate service worker manifest if enabled
      if (enableServiceWorker) {
        const manifestContent = this.generateServiceWorkerManifest(bundle);
        this.emitFile({
          type: "asset",
          fileName: "sw-manifest.json",
          source: manifestContent,
        });
      }
    },

    generateServiceWorkerManifest(bundle: any): string {
      const manifest = {
        version: Date.now(),
        assets: {
          wasm: wasmAssets.map((a) => `/wasm/${a.name}`),
          workers: Array.from(workerScripts.keys()).map((name) => `/workers/${name}.js`),
        },
        cacheStrategy: {
          wasm: "cache-first",
          workers: "network-first",
        },
      };

      return JSON.stringify(manifest, null, 2);
    },

    transformIndexHtml(html) {
      const scripts: string[] = [];

      // Inject worker support detection
      scripts.push(`
        <script type="module">
          // Check Web Worker support
          if (typeof Worker === 'undefined') {
            console.warn('[Sonr Browser] Web Workers not supported');
          }

          // Check WebAssembly support
          if (typeof WebAssembly === 'undefined') {
            console.error('[Sonr Browser] WebAssembly not supported');
          }

          ${enableSharedWorkers ? `
          // Check SharedWorker support
          if (typeof SharedWorker === 'undefined') {
            console.warn('[Sonr Browser] SharedWorker not supported, falling back to Worker');
          }
          ` : ""}

          ${enableWasmStreaming ? `
          // Check WASM streaming compilation support
          if (typeof WebAssembly.instantiateStreaming === 'undefined') {
            console.warn('[Sonr Browser] WebAssembly.instantiateStreaming not supported, using fallback');
          }
          ` : ""}

          console.log('[Sonr Browser] Environment check complete');
        </script>
      `);

      // Inject module preloads for workers
      if (config.command === "build") {
        if (enableEnclave) {
          scripts.push(
            `<link rel="modulepreload" href="/workers/enclave-worker.js">`,
          );
          scripts.push(
            `<link rel="prefetch" href="/wasm/enclave.wasm" as="fetch" type="application/wasm" crossorigin>`,
          );
        }
        if (enableVault) {
          scripts.push(
            `<link rel="modulepreload" href="/workers/vault-worker.js">`,
          );
          scripts.push(
            `<link rel="prefetch" href="/wasm/vault.wasm" as="fetch" type="application/wasm" crossorigin>`,
          );
        }
      }

      return html.replace("</head>", `${scripts.join("\n")}\n</head>`);
    },

    configureServer(server) {
      // Add middleware to serve WASM with correct MIME type
      server.middlewares.use((req, res, next) => {
        if (req.url?.endsWith(".wasm")) {
          res.setHeader("Content-Type", "application/wasm");
        }
        next();
      });

      if (debug) {
        console.log("[SonrBrowserPlugin] Dev server configured");
      }
    },
  };
}

/**
 * Default export for convenience
 */
export default sonrBrowserPlugin;
