/**
 * Service Worker Registration Helper
 *
 * Provides a modern, type-safe API for registering and managing Service Workers
 * following W3C standards and MDN best practices for 2025.
 *
 * Features:
 * - Automatic update checking and lifecycle management
 * - Type-safe event handling
 * - Offline detection and notifications
 * - Update prompts with user control
 * - Background sync support
 *
 * @see https://developer.mozilla.org/en-US/docs/Web/API/Service_Worker_API
 */

export interface RegisterSWOptions {
  /**
   * Service Worker scope
   * @default '/'
   */
  scope?: string;

  /**
   * Update check interval in milliseconds
   * @default 3600000 (1 hour)
   */
  updateCheckInterval?: number;

  /**
   * Callback when a new service worker is ready to activate
   */
  onNeedRefresh?: () => void;

  /**
   * Callback when the app is ready to work offline
   */
  onOfflineReady?: () => void;

  /**
   * Callback when service worker registration succeeds
   */
  onRegistered?: (registration: ServiceWorkerRegistration) => void;

  /**
   * Callback when service worker registration fails
   */
  onRegisterError?: (error: Error) => void;

  /**
   * Callback when service worker is updated
   */
  onUpdated?: (registration: ServiceWorkerRegistration) => void;

  /**
   * Automatically reload page when update is available
   * @default false
   */
  immediate?: boolean;

  /**
   * Enable automatic update without user confirmation
   * @default false
   */
  autoUpdate?: boolean;
}

export interface ServiceWorkerController {
  /**
   * Triggers the waiting service worker to skip waiting and become active
   */
  skipWaiting: () => Promise<void>;

  /**
   * Manually checks for service worker updates
   */
  update: () => Promise<void>;

  /**
   * Unregisters the service worker
   */
  unregister: () => Promise<boolean>;

  /**
   * Sends a message to the service worker
   */
  postMessage: (message: any) => void;

  /**
   * Gets the current service worker version
   */
  getVersion: () => Promise<string | null>;

  /**
   * Clears all caches
   */
  clearCache: () => Promise<void>;

  /**
   * Caches specific URLs
   */
  cacheUrls: (urls: string[]) => Promise<void>;

  /**
   * The current service worker registration
   */
  registration: ServiceWorkerRegistration | null;
}

/**
 * Registers a Service Worker with comprehensive lifecycle management
 *
 * @example
 * ```typescript
 * import { registerSW } from '@sonr.io/vault/register-sw'
 *
 * const controller = registerSW({
 *   scope: '/',
 *   onNeedRefresh: () => {
 *     console.log('New version available!')
 *   },
 *   onOfflineReady: () => {
 *     console.log('App ready to work offline')
 *   }
 * })
 *
 * // Later, trigger update
 * await controller.skipWaiting()
 * ```
 */
