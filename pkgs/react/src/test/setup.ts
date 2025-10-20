/**
 * Test setup for @sonr.io/react
 */

import { cleanup } from '@testing-library/react';
import { afterEach, vi } from 'vitest';
import '@testing-library/jest-dom';

// Setup fake IndexedDB for tests
// @ts-expect-error - fake-indexeddb types
import FDBFactory from 'fake-indexeddb/lib/FDBFactory';
// @ts-expect-error - fake-indexeddb types
import FDBKeyRange from 'fake-indexeddb/lib/FDBKeyRange';

globalThis.indexedDB = new FDBFactory() as IDBFactory;
globalThis.IDBKeyRange = FDBKeyRange as typeof IDBKeyRange;

// Mock WebAuthn API
const mockPublicKeyCredential = {
  isUserVerifyingPlatformAuthenticatorAvailable: vi.fn().mockResolvedValue(true),
  isConditionalMediationAvailable: vi.fn().mockResolvedValue(true),
};

Object.defineProperty(global, 'PublicKeyCredential', {
  writable: true,
  value: mockPublicKeyCredential,
});

// Mock navigator.credentials
Object.defineProperty(global.navigator, 'credentials', {
  writable: true,
  value: {
    create: vi.fn(),
    get: vi.fn(),
  },
});

// Cleanup after each test
afterEach(() => {
  cleanup();
  vi.clearAllMocks();
});
