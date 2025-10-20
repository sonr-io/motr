/**
 * Vite plugin for Motor Vault WASM service worker
 *
 * Modern Vite plugin that provides comprehensive Service Worker integration
 * following W3C standards and MDN best practices for 2025.
 *
 * Features:
 * - TypeScript Service Worker compilation
 * - Automatic WASM file bundling
 * - Service Worker registration with lifecycle management
 * - Development and production optimization
 * - CORS and security headers configuration
 * - Hot reload support for Service Worker updates
 *
 * @see https://developer.mozilla.org/en-US/docs/Web/API/Service_Worker_API
 */

import { existsSync, readFileSync } from "node:fs";
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";
import type { Plugin, ResolvedConfig } from "vite";
import { build } from "vite";

export interface VaultPluginOptions {
  /**
   * Whether to copy WASM files to public directory
   * @default true
   */
  copyToPublic?: boolean;

  /**
   * Public path for WASM files
   * @default '/vault'
   */
  publicPath?: string;

  /**
   * Enable debug logging
   * @default false
   */
  debug?: boolean;

  /**
   * Whether to automatically register the ServiceWorker
   * @default true
   */
  registerServiceWorker?: boolean;

  /**
   * Service Worker scope
   * @default '/'
   */
  scope?: string;

  /**
   * Service Worker update check interval in ms
   * @default 3600000 (1 hour)
   */
  updateCheckInterval?: number;

  /**
   * Enable Service Worker in development mode
   * @default false
   */
  enableInDev?: boolean;

  /**
   * TypeScript Service Worker source file
   * @default 'src/sw.ts'
   */
  swSrc?: string;

  /**
   * Output Service Worker filename
   * @default 'sw.js'
   */
  swDest?: string;
}

/**
 * Vite plugin for Motor Vault integration
 *
 * @example
 * ```typescript
 * // vite.config.ts
 * import { vaultPlugin } from '@sonr.io/vault/vite-plugin'
 *
 * export default defineConfig({
 *   plugins: [
 *     vaultPlugin({
 *       publicPath: '/motor-vault',
 *       registerServiceWorker: true,
 *       scope: '/',
 *       updateCheckInterval: 3600000
 *     })
 *   ]
 * })
 * ```
 */
