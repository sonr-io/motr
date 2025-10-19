const SW_VERSION = "1.0.0";
const CACHE_VERSION = `motor-vault-v${SW_VERSION}`;
const CACHE_NAME = `${CACHE_VERSION}-${Date.now()}`;
const PRECACHE_ASSETS = [
  "/vault.wasm",
  "/wasm_exec.js"
];
let vaultInitialized = false;
let vaultReady = false;
const CACHE_STRATEGIES = {
  NETWORK_FIRST: "network-first",
  CACHE_FIRST: "cache-first",
  STALE_WHILE_REVALIDATE: "stale-while-revalidate"
};
const STRATEGY_PATTERNS = {
  [CACHE_STRATEGIES.CACHE_FIRST]: [
    /\.wasm$/,
    /wasm_exec\.js$/,
    /\.(png|jpg|jpeg|svg|gif|webp)$/,
    /\.(woff|woff2|ttf|eot)$/
  ],
  [CACHE_STRATEGIES.NETWORK_FIRST]: [
    /\/api\//,
    /\/vault\//
  ],
  [CACHE_STRATEGIES.STALE_WHILE_REVALIDATE]: [
    /\.(js|css)$/
  ]
};
self.addEventListener("install", (event) => {
  console.log(`[Motor Vault SW] Installing version ${SW_VERSION}`);
  event.waitUntil(
    (async () => {
      try {
        const cache = await caches.open(CACHE_NAME);
        await cache.addAll(PRECACHE_ASSETS);
        console.log("[Motor Vault SW] Pre-cached critical assets");
        await initializeVault();
        await self.skipWaiting();
        console.log("[Motor Vault SW] Installation complete");
      } catch (error) {
        console.error("[Motor Vault SW] Installation failed:", error);
        throw error;
      }
    })()
  );
});
self.addEventListener("activate", (event) => {
  console.log(`[Motor Vault SW] Activating version ${SW_VERSION}`);
  event.waitUntil(
    (async () => {
      try {
        const cacheKeys = await caches.keys();
        const oldCaches = cacheKeys.filter(
          (key) => key.startsWith("motor-vault-") && key !== CACHE_NAME
        );
        await Promise.all(
          oldCaches.map((key) => {
            console.log(`[Motor Vault SW] Deleting old cache: ${key}`);
            return caches.delete(key);
          })
        );
        await self.clients.claim();
        console.log("[Motor Vault SW] Activation complete");
      } catch (error) {
        console.error("[Motor Vault SW] Activation failed:", error);
        throw error;
      }
    })()
  );
});
self.addEventListener("fetch", (event) => {
  const { request } = event;
  const url = new URL(request.url);
  if (!url.protocol.startsWith("http")) {
    return;
  }
  if (url.pathname.startsWith("/api/payment/") || url.pathname.startsWith("/payment/") || url.pathname.startsWith("/.well-known/")) {
    event.respondWith(handleVaultRequest(request));
    return;
  }
  if (request.method !== "GET") {
    return;
  }
  const strategy = getCachingStrategy(url.pathname);
  event.respondWith(
    handleFetchWithStrategy(request, strategy)
  );
});
self.addEventListener("message", (event) => {
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
self.addEventListener("sync", (event) => {
  const syncEvent = event;
  console.log(`[Motor Vault SW] Background sync: ${syncEvent.tag}`);
  if (syncEvent.tag === "vault-sync") {
    syncEvent.waitUntil(syncVaultData());
  }
});
self.addEventListener("push", (event) => {
  const options = {
    body: event.data?.text() || "New update available",
    icon: "/icons/icon-192x192.png",
    badge: "/icons/badge-72x72.png",
    vibrate: [200, 100, 200],
    data: {
      dateOfArrival: Date.now(),
      primaryKey: 1
    },
    actions: [
      {
        action: "explore",
        title: "View Details"
      },
      {
        action: "close",
        title: "Dismiss"
      }
    ]
  };
  event.waitUntil(
    self.registration.showNotification("Motor Vault", options)
  );
});
self.addEventListener("notificationclick", (event) => {
  console.log("[Motor Vault SW] Notification clicked:", event.action);
  event.notification.close();
  if (event.action === "explore") {
    event.waitUntil(
      self.clients.openWindow("/")
    );
  }
});
function getCachingStrategy(pathname) {
  for (const [strategy, patterns] of Object.entries(STRATEGY_PATTERNS)) {
    if (patterns.some((pattern) => pattern.test(pathname))) {
      return strategy;
    }
  }
  return CACHE_STRATEGIES.STALE_WHILE_REVALIDATE;
}
async function handleFetchWithStrategy(request, strategy) {
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
async function cacheFirst(request) {
  const cachedResponse = await caches.match(request);
  if (cachedResponse) {
    return cachedResponse;
  }
  try {
    const networkResponse = await fetch(request);
    if (networkResponse.ok) {
      const cache = await caches.open(CACHE_NAME);
      cache.put(request, networkResponse.clone());
    }
    return networkResponse;
  } catch (error) {
    console.error("[Motor Vault SW] Cache-first fetch failed:", error);
    return new Response("Network error", {
      status: 408,
      statusText: "Request Timeout"
    });
  }
}
async function networkFirst(request) {
  try {
    const networkResponse = await fetch(request);
    if (networkResponse.ok) {
      const cache = await caches.open(CACHE_NAME);
      cache.put(request, networkResponse.clone());
    }
    return networkResponse;
  } catch (error) {
    console.warn("[Motor Vault SW] Network request failed, trying cache:", error);
    const cachedResponse = await caches.match(request);
    if (cachedResponse) {
      return cachedResponse;
    }
    return new Response("Offline", {
      status: 503,
      statusText: "Service Unavailable"
    });
  }
}
async function staleWhileRevalidate(request) {
  const cachedResponse = await caches.match(request);
  const fetchPromise = fetch(request).then(async (networkResponse) => {
    if (networkResponse.ok) {
      const cache = await caches.open(CACHE_NAME);
      cache.put(request, networkResponse.clone());
    }
    return networkResponse;
  }).catch((error) => {
    console.warn("[Motor Vault SW] Background fetch failed:", error);
    return cachedResponse || new Response("Network error", {
      status: 503,
      statusText: "Service Unavailable"
    });
  });
  return cachedResponse || fetchPromise;
}
async function clearCache(cacheName) {
  if (cacheName) {
    await caches.delete(cacheName);
    console.log(`[Motor Vault SW] Cleared cache: ${cacheName}`);
  } else {
    const cacheKeys = await caches.keys();
    await Promise.all(cacheKeys.map((key) => caches.delete(key)));
    console.log("[Motor Vault SW] Cleared all caches");
  }
}
async function cacheUrls(urls) {
  const cache = await caches.open(CACHE_NAME);
  await cache.addAll(urls);
  console.log(`[Motor Vault SW] Cached ${urls.length} URLs`);
}
async function syncVaultData() {
  console.log("[Motor Vault SW] Starting vault data sync...");
  try {
    console.log("[Motor Vault SW] Vault data sync complete");
  } catch (error) {
    console.error("[Motor Vault SW] Vault data sync failed:", error);
    throw error;
  }
}
self.addEventListener("paymentrequest", (event) => {
  const paymentEvent = event;
  console.log("[Motor Vault SW] Payment request received:", {
    topOrigin: paymentEvent.topOrigin,
    paymentRequestOrigin: paymentEvent.paymentRequestOrigin,
    paymentRequestId: paymentEvent.paymentRequestId,
    total: paymentEvent.total,
    methodData: paymentEvent.methodData
  });
  paymentEvent.respondWith(handlePaymentRequest(paymentEvent));
});
async function handlePaymentRequest(event) {
  try {
    const paymentUrl = new URL("/payment", self.location.origin);
    paymentUrl.searchParams.set("paymentRequestId", event.paymentRequestId);
    paymentUrl.searchParams.set("total", event.total.value);
    paymentUrl.searchParams.set("currency", event.total.currency);
    paymentUrl.searchParams.set("merchantOrigin", event.topOrigin);
    console.log("[Motor Vault SW] Opening payment window:", paymentUrl.toString());
    const paymentWindow = await event.openWindow(paymentUrl.toString());
    if (!paymentWindow) {
      throw new Error("Failed to open payment window");
    }
    const paymentResult = await waitForPaymentConfirmation(event.paymentRequestId);
    console.log("[Motor Vault SW] Payment result:", paymentResult);
    return {
      methodName: event.methodData[0].supportedMethods,
      details: paymentResult
    };
  } catch (error) {
    console.error("[Motor Vault SW] Payment request failed:", error);
    throw error;
  }
}
function waitForPaymentConfirmation(paymentRequestId) {
  return new Promise((resolve, reject) => {
    const timeout = setTimeout(() => {
      reject(new Error("Payment confirmation timeout"));
    }, 3e5);
    const messageHandler = (event) => {
      if (event.data.type === "PAYMENT_CONFIRMED" && event.data.paymentRequestId === paymentRequestId) {
        clearTimeout(timeout);
        self.removeEventListener("message", messageHandler);
        resolve(event.data.paymentDetails);
      } else if (event.data.type === "PAYMENT_CANCELLED" && event.data.paymentRequestId === paymentRequestId) {
        clearTimeout(timeout);
        self.removeEventListener("message", messageHandler);
        reject(new Error("Payment cancelled by user"));
      }
    };
    self.addEventListener("message", messageHandler);
  });
}
async function initializeVault() {
  if (vaultInitialized) {
    console.log("[Motor Vault SW] Vault already initialized");
    return;
  }
  console.log("[Motor Vault SW] Initializing vault WASM HTTP server...");
  try {
    const wasmExecResponse = await caches.match("/wasm_exec.js");
    if (wasmExecResponse) {
      const wasmExecCode = await wasmExecResponse.text();
      (0, eval)(wasmExecCode);
    } else {
      throw new Error("wasm_exec.js not found in cache");
    }
    const wasmResponse = await caches.match("/vault.wasm");
    if (!wasmResponse) {
      throw new Error("vault.wasm not found in cache");
    }
    const wasmBytes = await wasmResponse.arrayBuffer();
    const go = new self.Go();
    const result = await WebAssembly.instantiate(wasmBytes, go.importObject);
    go.run(result.instance);
    vaultInitialized = true;
    vaultReady = true;
    console.log("[Motor Vault SW] Vault WASM HTTP server initialized successfully");
  } catch (error) {
    console.error("[Motor Vault SW] Failed to initialize vault:", error);
    vaultInitialized = false;
    vaultReady = false;
    throw error;
  }
}
async function handleVaultRequest(request) {
  if (!vaultReady) {
    console.warn("[Motor Vault SW] Vault not ready, initializing...");
    try {
      await initializeVault();
    } catch (error) {
      console.error("[Motor Vault SW] Vault initialization failed:", error);
      return new Response(
        JSON.stringify({
          error: "Vault not available",
          message: "Payment service is currently unavailable"
        }),
        {
          status: 503,
          headers: { "Content-Type": "application/json" }
        }
      );
    }
  }
  try {
    console.log("[Motor Vault SW] Routing request to vault:", request.url);
    const response = await fetch(request);
    console.log("[Motor Vault SW] Vault response:", response.status);
    return response;
  } catch (error) {
    console.error("[Motor Vault SW] Vault request failed:", error);
    return new Response(
      JSON.stringify({
        error: "Request failed",
        message: error instanceof Error ? error.message : "Unknown error"
      }),
      {
        status: 500,
        headers: { "Content-Type": "application/json" }
      }
    );
  }
}
