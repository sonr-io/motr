import { defineConfig } from "vitest/config";

export default defineConfig({
  test: {
    // Use jsdom for browser-like environment with navigator API
    environment: "jsdom",
    globals: true,
    setupFiles: ["./vitest.setup.ts"],
    include: ["src/**/*.test.ts"],
    exclude: ["node_modules", "dist", "**/*.e2e.test.ts"],
  },
});
