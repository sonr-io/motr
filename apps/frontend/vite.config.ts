import { defineConfig, type Plugin } from 'vite'
import viteReact from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'
import { tanstackRouter } from '@tanstack/router-plugin/vite'
import { resolve } from 'node:path'

// Plugin to handle .js extension imports for @noble packages
function nobleHashesPlugin(): Plugin {
  return {
    name: 'noble-hashes-resolver',
    enforce: 'pre', // Run before other plugins
    resolveId(id, importer) {
      // Convert @noble/hashes/*.js imports to extensionless imports
      if (id.match(/@noble\/hashes\/.*\.js$/)) {
        const resolved = id.replace(/\.js$/, '');
        return this.resolve(resolved, importer, { skipSelf: true });
      }
      return null;
    },
  };
}

export default defineConfig({
  plugins: [
    nobleHashesPlugin() as any,
    tanstackRouter({ autoCodeSplitting: true }),
    viteReact(),
    tailwindcss(),
  ],
  resolve: {
    alias: {
      '@': resolve(__dirname, './src'),
    },
    dedupe: ['react', 'react-dom', '@noble/hashes', '@noble/secp256k1'],
  },
  optimizeDeps: {
    include: ['@sonr.io/ui', '@sonr-io/enclave'],
    exclude: ['@noble/hashes', '@noble/secp256k1', '@sonr.io/sdk'],
    esbuildOptions: {
      target: 'esnext',
    },
  },
  build: {
    commonjsOptions: {
      transformMixedEsModules: true,
    },
  },
})
