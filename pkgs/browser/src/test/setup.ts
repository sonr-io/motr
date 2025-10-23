/**
 * Test setup file
 *
 * Configures the test environment with necessary globals and mocks.
 */

// Mock Web Worker for tests
class MockWorker {
  onmessage: ((event: MessageEvent) => void) | null = null;
  onerror: ((event: ErrorEvent) => void) | null = null;

  constructor(public url: string | URL, public options?: WorkerOptions) {}

  postMessage(message: any) {
    // Mock implementation
  }

  terminate() {
    // Mock implementation
  }

  addEventListener(type: string, listener: EventListener) {
    // Mock implementation
  }

  removeEventListener(type: string, listener: EventListener) {
    // Mock implementation
  }

  dispatchEvent(event: Event): boolean {
    return true;
  }
}

// Mock SharedWorker if not available
class MockSharedWorker {
  port: MessagePort;

  constructor(public url: string | URL, public options?: string | WorkerOptions) {
    // Create a mock MessagePort
    this.port = {
      postMessage: () => {},
      start: () => {},
      close: () => {},
      addEventListener: () => {},
      removeEventListener: () => {},
      dispatchEvent: () => true,
    } as MessagePort;
  }
}

// Setup global mocks
if (typeof Worker === "undefined") {
  (globalThis as any).Worker = MockWorker;
}

if (typeof SharedWorker === "undefined") {
  (globalThis as any).SharedWorker = MockSharedWorker;
}

// Mock IndexedDB if not available
if (typeof indexedDB === "undefined") {
  // Vitest with happy-dom should provide this, but just in case
  const { indexedDB } = await import("fake-indexeddb");
  (globalThis as any).indexedDB = indexedDB;
}

// Mock crypto if not available
if (typeof crypto === "undefined" || !crypto.subtle) {
  (globalThis as any).crypto = {
    subtle: {
      generateKey: async () => ({}),
      sign: async () => new ArrayBuffer(64),
      verify: async () => true,
      digest: async () => new ArrayBuffer(32),
    },
    getRandomValues: (arr: Uint8Array) => {
      for (let i = 0; i < arr.length; i++) {
        arr[i] = Math.floor(Math.random() * 256);
      }
      return arr;
    },
  };
}

// Setup custom elements registry if not available
if (typeof customElements === "undefined") {
  (globalThis as any).customElements = {
    define: () => {},
    get: () => undefined,
    whenDefined: async () => {},
  };
}
