/**
 * Simplified Sonr Browser Vite Plugin
 * Temporary stub to fix TypeScript errors
 */

import type { Plugin } from "vite";

export interface SonrBrowserPluginOptions {
  enableEnclave?: boolean;
  enclaveWasmPath?: string;
  enableVault?: boolean;
  vaultWasmPath?: string;
  debug?: boolean;
  copyToPublic?: boolean;
  enableSharedWorkers?: boolean;
  workerOutDir?: string;
  enableServiceWorker?: boolean;
  enableWasmStreaming?: boolean;
}

export function sonrBrowserPlugin(_options: SonrBrowserPluginOptions = {}): Plugin {
  return {
    name: "vite-plugin-sonr-browser",
    config() {
      return {
        optimizeDeps: {
          exclude: ["@sonr.io/browser", "@sonr.io/enclave", "@sonr.io/vault", "@sonr.io/sdk"],
          esbuildOptions: {
            target: "esnext",
            supported: {
              "top-level-await": true,
            },
          },
        },
        worker: {
          format: "es",
        },
        build: {
          target: "esnext",
        },
        server: {
          headers: {
            "Cross-Origin-Embedder-Policy": "require-corp",
            "Cross-Origin-Opener-Policy": "same-origin",
          },
        },
      };
    },
  };
}