export function vaultPlugin(options: VaultPluginOptions = {}): Plugin {
  const {
    copyToPublic = true,
    publicPath = "/vault",
    debug = false,
    registerServiceWorker = true,
    scope = "/",
    updateCheckInterval = 3600000,
    enableInDev = false,
    swSrc = "src/sw.ts",
    swDest = "sw.js",
  } = options;

  const __dirname = dirname(fileURLToPath(import.meta.url));
  const wasmPath = resolve(__dirname, "../dist/vault.wasm");
  const runtimePath = resolve(__dirname, "../dist/wasm_exec.js");
  const swTsPath = resolve(__dirname, "./sw.ts");
  const swJsPath = resolve(__dirname, "./sw.js");

  let config: ResolvedConfig;
  let swBuilt = false;

  return {
    name: "vite-plugin-vault",

    config() {
      return {
        optimizeDeps: {
          exclude: ["@sonr.io/vault"],
        },
        server: {
          fs: {
            allow: [resolve(__dirname, "..")],
          },
          headers: {
            "Cross-Origin-Embedder-Policy": "require-corp",
            "Cross-Origin-Opener-Policy": "same-origin",
          },
        },
        worker: {
          format: "es",
          plugins: () => [],
        },
      };
    },

    configResolved(resolvedConfig) {
      config = resolvedConfig;
    },

    async configureServer(server) {
      if (debug) {
        console.log("[VaultPlugin] Configuring dev server...");
      }

      // Build Service Worker in TypeScript for development
      if (enableInDev && existsSync(swTsPath)) {
        await buildServiceWorker(swTsPath, swJsPath, debug);
        swBuilt = true;
      }

      // Serve WASM file with proper headers
      server.middlewares.use(`${publicPath}/vault.wasm`, (_req, res) => {
        try {
          const wasm = readFileSync(wasmPath);
          res.setHeader("Content-Type", "application/wasm");
          res.setHeader("Cross-Origin-Embedder-Policy", "require-corp");
          res.setHeader("Cross-Origin-Opener-Policy", "same-origin");
          res.setHeader("Cache-Control", "public, max-age=31536000, immutable");
          res.end(wasm);
        } catch (error) {
          console.error("[VaultPlugin] Failed to serve vault.wasm:", error);
          res.statusCode = 404;
          res.end("WASM file not found");
        }
      });

      // Serve WASM runtime
      server.middlewares.use(`${publicPath}/wasm_exec.js`, (_req, res) => {
        try {
          const runtime = readFileSync(runtimePath, "utf-8");
          res.setHeader(
            "Content-Type",
            "application/javascript; charset=utf-8",
          );
          res.setHeader("Cache-Control", "public, max-age=31536000, immutable");
          res.end(runtime);
        } catch (error) {
          console.error("[VaultPlugin] Failed to serve wasm_exec.js:", error);
          res.statusCode = 404;
          res.end("WASM runtime not found");
        }
      });

      // Serve ServiceWorker (compiled or source)
      server.middlewares.use(`/${swDest}`, (_req, res) => {
        try {
          let sw: string;

          if (swBuilt && existsSync(swJsPath)) {
            sw = readFileSync(swJsPath, "utf-8");
          } else if (existsSync(swTsPath)) {
            sw = readFileSync(swTsPath, "utf-8");
          } else {
            throw new Error("Service Worker file not found");
          }

          res.setHeader(
            "Content-Type",
            "application/javascript; charset=utf-8",
          );
          res.setHeader("Service-Worker-Allowed", scope);
          res.setHeader("Cache-Control", "no-cache, no-store, must-revalidate");
          res.end(sw);
        } catch (error) {
          console.error("[VaultPlugin] Failed to serve Service Worker:", error);
          res.statusCode = 404;
          res.end("ServiceWorker not found");
        }
      });

      if (debug) {
        console.log(
          `[VaultPlugin] Vault WASM available at ${publicPath}/vault.wasm`,
        );
        console.log(
          `[VaultPlugin] WASM runtime available at ${publicPath}/wasm_exec.js`,
        );
        console.log(`[VaultPlugin] ServiceWorker available at /${swDest}`);
        console.log(`[VaultPlugin] ServiceWorker scope: ${scope}`);
      }
    },

    async buildStart() {
      if (debug) {
        console.log("[VaultPlugin] Build started");
      }

      // Build Service Worker for production
      if (config.command === "build" && existsSync(swTsPath)) {
        await buildServiceWorker(swTsPath, swJsPath, debug);
        swBuilt = true;
      }
    },

    async generateBundle(_options, _bundle) {
      if (!copyToPublic) return;

      if (debug) {
        console.log("[VaultPlugin] Adding WASM files to bundle...");
      }

      try {
        // Add WASM file to bundle with optimized headers
        if (existsSync(wasmPath)) {
          const wasmContent = readFileSync(wasmPath);
          this.emitFile({
            type: "asset",
            fileName: "vault.wasm",
            source: wasmContent,
          });
        }

        // Add WASM runtime to bundle
        if (existsSync(runtimePath)) {
          const runtimeContent = readFileSync(runtimePath, "utf-8");
          this.emitFile({
            type: "asset",
            fileName: "wasm_exec.js",
            source: runtimeContent,
          });
        }

        // Add compiled ServiceWorker to bundle
        if (swBuilt && existsSync(swJsPath)) {
          const swContent = readFileSync(swJsPath, "utf-8");
          this.emitFile({
            type: "asset",
            fileName: swDest,
            source: swContent,
          });
        } else if (existsSync(swTsPath)) {
          // Fallback to TypeScript source if not built
          const swContent = readFileSync(swTsPath, "utf-8");
          this.emitFile({
            type: "asset",
            fileName: swDest,
            source: swContent,
          });
        }

        if (debug) {
          console.log(
            "[VaultPlugin] WASM files and ServiceWorker added to bundle",
          );
        }
      } catch (error) {
        console.error(
          "[VaultPlugin] Failed to add WASM files to bundle:",
          error,
        );
      }
    },

    transformIndexHtml(html) {
      if (!registerServiceWorker) return html;

      // Inject ServiceWorker registration script with lifecycle management
      const swRegistrationScript = `
         <script type="module">
           // Modern Service Worker Registration following MDN best practices
           if ('serviceWorker' in navigator) {
             window.addEventListener('load', async () => {
               try {
                 const registration = await navigator.serviceWorker.register('/${swDest}', {
                   scope: '${scope}',
                   updateViaCache: 'none'
                 });

                 console.log('[Motor Vault] ServiceWorker registered:', registration.scope);

                 // Check for updates periodically
                 setInterval(() => {
                   registration.update();
                 }, ${updateCheckInterval});

                 // Handle updates
                 registration.addEventListener('updatefound', () => {
                   const newWorker = registration.installing;
                   if (!newWorker) return;

                   newWorker.addEventListener('statechange', () => {
                     if (newWorker.state === 'installed' && navigator.serviceWorker.controller) {
                       console.log('[Motor Vault] New ServiceWorker available, refresh to update');

                       // Optionally notify user
                       if (window.confirm('New version available. Reload to update?')) {
                         newWorker.postMessage({ type: 'SKIP_WAITING' });
                         window.location.reload();
                       }
                     }
                   });
                 });

                 // Listen for controlling service worker changes
                 navigator.serviceWorker.addEventListener('controllerchange', () => {
                   console.log('[Motor Vault] ServiceWorker controller changed');
                 });

               } catch (error) {
                 console.error('[Motor Vault] ServiceWorker registration failed:', error);
               }
             });
           } else {
             console.warn('[Motor Vault] ServiceWorker not supported in this browser');
           }
         </script>
       `;

      return html.replace("</head>", `${swRegistrationScript}\n</head>`);
    },
  };
}

/**
 * Builds TypeScript Service Worker to JavaScript
 */
async function buildServiceWorker(
  input: string,
  output: string,
  debug: boolean,
): Promise<void> {
  try {
    if (debug) {
      console.log(
        `[VaultPlugin] Building Service Worker: ${input} -> ${output}`,
      );
    }

    await build({
      configFile: false,
      build: {
        lib: {
          entry: input,
          formats: ["es"],
          fileName: () => "sw.js",
        },
        outDir: dirname(output),
        emptyOutDir: false,
        minify: "terser",
        target: "esnext",
        rollupOptions: {
          output: {
            entryFileNames: "sw.js",
            format: "es",
          },
        },
      },
      logLevel: debug ? "info" : "warn",
    });

    if (debug) {
      console.log("[VaultPlugin] Service Worker built successfully");
    }
  } catch (error) {
    console.error("[VaultPlugin] Failed to build Service Worker:", error);
    throw error;
  }
}

export default vaultPlugin;
