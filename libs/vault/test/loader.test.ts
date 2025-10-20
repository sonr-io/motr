import { describe, expect, it, vi } from 'vitest';
import { isServiceWorkerRegistered, isServiceWorkerSupported, loadVault } from '../src/loader.js';

describe('Vault Loader', () => {
  it('should check if ServiceWorker is supported', () => {
    expect(isServiceWorkerSupported()).toBe(true);
  });

  it('should check if ServiceWorker is registered', () => {
    expect(isServiceWorkerRegistered()).toBe(false);
  });

  it('should load vault via ServiceWorker', async () => {
    // Mock the ServiceWorker registration
    const mockRegister = vi.fn().mockResolvedValue({});
    Object.defineProperty(navigator, 'serviceWorker', {
      value: {
        register: mockRegister,
        controller: null,
      },
      writable: true,
    });

    await loadVault({ debug: false });

    expect(mockRegister).toHaveBeenCalledWith('/vault/sw.js');
  });
});
