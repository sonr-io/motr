import { resolve } from "node:path";
import { cloudflare } from "@cloudflare/vite-plugin";
import tailwindcss from "@tailwindcss/vite";
import { tanstackRouter } from "@tanstack/router-plugin/vite";
import viteReact from "@vitejs/plugin-react";
import { defineConfig, type Plugin } from "vite";
import { enclavePlugin } from "./libs/enclave/dist/vite-plugin-enclave.js";
import { vaultPlugin } from "./libs/vault/dist/vite-plugin-vault.js";

// Plugin to handle .js extension imports for @noble packages
function nobleHashesPlugin(): Plugin {
  return {
    name: "noble-hashes-resolver",
    enforce: "pre",
    resolveId(id, importer) {
      if (id.match(/@noble\/hashes\/.*\.js$/)) {
        const resolved = id.replace(/\.js$/, "");
        return this.resolve(resolved, importer, { skipSelf: true });
      }
      return null;
    },
  };
}

// Plugin to handle payment method manifest endpoint (auth app only)
function paymentMethodPlugin(): Plugin {
  return {
    name: "payment-method-handler",
    configureServer(server) {
      server.middlewares.use((req, res, next) => {
        if (req.url === "/auth/pay" || req.url === "/auth/pay/") {
          const protocol = req.headers["x-forwarded-proto"] || "http";
          const host = req.headers.host || "localhost:5173";
          const origin = `${protocol}://${host}`;

          const manifest = {
            default_applications: [`${origin}/auth/site.webmanifest`],
            supported_origins: [origin],
          };

          res.setHeader("Content-Type", "application/json");
          res.setHeader("Access-Control-Allow-Origin", "*");
          res.setHeader(
            "Link",
            `<${origin}/auth/pay/payment-manifest.json>; rel="payment-method-manifest"`,
          );
          res.statusCode = 200;
          res.end(JSON.stringify(manifest, null, 2));
          return;
        }
        next();
      });
    },
  };
}

export default defineConfig({
  plugins: [
    // Cloudflare integration - handles Workers + Vite dev server
    cloudflare(),

    // Auth-specific plugins
    nobleHashesPlugin() as any,
    paymentMethodPlugin() as any,
    enclavePlugin({
      wasmPath: resolve(__dirname, "./libs/enclave/dist/enclave.wasm"),
    }),
    vaultPlugin({
      copyToPublic: true,
      registerServiceWorker: false,
      scope: "/auth/",
      updateCheckInterval: 3600000,
      debug: true,
    }),

    // Shared plugins for all apps
    tanstackRouter({ autoCodeSplitting: true }),
    viteReact(),
    tailwindcss(),
  ],

  // Multi-page application setup
  build: {
    rollupOptions: {
      input: {
        auth: resolve(__dirname, "apps/auth/index.html"),
        console: resolve(__dirname, "apps/console/index.html"),
        profile: resolve(__dirname, "apps/profile/index.html"),
        search: resolve(__dirname, "apps/search/index.html"),
      },
      output: {
        // Organize by app with stable entry filenames
        entryFileNames: (chunkInfo) => {
          // Determine which app this chunk belongs to
          const appMatch = chunkInfo.facadeModuleId?.match(
            /apps\/(auth|console|profile|search)\//,
          );
          const app = appMatch ? appMatch[1] : "shared";
          return `${app}/assets/[name].js`;
        },
        // Shared chunks go to /shared/ directory
        chunkFileNames: (chunkInfo) => {
          // Vendor chunks are shared across all apps
          if (
            chunkInfo.name.includes("vendor") ||
            chunkInfo.isDynamicEntry === false
          ) {
            return "shared/[name]-[hash].js";
          }
          // App-specific chunks stay with the app
          const appMatch = chunkInfo.facadeModuleId?.match(
            /apps\/(auth|console|profile|search)\//,
          );
          const app = appMatch ? appMatch[1] : "shared";
          return `${app}/assets/[name]-[hash].js`;
        },
        assetFileNames: (assetInfo) => {
          const name = assetInfo.name || "";
          // CSS files go with their app
          if (name.endsWith(".css")) {
            // Try to determine app from the source
            return "[name]/assets/[name].[ext]";
          }
          // Other assets (images, fonts, etc.)
          return "assets/[name].[ext]";
        },
        // Manual chunks for vendor splitting
        manualChunks: {
          "vendor-react": ["react", "react-dom"],
          "vendor-router": ["@tanstack/react-router"],
          "vendor-query": ["@tanstack/react-query"],
          "vendor-ui": ["@sonr.io/ui", "sonner", "motion"],
        },
      },
    },
    outDir: "dist",
    emptyOutDir: true,
    // Target modern browsers for smaller bundles
    target: "esnext",
    // Increase chunk size warning limit
    chunkSizeWarningLimit: 1000,
    commonjsOptions: {
      transformMixedEsModules: true,
    },
  },

  resolve: {
    alias: {
      "@auth": resolve(__dirname, "./apps/auth/src"),
      "@console": resolve(__dirname, "./apps/console/src"),
      "@profile": resolve(__dirname, "./apps/profile/src"),
      "@search": resolve(__dirname, "./apps/search/src"),
    },
    dedupe: ["react", "react-dom", "@noble/hashes", "@noble/secp256k1"],
  },

  optimizeDeps: {
    include: ["@sonr.io/ui", "@sonr-io/enclave"],
    exclude: ["@noble/hashes", "@noble/secp256k1", "@sonr.io/sdk"],
    esbuildOptions: {
      target: "esnext",
    },
  },

  server: {
    port: 5173,
    strictPort: false,
    fs: {
      allow: [resolve(__dirname, ".")],
    },
  },
});
