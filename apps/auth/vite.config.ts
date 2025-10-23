import { resolve } from "node:path";
import { enclavePlugin } from "../../libs/enclave/dist/vite-plugin-enclave.js";
import { vaultPlugin } from "../../libs/vault/dist/vite-plugin-vault.js";
import tailwindcss from "@tailwindcss/vite";
import { tanstackRouter } from "@tanstack/router-plugin/vite";
import viteReact from "@vitejs/plugin-react";
import { defineConfig, type Plugin } from "vite";

// Plugin to handle .js extension imports for @noble packages
function nobleHashesPlugin(): Plugin {
  return {
    name: "noble-hashes-resolver",
    enforce: "pre", // Run before other plugins
    resolveId(id, importer) {
      // Convert @noble/hashes/*.js imports to extensionless imports
      if (id.match(/@noble\/hashes\/.*\.js$/)) {
        const resolved = id.replace(/\.js$/, "");
        return this.resolve(resolved, importer, { skipSelf: true });
      }
      return null;
    },
  };
}

// Plugin to handle payment method manifest endpoint
function paymentMethodPlugin(): Plugin {
  return {
    name: "payment-method-handler",
    configureServer(server) {
      server.middlewares.use((req, res, next) => {
        // Handle /pay and /pay/ requests - serve payment manifest
        if (req.url === "/pay" || req.url === "/pay/") {
          const protocol = req.headers["x-forwarded-proto"] || "http";
          const host = req.headers.host || "localhost:6165";
          const origin = `${protocol}://${host}`;

          const manifest = {
            default_applications: [`${origin}/site.webmanifest`],
            supported_origins: [origin],
          };

          res.setHeader("Content-Type", "application/json");
          res.setHeader("Access-Control-Allow-Origin", "*");
          res.setHeader(
            "Link",
            `<${origin}/pay/payment-manifest.json>; rel="payment-method-manifest"`,
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
    nobleHashesPlugin() as any,
    paymentMethodPlugin() as any,
    enclavePlugin({
      wasmPath: resolve(__dirname, "../../libs/enclave/dist/enclave.wasm"),
    }),
    vaultPlugin({
      copyToPublic: true,
      registerServiceWorker: false, // Disable auto-registration, we'll do it manually
      scope: "/",
      updateCheckInterval: 3600000,
      debug: true,
    }),
    tanstackRouter({ autoCodeSplitting: true }),
    viteReact(),
    tailwindcss(),
  ],
  server: {
    port: 3000,
    strictPort: true,
    fs: {
      allow: [
        // Allow serving files from the app directory
        resolve(__dirname, "."),
        // Allow serving files from the monorepo root
        resolve(__dirname, "../.."),
      ],
    },
  },
  resolve: {
    alias: {
      "@": resolve(__dirname, "./src"),
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
  build: {
    commonjsOptions: {
      transformMixedEsModules: true,
    },
  },
});
