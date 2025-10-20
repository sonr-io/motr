import { defineConfig } from "vitest/config";

export default defineConfig({
  test: {
    // Use jsdom for browser-like environment with navigator API
    environment: "jsdom",
    globals: true,
    include: ["src/**/*.test.ts", "src/**/*.spec.ts"],
    exclude: ["node_modules", "dist", "**/*.e2e.test.ts"],
    setupFiles: ["./vitest.setup.ts"],
  },
});
