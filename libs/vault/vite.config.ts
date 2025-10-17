/**
 * Vite Configuration for Motor Vault Package
 *
 * Comprehensive Vite setup following 2025 best practices for:
 * - Service Worker compilation and optimization
 * - WASM module integration
 * - TypeScript library building
 * - Development and production optimizations
 *
 * @see https://vitejs.dev/config/
 */

import { defineConfig } from 'vite'
import { resolve } from 'path'
import { vaultPlugin } from './src/vite-plugin-vault'

export default defineConfig({
  // Build configuration for library mode
  build: {
    lib: {
      entry: {
        index: resolve(__dirname, 'src/index.ts'),
        loader: resolve(__dirname, 'src/loader.ts'),
        'vite-plugin-vault': resolve(__dirname, 'src/vite-plugin-vault.ts'),
        'register-sw': resolve(__dirname, 'src/register-sw.ts'),
        sw: resolve(__dirname, 'src/sw.ts')
      },
      formats: ['es'],
      fileName: (format, entryName) => `${entryName}.js`
    },

    // Rollup options for advanced bundling
    rollupOptions: {
      // Externalize dependencies that shouldn't be bundled
      external: [
        'vite',
        'fs',
        'path',
        'url'
      ],

      output: {
        // Preserve module structure for tree-shaking
        preserveModules: false,

        // ES module format for modern browsers
        format: 'es',

        // Export all named exports
        exports: 'named',

        // Source maps for debugging
        sourcemap: true,

        // Asset file naming
        assetFileNames: (assetInfo) => {
          if (assetInfo.name === 'vault.wasm') {
            return 'vault.wasm'
          }
          if (assetInfo.name === 'wasm_exec.js') {
            return 'wasm_exec.js'
          }
          return '[name][extname]'
        }
      }
    },

    // Build output directory
    outDir: 'dist',

    // Clean output directory before build
    emptyOutDir: true,

    // Source maps for debugging
    sourcemap: true,

    // Minification settings
    minify: 'terser',
    terserOptions: {
      compress: {
        drop_console: false,
        drop_debugger: true,
        pure_funcs: ['console.log']
      },
      format: {
        comments: false
      }
    },

    // Target modern browsers
    target: 'esnext',

    // Chunk size warnings
    chunkSizeWarningLimit: 1000,

    // Enable report for bundle analysis
    reportCompressedSize: true
  },

  // Development server configuration
  server: {
    // Port for dev server
    port: 3000,

    // Enable HTTPS for Service Worker testing
    https: false, // Set to true for local HTTPS testing

    // CORS settings
    cors: true,

    // File system access
    fs: {
      allow: ['.']
    },

    // Security headers for WASM and Service Workers
    headers: {
      'Cross-Origin-Embedder-Policy': 'require-corp',
      'Cross-Origin-Opener-Policy': 'same-origin',
      'Cross-Origin-Resource-Policy': 'cross-origin'
    },

    // Hot module replacement
    hmr: {
      overlay: true
    }
  },

  // Preview server configuration (for production builds)
  preview: {
    port: 3001,
    https: false,
    cors: true,
    headers: {
      'Cross-Origin-Embedder-Policy': 'require-corp',
      'Cross-Origin-Opener-Policy': 'same-origin',
      'Cross-Origin-Resource-Policy': 'cross-origin'
    }
  },

  // Dependency optimization
  optimizeDeps: {
    // Exclude packages from pre-bundling
    exclude: [
      '@sonr.io/vault'
    ],

    // Include packages that need pre-bundling
    include: [],

    // ESBuild options
    esbuildOptions: {
      target: 'esnext',
      supported: {
        'top-level-await': true
      }
    }
  },

  // Worker configuration for Web Workers and Service Workers
  worker: {
    // Worker format
    format: 'es',

    // Worker plugins
    plugins: [],

    // Worker bundling options
    rollupOptions: {
      output: {
        format: 'es',
        entryFileNames: '[name].js'
      }
    }
  },

  // Resolve configuration
  resolve: {
    // Path aliases
    alias: {
      '@': resolve(__dirname, './src'),
      '@handlers': resolve(__dirname, './handlers'),
      '@middleware': resolve(__dirname, './middleware')
    },

    // Extensions to resolve
    extensions: ['.ts', '.js', '.json']
  },

  // Plugin configuration
  plugins: [
    vaultPlugin({
      copyToPublic: true,
      publicPath: '/vault',
      debug: process.env.NODE_ENV === 'development',
      registerServiceWorker: true,
      scope: '/',
      updateCheckInterval: 3600000, // 1 hour
      enableInDev: false, // Enable for local Service Worker testing
      swSrc: 'src/sw.ts',
      swDest: 'sw.js'
    })
  ],

  // ESBuild configuration
  esbuild: {
    // JSX configuration (if needed)
    jsxFactory: 'h',
    jsxFragment: 'Fragment',

    // Drop console in production
    drop: process.env.NODE_ENV === 'production' ? ['debugger'] : [],

    // Target
    target: 'esnext',

    // Supported features
    supported: {
      'top-level-await': true
    }
  },

  // Environment variables
  envPrefix: 'VAULT_',

  // CSS configuration
  css: {
    devSourcemap: true
  },

  // JSON configuration
  json: {
    namedExports: true,
    stringify: false
  },

  // Log level
  logLevel: 'info',

  // Clear screen
  clearScreen: true,

  // Define global constants
  define: {
    __VERSION__: JSON.stringify(process.env.npm_package_version || '0.0.1'),
    __DEV__: JSON.stringify(process.env.NODE_ENV !== 'production')
  }
})
