/**
 * Test setup file for Vitest
 */

import { expect, afterEach } from 'vitest';
import { cleanup } from '@testing-library/react';
import '@testing-library/jest-dom/vitest';

// Cleanup after each test
afterEach(() => {
  cleanup();
});

// Extend expect with @testing-library/jest-dom matchers
expect.extend({});
