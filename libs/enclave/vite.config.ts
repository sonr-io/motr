/**
 * Vite Configuration for Enclave Package
 *
 * Comprehensive Vite setup following 2025 best practices for:
 * - Web Worker compilation and optimization
 * - WASM module integration with Extism
 * - TypeScript library building
 * - Development and production optimizations
 *
 * @see https://vitejs.dev/config/
 */

import { resolve } from "node:path";
import { defineConfig } from "vite";
import { enclavePlugin } from "./src/vite-plugin-enclave";

export default defineConfig({
  // Build configuration for library mode
  build: {
    lib: {
      entry: {
        index: resolve(__dirname, "src/index.ts"),
        client: resolve(__dirname, "src/client.ts"),
        "worker-client": resolve(__dirname, "src/worker-client.ts"),
        worker: resolve(__dirname, "src/worker.ts"),
        loader: resolve(__dirname, "src/loader.ts"),
        storage: resolve(__dirname, "src/storage.ts"),
        types: resolve(__dirname, "src/types.ts"),
        "vite-plugin-enclave": resolve(__dirname, "src/vite-plugin-enclave.ts"),
      },
      formats: ["es"],
      fileName: (_format, entryName) => `${entryName}.js`,
    },

    // Rollup options
    rollupOptions: {
      // Externalize dependencies
      external: [
        "vite",
        "fs",
        "path",
        "url",
        "node:fs",
        "node:path",
        "node:url",
        "@extism/extism",
        "dexie",
        // Optional IPFS dependencies
        "helia",
        "@helia/strings",
        "@helia/unixfs",
        "@helia/verified-fetch",
        "@chainsafe/libp2p-noise",
        "@chainsafe/libp2p-yamux",
        "@libp2p/webrtc",
        "@libp2p/websockets",
        "multiformats",
        "uint8arrays",
      ],

      output: {
        format: "es",
        exports: "named",
        sourcemap: true,
      },
    },

    // Output directory
    outDir: "dist",
    emptyOutDir: true,
    sourcemap: true,

    // Minification settings
    minify: "terser",
    terserOptions: {
      compress: {
        drop_console: false,
        drop_debugger: true,
      },
      format: {
        comments: false,
      },
    },

    // Target modern browsers and Node.js
    target: "esnext",

    // Chunk size warnings
    chunkSizeWarningLimit: 1000,

    // Enable report
    reportCompressedSize: true,
  },

  // Development server configuration
  server: {
    port: 3002,
    https: false, // Set to true for local HTTPS testing
    cors: true,

    // File system access
    fs: {
      allow: ["."],
    },

    // Security headers for WASM and Web Workers
    headers: {
      "Cross-Origin-Embedder-Policy": "require-corp",
      "Cross-Origin-Opener-Policy": "same-origin",
      "Cross-Origin-Resource-Policy": "cross-origin",
    },

    // HMR configuration
    hmr: {
      overlay: true,
    },
  },

  // Preview server configuration
  preview: {
    port: 3003,
    https: false,
    cors: true,
    headers: {
      "Cross-Origin-Embedder-Policy": "require-corp",
      "Cross-Origin-Opener-Policy": "same-origin",
      "Cross-Origin-Resource-Policy": "cross-origin",
    },
  },

  // Dependency optimization
  optimizeDeps: {
    // Exclude packages from pre-bundling
    exclude: ["@sonr.io/enclave", "@extism/extism"],

    // Include packages that need pre-bundling
    include: ["dexie"],

    // ESBuild options
    esbuildOptions: {
      target: "esnext",
      supported: {
        "top-level-await": true,
      },
    },
  },

  // Worker configuration for Web Workers
  worker: {
    format: "es",
    plugins: () => [],
    rollupOptions: {
      output: {
        format: "es",
        entryFileNames: "[name].js",
      },
    },
  },

  // Resolve configuration
  resolve: {
    // Path aliases
    alias: {
      "@": resolve(__dirname, "./src"),
    },

    // Extensions to resolve
    extensions: [".ts", ".js", ".json"],
  },

  // Plugin configuration
  plugins: [
    enclavePlugin({
      wasmPath: "dist/enclave.wasm",
      enableWorker: true,
      debug: process.env.NODE_ENV === "development",
      copyToPublic: true,
      enableExtism: true,
    }),
  ],

  // ESBuild configuration
  esbuild: {
    // Drop console in production
    drop: process.env.NODE_ENV === "production" ? ["debugger"] : [],

    // Target
    target: "esnext",

    // Supported features
    supported: {
      "top-level-await": true,
    },
  },

  // Environment variables
  envPrefix: "ENCLAVE_",

  // CSS configuration
  css: {
    devSourcemap: true,
  },

  // JSON configuration
  json: {
    namedExports: true,
    stringify: false,
  },

  // Log level
  logLevel: "info",

  // Clear screen
  clearScreen: true,

  // Define global constants
  define: {
    __VERSION__: JSON.stringify(process.env.npm_package_version || "0.0.1"),
    __DEV__: JSON.stringify(process.env.NODE_ENV !== "production"),
  },
});
