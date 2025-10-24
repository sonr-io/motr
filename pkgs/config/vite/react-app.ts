import { resolve } from 'node:path';
import { tanstackRouter } from '@tanstack/router-plugin/vite';
import viteReact from '@vitejs/plugin-react';
import { type UserConfig, defineConfig } from 'vite';

/**
 * Base Vite configuration for React applications with TanStack Router
 *
 * @param options - Configuration options
 * @param options.root - Project root directory (default: process.cwd())
 * @param options.port - Dev server port (default: 3000)
 * @param options.plugins - Additional Vite plugins to include
 * @param options.alias - Additional path aliases
 * @param options.optimizeDeps - Dependency optimization overrides
 * @param options.server - Server configuration overrides
 * @returns Vite UserConfig
 */
export function createReactAppConfig(options: {
  root?: string;
  port?: number;
  base?: string;
  plugins?: UserConfig['plugins'];
  alias?: Record<string, string>;
  optimizeDeps?: UserConfig['optimizeDeps'];
  server?: UserConfig['server'];
} = {}): UserConfig {
  const root = options.root || process.cwd();

  return defineConfig({
    base: options.base || '/',
    plugins: [
      tanstackRouter({ autoCodeSplitting: true }),
      viteReact(),
      ...(options.plugins || []),
    ],
    resolve: {
      alias: {
        '@': resolve(root, './src'),
        ...options.alias,
      },
    },
    server: {
      port: options.port || 3000,
      strictPort: true,
      ...options.server,
    },
    optimizeDeps: {
      ...options.optimizeDeps,
    },
    build: {
      outDir: 'dist',
      emptyOutDir: true,
      rollupOptions: {
        output: {
          manualChunks: {
            // Split React into separate vendor chunk
            'vendor-react': ['react', 'react-dom'],
            // Split TanStack Router into separate chunk
            'vendor-router': ['@tanstack/react-router'],
            // Split TanStack Query into separate chunk
            'vendor-query': ['@tanstack/react-query'],
            // Split UI library into separate chunk
            'vendor-ui': ['@sonr.io/ui', 'sonner', 'motion'],
          },
        },
      },
      // Enable better chunk size warnings
      chunkSizeWarningLimit: 1000,
    },
  });
}

export default createReactAppConfig;
