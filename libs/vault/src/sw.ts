/**
 * Motor Vault Service Worker
 *
 * Modern Service Worker implementation following W3C standards and MDN best practices.
 * Provides WASM HTTP server capabilities, intelligent caching, and offline support.
 *
 * @see https://developer.mozilla.org/en-US/docs/Web/API/Service_Worker_API
 * @version 2025
 */

/// <reference lib="webworker" />

declare const self: ServiceWorkerGlobalScope;

// Define SyncEvent interface for Background Sync API
interface SyncEvent extends ExtendableEvent {
  readonly lastChance: boolean;
  readonly tag: string;
}

// Define PaymentRequestEvent interface for Payment Handler API
interface PaymentRequestEvent extends ExtendableEvent {
  readonly topOrigin: string;
  readonly paymentRequestOrigin: string;
  readonly paymentRequestId: string;
  readonly methodData: PaymentMethodData[];
  readonly total: PaymentCurrencyAmount;
  readonly modifiers?: PaymentDetailsModifier[];
  readonly instrumentKey: string;
  openWindow(url: string): Promise<WindowClient | null>;
  respondWith(response: Promise<PaymentHandlerResponse>): void;
  changePaymentMethod(
    methodName: string,
    methodDetails?: any,
  ): Promise<PaymentRequestDetailsUpdate | null>;
  changeShippingAddress(
    shippingAddress: PaymentAddress,
  ): Promise<PaymentRequestDetailsUpdate | null>;
  changeShippingOption(
    shippingOption: string,
  ): Promise<PaymentRequestDetailsUpdate | null>;
}

interface PaymentMethodData {
  supportedMethods: string;
  data?: any;
}

interface PaymentCurrencyAmount {
  currency: string;
  value: string;
}

interface PaymentDetailsModifier {
  supportedMethods: string;
  total?: PaymentItem;
  additionalDisplayItems?: PaymentItem[];
  data?: any;
}

interface PaymentItem {
  label: string;
  amount: PaymentCurrencyAmount;
}

interface PaymentAddress {
  country?: string;
  addressLine?: string[];
  region?: string;
  city?: string;
  dependentLocality?: string;
  postalCode?: string;
  sortingCode?: string;
  organization?: string;
  recipient?: string;
  phone?: string;
}

interface PaymentRequestDetailsUpdate {
  total?: PaymentItem;
  modifiers?: PaymentDetailsModifier[];
  shippingOptions?: PaymentShippingOption[];
  error?: string;
}

interface PaymentShippingOption {
  id: string;
  label: string;
  amount: PaymentCurrencyAmount;
  selected?: boolean;
}

interface PaymentHandlerResponse {
  methodName: string;
  details: any;
}

// Configuration
const SW_VERSION = "1.0.0";
const CACHE_VERSION = `motor-vault-v${SW_VERSION}`;
const CACHE_NAME = `${CACHE_VERSION}-${Date.now()}`;
const PRECACHE_ASSETS = ["/vault.wasm", "/wasm_exec.js"];

// Vault WASM state
let vaultInitialized = false;
let vaultReady = false;

// Cache strategies
const CACHE_STRATEGIES = {
  NETWORK_FIRST: "network-first",
  CACHE_FIRST: "cache-first",
  STALE_WHILE_REVALIDATE: "stale-while-revalidate",
} as const;

