import { vi } from "vitest";

// Vitest setup file for @sonr.io/vault

// Mock ServiceWorker if not available
Object.defineProperty(navigator, "serviceWorker", {
  value: {
    register: vi.fn().mockResolvedValue({}),
    controller: null,
  },
  writable: true,
});

// Mock WebAssembly if needed
Object.defineProperty(global, "WebAssembly", {
  value: {
    instantiate: vi.fn(),
  },
  writable: true,
});

// Global test utilities
global.console = {
  ...console,
  // Suppress console logs in tests unless explicitly needed
  log: vi.fn(),
  warn: vi.fn(),
  error: vi.fn(),
};
