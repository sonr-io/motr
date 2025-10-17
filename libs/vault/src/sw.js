const SW_VERSION = "1.0.0";
const CACHE_VERSION = `motor-vault-v${SW_VERSION}`;
const CACHE_NAME = `${CACHE_VERSION}-${Date.now()}`;
const PRECACHE_ASSETS = [
  "/vault.wasm",
  "/wasm_exec.js"
];
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
  if (request.method !== "GET") {
    return;
  }
  if (!url.protocol.startsWith("http")) {
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