// Request patterns for different caching strategies
const STRATEGY_PATTERNS = {
  [CACHE_STRATEGIES.CACHE_FIRST]: [
    /\.wasm$/,
    /wasm_exec\.js$/,
    /\.(png|jpg|jpeg|svg|gif|webp)$/,
    /\.(woff|woff2|ttf|eot)$/,
  ],
  [CACHE_STRATEGIES.NETWORK_FIRST]: [/\/api\//, /\/vault\//],
  [CACHE_STRATEGIES.STALE_WHILE_REVALIDATE]: [/\.(js|css)$/],
};

/**
 * Install Event Handler
 * Triggered when service worker is first installed
 */
self.addEventListener("install", (event: ExtendableEvent) => {
  console.log(`[Motor Vault SW] Installing version ${SW_VERSION}`);

  event.waitUntil(
    (async () => {
      try {
        // Pre-cache critical assets
        const cache = await caches.open(CACHE_NAME);
        await cache.addAll(PRECACHE_ASSETS);

        console.log("[Motor Vault SW] Pre-cached critical assets");

        // Initialize vault WASM
        await initializeVault();

        // Skip waiting to activate immediately
        await self.skipWaiting();

        console.log("[Motor Vault SW] Installation complete");
      } catch (error) {
        console.error("[Motor Vault SW] Installation failed:", error);
        throw error;
      }
    })(),
  );
});

/**
 * Activate Event Handler
 * Triggered when service worker becomes active
 */
self.addEventListener("activate", (event: ExtendableEvent) => {
  console.log(`[Motor Vault SW] Activating version ${SW_VERSION}`);

  event.waitUntil(
    (async () => {
      try {
        // Clean up old caches
        const cacheKeys = await caches.keys();
        const oldCaches = cacheKeys.filter(
          (key) => key.startsWith("motor-vault-") && key !== CACHE_NAME,
        );

        await Promise.all(
          oldCaches.map((key) => {
            console.log(`[Motor Vault SW] Deleting old cache: ${key}`);
            return caches.delete(key);
          }),
        );

        // Take control of all clients immediately
        await self.clients.claim();

        console.log("[Motor Vault SW] Activation complete");
      } catch (error) {
        console.error("[Motor Vault SW] Activation failed:", error);
        throw error;
      }
    })(),
  );
});

/**
 * Fetch Event Handler
 * Intercepts all network requests
 */
self.addEventListener("fetch", (event: FetchEvent) => {
  const { request } = event;
  const url = new URL(request.url);

  // Skip chrome-extension and other non-http(s) protocols
  if (!url.protocol.startsWith("http")) {
    return;
  }

  // Route payment API requests to vault WASM HTTP server
  if (
    url.pathname.startsWith("/api/payment/") ||
    url.pathname.startsWith("/payment/") ||
    url.pathname.startsWith("/.well-known/")
  ) {
    event.respondWith(handleVaultRequest(request));
    return;
  }

  // Skip non-GET requests for other paths
  if (request.method !== "GET") {
    return;
  }

  // Determine caching strategy based on URL patterns
  const strategy = getCachingStrategy(url.pathname);

  event.respondWith(handleFetchWithStrategy(request, strategy));
});

/**
 * Message Event Handler
 * Handles messages from clients
 */
self.addEventListener("message", (event: ExtendableMessageEvent) => {
  const { data } = event;

  switch (data.type) {
    case "SKIP_WAITING":
      self.skipWaiting();
      break;

    case "CLAIM_CLIENTS":
      self.clients.claim();
      break;

    case "CLEAR_CACHE":
      event.waitUntil(clearCache(data.cacheName));
      break;

    case "GET_VERSION":
      event.ports[0]?.postMessage({ version: SW_VERSION });
      break;

    case "CACHE_URLS":
      event.waitUntil(cacheUrls(data.urls));
      break;

    default:
      console.warn(`[Motor Vault SW] Unknown message type: ${data.type}`);
  }
});

/**
 * Sync Event Handler (Background Sync API)
 * Handles background synchronization
 */
self.addEventListener("sync", (event: Event) => {
  const syncEvent = event as unknown as SyncEvent;
  console.log(`[Motor Vault SW] Background sync: ${syncEvent.tag}`);

  if (syncEvent.tag === "vault-sync") {
    syncEvent.waitUntil(syncVaultData());
  }
});

/**
 * Push Event Handler (Push Notifications)
 * Handles push notifications
 */
self.addEventListener("push", (event: PushEvent) => {
  const options = {
    body: event.data?.text() || "New update available",
    icon: "/icons/icon-192x192.png",
    badge: "/icons/badge-72x72.png",
    vibrate: [200, 100, 200],
    data: {
      dateOfArrival: Date.now(),
      primaryKey: 1,
    },
    actions: [
      {
        action: "explore",
        title: "View Details",
      },
      {
        action: "close",
        title: "Dismiss",
      },
    ],
  };

  event.waitUntil(self.registration.showNotification("Motor Vault", options));
});

/**
 * Notification Click Handler
 * Handles notification click events
 */
self.addEventListener("notificationclick", (event: NotificationEvent) => {
  console.log("[Motor Vault SW] Notification clicked:", event.action);

  event.notification.close();

  if (event.action === "explore") {
    event.waitUntil(self.clients.openWindow("/"));
  }
});

// Helper Functions

/**
 * Determines the appropriate caching strategy for a given pathname
 */
function getCachingStrategy(pathname: string): string {
  for (const [strategy, patterns] of Object.entries(STRATEGY_PATTERNS)) {
    if (patterns.some((pattern) => pattern.test(pathname))) {
      return strategy;
    }
  }

  // Default to stale-while-revalidate
  return CACHE_STRATEGIES.STALE_WHILE_REVALIDATE;
}

/**
 * Handles fetch requests with the specified caching strategy
 */
async function handleFetchWithStrategy(
  request: Request,
  strategy: string,
): Promise<Response> {
  switch (strategy) {
    case CACHE_STRATEGIES.CACHE_FIRST:
      return cacheFirst(request);

    case CACHE_STRATEGIES.NETWORK_FIRST:
      return networkFirst(request);

    case CACHE_STRATEGIES.STALE_WHILE_REVALIDATE:
      return staleWhileRevalidate(request);

    default:
      return fetch(request);
  }
}

/**
 * Cache First Strategy
 * Returns cached response if available, otherwise fetches from network
 */
async function cacheFirst(request: Request): Promise<Response> {
  const cachedResponse = await caches.match(request);

  if (cachedResponse) {
    return cachedResponse;
  }

  try {
    const networkResponse = await fetch(request);

    // Cache successful responses
    if (networkResponse.ok) {
      const cache = await caches.open(CACHE_NAME);
      cache.put(request, networkResponse.clone());
    }

    return networkResponse;
  } catch (error) {
    console.error("[Motor Vault SW] Cache-first fetch failed:", error);
    return new Response("Network error", {
      status: 408,
      statusText: "Request Timeout",
    });
  }
}

/**
 * Network First Strategy
 * Tries network first, falls back to cache on failure
 */
async function networkFirst(request: Request): Promise<Response> {
  try {
    const networkResponse = await fetch(request);

    // Cache successful responses
    if (networkResponse.ok) {
      const cache = await caches.open(CACHE_NAME);
      cache.put(request, networkResponse.clone());
    }

    return networkResponse;
  } catch (error) {
    console.warn(
      "[Motor Vault SW] Network request failed, trying cache:",
      error,
    );

    const cachedResponse = await caches.match(request);

    if (cachedResponse) {
      return cachedResponse;
    }

    return new Response("Offline", {
      status: 503,
      statusText: "Service Unavailable",
    });
  }
}

/**
 * Stale While Revalidate Strategy
 * Returns cached response immediately while fetching fresh data in background
 */
async function staleWhileRevalidate(request: Request): Promise<Response> {
  const cachedResponse = await caches.match(request);

  const fetchPromise = fetch(request)
    .then(async (networkResponse) => {
      if (networkResponse.ok) {
        const cache = await caches.open(CACHE_NAME);
        cache.put(request, networkResponse.clone());
      }
      return networkResponse;
    })
    .catch((error) => {
      console.warn("[Motor Vault SW] Background fetch failed:", error);
      return (
        cachedResponse ||
        new Response("Network error", {
          status: 503,
          statusText: "Service Unavailable",
        })
      );
    });

  return cachedResponse || fetchPromise;
}

/**
 * Clears specific cache or all caches
 */
async function clearCache(cacheName?: string): Promise<void> {
  if (cacheName) {
    await caches.delete(cacheName);
    console.log(`[Motor Vault SW] Cleared cache: ${cacheName}`);
  } else {
    const cacheKeys = await caches.keys();
    await Promise.all(cacheKeys.map((key) => caches.delete(key)));
    console.log("[Motor Vault SW] Cleared all caches");
  }
}

/**
 * Manually caches a list of URLs
 */
async function cacheUrls(urls: string[]): Promise<void> {
  const cache = await caches.open(CACHE_NAME);
  await cache.addAll(urls);
  console.log(`[Motor Vault SW] Cached ${urls.length} URLs`);
}

/**
 * Synchronizes vault data in the background
 */
async function syncVaultData(): Promise<void> {
  console.log("[Motor Vault SW] Starting vault data sync...");

  try {
    // Implement your sync logic here
    // This could involve fetching latest vault state, updating local storage, etc.

    console.log("[Motor Vault SW] Vault data sync complete");
  } catch (error) {
    console.error("[Motor Vault SW] Vault data sync failed:", error);
    throw error;
  }
}

/**
 * Payment Request Event Handler (Payment Handler API)
 * Handles payment requests from merchants
 */
self.addEventListener("paymentrequest", (event: Event) => {
  const paymentEvent = event as unknown as PaymentRequestEvent;

  console.log("[Motor Vault SW] Payment request received:", {
    topOrigin: paymentEvent.topOrigin,
    paymentRequestOrigin: paymentEvent.paymentRequestOrigin,
    paymentRequestId: paymentEvent.paymentRequestId,
    total: paymentEvent.total,
    methodData: paymentEvent.methodData,
  });

  paymentEvent.respondWith(handlePaymentRequest(paymentEvent));
});

/**
 * Handles the payment request by opening a payment window
 * and coordinating with the vault for transaction signing
 */
async function handlePaymentRequest(
  event: PaymentRequestEvent,
): Promise<PaymentHandlerResponse> {
  try {
    // Open payment UI window for user confirmation
    const paymentUrl = new URL("/payment", self.location.origin);
    paymentUrl.searchParams.set("paymentRequestId", event.paymentRequestId);
    paymentUrl.searchParams.set("total", event.total.value);
    paymentUrl.searchParams.set("currency", event.total.currency);
    paymentUrl.searchParams.set("merchantOrigin", event.topOrigin);

    console.log(
      "[Motor Vault SW] Opening payment window:",
      paymentUrl.toString(),
    );

    const paymentWindow = await event.openWindow(paymentUrl.toString());

    if (!paymentWindow) {
      throw new Error("Failed to open payment window");
    }

    // Wait for payment confirmation from the payment window
    const paymentResult = await waitForPaymentConfirmation(
      event.paymentRequestId,
    );

    console.log("[Motor Vault SW] Payment result:", paymentResult);

    // Return payment response
    return {
      methodName: event.methodData[0].supportedMethods,
      details: paymentResult,
    };
  } catch (error) {
    console.error("[Motor Vault SW] Payment request failed:", error);
    throw error;
  }
}

/**
 * Waits for payment confirmation from the payment UI window
 * Uses message passing between service worker and client
 */
function waitForPaymentConfirmation(paymentRequestId: string): Promise<any> {
  return new Promise((resolve, reject) => {
    const timeout = setTimeout(() => {
      reject(new Error("Payment confirmation timeout"));
    }, 300000); // 5 minute timeout

    // Listen for payment confirmation message
    const messageHandler = (event: ExtendableMessageEvent) => {
      if (
        event.data.type === "PAYMENT_CONFIRMED" &&
        event.data.paymentRequestId === paymentRequestId
      ) {
        clearTimeout(timeout);
        self.removeEventListener("message", messageHandler as any);
        resolve(event.data.paymentDetails);
      } else if (
        event.data.type === "PAYMENT_CANCELLED" &&
        event.data.paymentRequestId === paymentRequestId
      ) {
        clearTimeout(timeout);
        self.removeEventListener("message", messageHandler as any);
        reject(new Error("Payment cancelled by user"));
      }
    };

    self.addEventListener("message", messageHandler as any);
  });
}

/**
 * Initialize the vault WASM HTTP server
 */
async function initializeVault(): Promise<void> {
  if (vaultInitialized) {
    console.log("[Motor Vault SW] Vault already initialized");
    return;
  }

  console.log("[Motor Vault SW] Initializing vault WASM HTTP server...");

  try {
    // Import wasm_exec.js (Go's JS/WASM bridge)
    // Note: This should be loaded from cache
    const wasmExecResponse = await caches.match("/wasm_exec.js");
    if (wasmExecResponse) {
      const wasmExecCode = await wasmExecResponse.text();
      // Execute in global scope
      (0, eval)(wasmExecCode);
    } else {
      throw new Error("wasm_exec.js not found in cache");
    }

    // Load vault.wasm from cache
    const wasmResponse = await caches.match("/vault.wasm");
    if (!wasmResponse) {
      throw new Error("vault.wasm not found in cache");
    }

    const wasmBytes = await wasmResponse.arrayBuffer();

    // Initialize Go runtime
    const go = new (self as any).Go();

    // Instantiate WASM module
    const result = await WebAssembly.instantiate(wasmBytes, go.importObject);

    // Run the Go program (this starts the HTTP server)
    go.run(result.instance);

    vaultInitialized = true;
    vaultReady = true;

    console.log(
      "[Motor Vault SW] Vault WASM HTTP server initialized successfully",
    );
  } catch (error) {
    console.error("[Motor Vault SW] Failed to initialize vault:", error);
    vaultInitialized = false;
    vaultReady = false;
    throw error;
  }
}

/**
 * Handle requests to the vault WASM HTTP server
 */
async function handleVaultRequest(request: Request): Promise<Response> {
  // Ensure vault is initialized
  if (!vaultReady) {
    console.warn("[Motor Vault SW] Vault not ready, initializing...");
    try {
      await initializeVault();
    } catch (error) {
      console.error("[Motor Vault SW] Vault initialization failed:", error);
      return new Response(
        JSON.stringify({
          error: "Vault not available",
          message: "Payment service is currently unavailable",
        }),
        {
          status: 503,
          headers: { "Content-Type": "application/json" },
        },
      );
    }
  }

  try {
    // The Go WASM HTTP server intercepts fetch requests via the go-wasm-http-server library
    // We just need to make a fetch request and it will be handled by the Go server
    console.log("[Motor Vault SW] Routing request to vault:", request.url);

    // Forward the request to the WASM server
    // The go-wasm-http-server library patches the global fetch to intercept requests
    const response = await fetch(request);

    console.log("[Motor Vault SW] Vault response:", response.status);

    return response;
  } catch (error) {
    console.error("[Motor Vault SW] Vault request failed:", error);
    return new Response(
      JSON.stringify({
        error: "Request failed",
        message: error instanceof Error ? error.message : "Unknown error",
      }),
      {
        status: 500,
        headers: { "Content-Type": "application/json" },
      },
    );
  }
}

// Export for TypeScript module support
