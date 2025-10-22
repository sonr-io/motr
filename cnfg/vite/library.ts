import { resolve } from 'node:path';
import { type LibraryOptions, type UserConfig, defineConfig } from 'vite';

/**
 * Base Vite configuration for library packages
 *
 * @param options - Configuration options
 * @param options.root - Project root directory (default: process.cwd())
 * @param options.entry - Entry points for the library
 * @param options.name - Library name for UMD builds
 * @param options.fileName - Output file name format
 * @param options.plugins - Additional Vite plugins
 * @param options.external - External dependencies
 * @param options.formats - Output formats (default: ['es', 'cjs'])
 * @returns Vite UserConfig
 */
export function createLibraryConfig(options: {
  root?: string;
  entry: Record<string, string> | string;
  name?: string;
  fileName?: string | ((format: string, entryName: string) => string);
  plugins?: UserConfig['plugins'];
  external?: string[];
  formats?: LibraryOptions['formats'];
} = { entry: './src/index.ts' }): UserConfig {
  const root = options.root || process.cwd();

  return defineConfig({
    plugins: options.plugins || [],
    resolve: {
      alias: {
        '@': resolve(root, './src'),
      },
    },
    build: {
      lib: {
        entry: options.entry,
        name: options.name,
        fileName: options.fileName,
        formats: options.formats || ['es', 'cjs'],
      },
      rollupOptions: {
        external: options.external || [],
      },
      outDir: 'dist',
      emptyOutDir: true,
      sourcemap: true,
    },
  });
}

export default createLibraryConfig;
