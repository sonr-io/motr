/**
 * Test setup file for vitest
 */

import { cleanup } from "@testing-library/react";
import { afterEach } from "vitest";
import "fake-indexeddb/auto";

// Cleanup after each test
afterEach(() => {
  cleanup();
});
