import { type UserConfig, defineConfig, mergeConfig } from 'vite';
import { configDefaults } from 'vitest/config';

/**
 * Base Vitest configuration for testing
 *
 * @param options - Configuration options
 * @param options.baseConfig - Base Vite config to merge with
 * @param options.coverage - Enable coverage reporting (default: false)
 * @param options.globals - Enable global test APIs (default: true)
 * @param options.environment - Test environment (default: 'node')
 * @returns Vite UserConfig with Vitest settings
 */
export function createTestConfig(options: {
  baseConfig?: UserConfig;
  coverage?: boolean;
  globals?: boolean;
  environment?: 'node' | 'jsdom' | 'happy-dom';
} = {}): UserConfig {
  const testConfig = defineConfig({
    test: {
      globals: options.globals ?? true,
      environment: options.environment || 'node',
      exclude: [...configDefaults.exclude, '**/node_modules/**', '**/dist/**'],
      coverage: options.coverage
        ? {
            provider: 'v8',
            reporter: ['text', 'json', 'html'],
            exclude: [
              ...configDefaults.exclude,
              '**/node_modules/**',
              '**/dist/**',
              '**/*.config.*',
              '**/test/**',
              '**/*.test.*',
            ],
          }
        : undefined,
    },
  });

  return options.baseConfig
    ? mergeConfig(options.baseConfig, testConfig)
    : testConfig;
}

export default createTestConfig;
