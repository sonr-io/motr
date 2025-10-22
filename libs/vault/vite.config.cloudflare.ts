/**
 * Vite Configuration for Cloudflare Workers Build
 *
 * Specialized Vite setup for building vault as a Cloudflare Durable Object:
 * - Cloudflare Workers runtime compatibility
 * - WASM module bundling for Durable Objects
 * - TypeScript compilation for Worker environment
 * - Production optimizations for edge deployment
 *
 * @see https://vitejs.dev/config/
 * @see https://developers.cloudflare.com/workers/
 */

import { resolve } from "node:path";
import { defineConfig } from "vite";

export default defineConfig({
  // Build configuration for Cloudflare Workers
  build: {
    // Output as library for Cloudflare Workers runtime
    lib: {
      entry: resolve(__dirname, "src/cloudflare/worker.ts"),
      formats: ["es"],
      fileName: () => "worker.js",
    },

    // Rollup options optimized for Workers
    rollupOptions: {
      // Externalize Cloudflare runtime modules
      external: [
        // Cloudflare Workers runtime is provided globally
        "cloudflare:workers",
      ],

      output: {
        // Preserve module structure
        preserveModules: false,

        // ES module format (required by Workers)
        format: "es",

        // Export all named exports
        exports: "named",

        // Source maps for debugging
        sourcemap: true,

        // Keep WASM files inline for Workers
        inlineDynamicImports: true,

        // Asset file naming
        assetFileNames: (assetInfo) => {
          if (assetInfo.name === "vault.wasm") {
            return "vault.wasm";
          }
          if (assetInfo.name === "wasm_exec.js") {
            return "wasm_exec.js";
          }
          return "[name][extname]";
        },
      },
    },

    // Build output directory (Wrangler expects this structure)
    outDir: "dist",

    // Don't clean output directory - WASM files are built first
    emptyOutDir: false,

    // Source maps for production debugging
    sourcemap: true,

    // Minification for smaller Workers bundle
    minify: "terser",
    terserOptions: {
      compress: {
        // Keep console.log for Workers debugging
        drop_console: false,
        drop_debugger: true,
        // Remove unused code
        unused: true,
        dead_code: true,
      },
      format: {
        // Remove comments to reduce size
        comments: false,
      },
      // Keep function names for better stack traces
      keep_fnames: true,
    },

    // Target modern JS for Workers runtime
    target: "esnext",

    // Chunk size warnings (Workers have size limits)
    chunkSizeWarningLimit: 1000,

    // Enable report for bundle analysis
    reportCompressedSize: true,

    // SSR mode for Workers (no DOM)
    ssr: true,
  },

  // Resolve configuration
  resolve: {
    // Path aliases
    alias: {
      "@": resolve(__dirname, "./src"),
      "@cloudflare": resolve(__dirname, "./src/cloudflare"),
      "@handlers": resolve(__dirname, "./handlers"),
      "@middleware": resolve(__dirname, "./middleware"),
    },

    // Extensions to resolve
    extensions: [".ts", ".js", ".json", ".wasm"],

    // Conditions for module resolution (Workers environment)
    conditions: ["worker", "import", "module", "browser", "default"],
  },

  // ESBuild configuration for TypeScript
  esbuild: {
    // Target modern Workers runtime
    target: "esnext",

    // Platform (Workers are similar to browser environment)
    platform: "browser",

    // Supported features
    supported: {
      "top-level-await": true,
      "dynamic-import": true,
      "import-meta": true,
    },

    // Keep function names for debugging
    keepNames: true,

    // Format
    format: "esm",
  },

  // Dependency optimization (minimal for Workers)
  optimizeDeps: {
    // Include Cloudflare Workers types
    include: ["@cloudflare/workers-types"],

    // ESBuild options
    esbuildOptions: {
      target: "esnext",
      platform: "browser",
      supported: {
        "top-level-await": true,
      },
    },
  },

  // Environment variables for Workers
  envPrefix: "VAULT_",

  // Log level
  logLevel: "info",

  // Clear screen
  clearScreen: true,

  // Define global constants
  define: {
    __VERSION__: JSON.stringify(process.env.npm_package_version || "0.0.1"),
    __CLOUDFLARE__: "true",
    global: "globalThis",
  },

  // Worker-specific configuration
  worker: {
    format: "es",
    plugins: [],
    rollupOptions: {
      external: ["cloudflare:workers"],
      output: {
        format: "es",
      },
    },
  },

  // Plugins (none needed for basic Workers build)
  plugins: [],
});
