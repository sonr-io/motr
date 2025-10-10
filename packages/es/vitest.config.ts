import { defineConfig } from 'vitest/config';
import path from 'path';
import { esPlugin } from './src/plugin/vite-plugin.js';

export default defineConfig({
  plugins: [esPlugin()],
  test: {
    globals: true,
    environment: 'jsdom',
    setupFiles: ['./test/setup.ts'],
    exclude: [
      '**/node_modules/**',
      '**/dist/**',
      '**/test/plugins.test.ts',
      '**/src/client/services/__tests__/ipfs.test.ts',
      '**/tests/integration/ipfs-integration.test.ts',
    ],
    coverage: {
      provider: 'v8',
      reporter: ['text', 'json', 'html'],
      exclude: [
        'node_modules/',
        'test/',
        '*.config.ts',
        '**/*.d.ts',
        '**/*.test.ts',
        '**/index.ts',
      ],
    },
  },
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
    },
  },
});
