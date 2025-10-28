import { defineConfig } from "vite";
import { resolve } from "node:path";

export default defineConfig({
  build: {
    lib: {
      entry: {
        index: resolve(__dirname, "src/index.ts"),
        "client/index": resolve(__dirname, "src/client/browser-client.ts"),
        "workers/index": resolve(__dirname, "src/workers/index.ts"),
        "web-apis/index": resolve(__dirname, "src/web-apis/index.ts"),
        "web-apis/elements/index": resolve(__dirname, "src/web-apis/elements/index.ts"),
        "plugin/vite-plugin": resolve(__dirname, "src/plugin/vite-plugin.ts"),
      },
      formats: ["es"],
      fileName: (_format, entryName) => `${entryName}.js`,
    },
    rollupOptions: {
      external: [
        "@sonr.io/enclave",
        "@sonr.io/enclave/worker-client",
        "@sonr.io/vault",
        "@sonr.io/sdk",
        "@sonr.io/sdk/client",
        "@tanstack/query-core",
        "dexie",
        "vite",
        // Node.js built-ins (used by vite-plugin)
        "node:fs",
        "node:path",
        "node:url",
        "fs",
        "path",
        "url",
      ],
      output: {
        preserveModules: false,
        exports: "named",
      },
    },
    target: "esnext",
    minify: false,
    sourcemap: true,
  },
  resolve: {
    alias: {
      "@": resolve(__dirname, "src"),
    },
  },
  worker: {
    format: "es",
    plugins: () => [],
  },
  optimizeDeps: {
    exclude: ["@sonr.io/enclave", "@sonr.io/vault", "@sonr.io/sdk"],
  },
});