export function registerSW(
  options: RegisterSWOptions = {},
): ServiceWorkerController {
  const {
    scope = "/",
    updateCheckInterval = 3600000,
    onNeedRefresh,
    onOfflineReady,
    onRegistered,
    onRegisterError,
    onUpdated,
    immediate = false,
    autoUpdate = false,
  } = options;

  let registration: ServiceWorkerRegistration | null = null;
  let updateInterval: number | null = null;

  // Check if Service Worker is supported
  if (!("serviceWorker" in navigator)) {
    const error = new Error("Service Worker not supported in this browser");
    onRegisterError?.(error);

    return createDummyController();
  }

  // Register the service worker
  window.addEventListener("load", async () => {
    try {
      registration = await navigator.serviceWorker.register("/sw.js", {
        scope,
        updateViaCache: "none",
      });

      console.log(
        "[Motor Vault] Service Worker registered:",
        registration.scope,
      );

      // Call registered callback
      onRegistered?.(registration);

      // Set up periodic update checks
      if (updateCheckInterval > 0) {
        updateInterval = window.setInterval(() => {
          registration?.update();
        }, updateCheckInterval);
      }

      // Handle service worker updates
      registration.addEventListener("updatefound", () => {
        const newWorker = registration?.installing;

        if (!newWorker) return;

        newWorker.addEventListener("statechange", () => {
          if (
            newWorker.state === "installed" &&
            navigator.serviceWorker.controller
          ) {
            // New service worker is ready
            console.log("[Motor Vault] New Service Worker available");

            if (autoUpdate) {
              // Automatically activate new service worker
              newWorker.postMessage({ type: "SKIP_WAITING" });
            } else {
              // Notify about available update
              onNeedRefresh?.();

              if (immediate) {
                newWorker.postMessage({ type: "SKIP_WAITING" });
                window.location.reload();
              }
            }

            onUpdated?.(registration!);
          } else if (
            newWorker.state === "activated" &&
            !navigator.serviceWorker.controller
          ) {
            // First time activation (no previous controller)
            console.log("[Motor Vault] Service Worker activated");
            onOfflineReady?.();
          }
        });
      });

      // Handle controller changes (when new SW becomes active)
      navigator.serviceWorker.addEventListener("controllerchange", () => {
        console.log("[Motor Vault] Service Worker controller changed");

        if (immediate || autoUpdate) {
          window.location.reload();
        }
      });

      // Check if already controlled (existing SW)
      if (navigator.serviceWorker.controller) {
        onOfflineReady?.();
      }
    } catch (error) {
      console.error("[Motor Vault] Service Worker registration failed:", error);
      onRegisterError?.(error as Error);
    }
  });

  // Create controller API
  const controller: ServiceWorkerController = {
    async skipWaiting() {
      if (!registration) {
        throw new Error("Service Worker not registered");
      }

      const waiting = registration.waiting;

      if (!waiting) {
        return;
      }

      // Send skip waiting message
      waiting.postMessage({ type: "SKIP_WAITING" });

      // Wait for controller change
      await new Promise<void>((resolve) => {
        navigator.serviceWorker.addEventListener(
          "controllerchange",
          () => {
            resolve();
          },
          { once: true },
        );
      });

      // Reload the page
      window.location.reload();
    },

    async update() {
      if (!registration) {
        throw new Error("Service Worker not registered");
      }

      await registration.update();
      console.log("[Motor Vault] Service Worker update check completed");
    },

    async unregister() {
      if (!registration) {
        return false;
      }

      // Clear update interval
      if (updateInterval !== null) {
        clearInterval(updateInterval);
        updateInterval = null;
      }

      const result = await registration.unregister();
      console.log("[Motor Vault] Service Worker unregistered:", result);

      return result;
    },

    postMessage(message: any) {
      if (!navigator.serviceWorker.controller) {
        console.warn("[Motor Vault] No active Service Worker controller");
        return;
      }

      navigator.serviceWorker.controller.postMessage(message);
    },

    async getVersion() {
      return new Promise<string | null>((resolve) => {
        if (!navigator.serviceWorker.controller) {
          resolve(null);
          return;
        }

        const channel = new MessageChannel();

        channel.port1.onmessage = (event: MessageEvent) => {
          resolve(event.data.version || null);
        };

        navigator.serviceWorker.controller.postMessage(
          { type: "GET_VERSION" },
          [channel.port2],
        );

        // Timeout after 5 seconds
        setTimeout(() => resolve(null), 5000);
      });
    },

    async clearCache() {
      this.postMessage({ type: "CLEAR_CACHE" });

      // Also clear caches from client side
      if ("caches" in window) {
        const cacheKeys = await caches.keys();
        await Promise.all(cacheKeys.map((key) => caches.delete(key)));
      }

      console.log("[Motor Vault] All caches cleared");
    },

    async cacheUrls(urls: string[]) {
      this.postMessage({ type: "CACHE_URLS", urls });
      console.log(`[Motor Vault] Requested caching of ${urls.length} URLs`);
    },

    get registration() {
      return registration;
    },
  };

  return controller;
}

/**
 * Creates a dummy controller for environments without Service Worker support
 */
function createDummyController(): ServiceWorkerController {
  const noop = async () => {};
  const noopReturn = async () => false;

  return {
    skipWaiting: noop,
    update: noop,
    unregister: noopReturn,
    postMessage: () => {},
    getVersion: async () => null,
    clearCache: noop,
    cacheUrls: noop,
    registration: null,
  };
}

/**
 * Utility function to check if Service Worker is supported
 */
export function isServiceWorkerSupported(): boolean {
  return "serviceWorker" in navigator;
}

/**
 * Utility function to check if the page is controlled by a Service Worker
 */
export function isControlled(): boolean {
  return "serviceWorker" in navigator && !!navigator.serviceWorker.controller;
}

/**
 * Utility function to get the current Service Worker registration
 */
export async function getRegistration(): Promise<
  ServiceWorkerRegistration | undefined
> {
  if (!("serviceWorker" in navigator)) {
    return undefined;
  }

  return navigator.serviceWorker.getRegistration();
}

/**
 * Utility function to unregister all service workers
 */
export async function unregisterAll(): Promise<void> {
  if (!("serviceWorker" in navigator)) {
    return;
  }

  const registrations = await navigator.serviceWorker.getRegistrations();

  await Promise.all(
    registrations.map((registration) => registration.unregister()),
  );

  console.log("[Motor Vault] All Service Workers unregistered");
}
