import { defineConfig } from 'vite';
import { tanstackStart } from '@tanstack/react-start/plugin/vite';
import viteReact from '@vitejs/plugin-react';
import viteTsConfigPaths from 'vite-tsconfig-paths';
import tailwindcss from '@tailwindcss/vite';

const config = defineConfig({
  plugins: [
    // Note: Cloudflare plugin disabled for SPA mode to avoid prerendering conflicts
    // cloudflare({ viteEnvironment: { name: 'ssr' } }),
    // this is the plugin that enables path aliases
    viteTsConfigPaths({
      projects: ['./tsconfig.json'],
    }),
    tailwindcss(),
    tanstackStart({
      spa: {
        enabled: true,
        prerender: {
          outputPath: '/_shell.html',
          crawlLinks: false,
          retryCount: 0,
        },
      },
    }),
    viteReact(),
  ],
});

export default config;
