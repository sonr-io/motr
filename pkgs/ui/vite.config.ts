import { defineConfig } from 'vite';
import { resolve } from 'path';
import react from '@vitejs/plugin-react';
import svgr from 'vite-plugin-svgr';

export default defineConfig({
  plugins: [
    react(),
    svgr({
      svgrOptions: {
        icon: true,
        typescript: false,
        exportType: 'named',
        ref: true,
        svgo: true,
        svgoConfig: {
          plugins: [
            {
              name: 'preset-default',
              params: {
                overrides: {
                  removeViewBox: false,
                },
              },
            },
          ],
        },
      },
      include: '**/*.svg',
    }),
  ],
  esbuild: {
    jsx: 'automatic',
  },
  build: {
    emptyOutDir: false,
    lib: {
      entry: resolve(__dirname, 'src/components/index.ts'),
      name: 'SonrUI',
      formats: ['es', 'cjs'],
      fileName: (format) => `index.${format === 'es' ? 'esm' : 'cjs'}.js`,
    },
    rollupOptions: {
      external: ['react', 'react-dom', 'react/jsx-runtime', 'lucide-react', 'lottie-react'],
      output: {
        globals: {
          react: 'React',
          'react-dom': 'ReactDOM',
          'react/jsx-runtime': 'jsxRuntime',
          'lucide-react': 'LucideReact',
          'lottie-react': 'LottieReact',
        },
        assetFileNames: (assetInfo) => {
          if (assetInfo.name?.endsWith('.json')) {
            return 'assets/[name][extname]';
          }
          return 'assets/[name]-[hash][extname]';
        },
      },
    },
  },
  json: {
    stringify: false,
  },
});
