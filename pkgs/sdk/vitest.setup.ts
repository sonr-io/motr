// Setup file for Vitest with jsdom environment
// Provides browser-like APIs including navigator

import { vi } from "vitest";

// Ensure navigator is available (jsdom provides this)
if (typeof navigator === "undefined") {
  global.navigator = {} as Navigator;
}

// Mock storage APIs if needed
if (typeof localStorage === "undefined") {
  global.localStorage = {
    getItem: vi.fn(),
    setItem: vi.fn(),
    removeItem: vi.fn(),
    clear: vi.fn(),
    length: 0,
    key: vi.fn(),
  } as Storage;
}

if (typeof sessionStorage === "undefined") {
  global.sessionStorage = {
    getItem: vi.fn(),
    setItem: vi.fn(),
    removeItem: vi.fn(),
    clear: vi.fn(),
    length: 0,
    key: vi.fn(),
  } as Storage;
}

// Mock WebAuthn APIs if needed for tests
if (typeof navigator !== "undefined" && !navigator.credentials) {
  Object.defineProperty(navigator, "credentials", {
    value: {
      create: vi.fn(),
      get: vi.fn(),
    },
    writable: true,
  });
}
