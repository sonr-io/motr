/**
 * Test setup for @sonr.io/browser package
 */

import 'fake-indexeddb/auto';

// Mock WebAuthn API if needed
if (typeof global.navigator === 'undefined') {
  (global as any).navigator = {};
}

if (!global.navigator.credentials) {
  (global.navigator as any).credentials = {
    create: vi.fn(),
    get: vi.fn(),
  };
}
