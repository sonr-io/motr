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

// Configuration
const SW_VERSION = '1.0.0';
const CACHE_VERSION = `motor-vault-v${SW_VERSION}`;
const CACHE_NAME = `${CACHE_VERSION}-${Date.now()}`;
const PRECACHE_ASSETS = [
  '/vault.wasm',
  '/wasm_exec.js',
];

// Cache strategies
const CACHE_STRATEGIES = {
  NETWORK_FIRST: 'network-first',
  CACHE_FIRST: 'cache-first',
  STALE_WHILE_REVALIDATE: 'stale-while-revalidate',
} as const;

// Request patterns for different caching strategies
const STRATEGY_PATTERNS = {
  [CACHE_STRATEGIES.CACHE_FIRST]: [
    /\.wasm$/,
    /wasm_exec\.js$/,
    /\.(png|jpg|jpeg|svg|gif|webp)$/,
    /\.(woff|woff2|ttf|eot)$/,
  ],
  [CACHE_STRATEGIES.NETWORK_FIRST]: [
    /\/api\//,
    /\/vault\//,
  ],
  [CACHE_STRATEGIES.STALE_WHILE_REVALIDATE]: [
    /\.(js|css)$/,
  ],
};

/**
 * Install Event Handler
 * Triggered when service worker is first installed
 */
self.addEventListener('install', (event: ExtendableEvent) => {
  console.log(`[Motor Vault SW] Installing version ${SW_VERSION}`);

  event.waitUntil(
    (async () => {
      try {
        // Pre-cache critical assets
        const cache = await caches.open(CACHE_NAME);
        await cache.addAll(PRECACHE_ASSETS);

        console.log('[Motor Vault SW] Pre-cached critical assets');

        // Skip waiting to activate immediately
        await self.skipWaiting();

        console.log('[Motor Vault SW] Installation complete');
      } catch (error) {
        console.error('[Motor Vault SW] Installation failed:', error);
        throw error;
      }
    })()
  );
});

/**
 * Activate Event Handler
 * Triggered when service worker becomes active
 */
self.addEventListener('activate', (event: ExtendableEvent) => {
  console.log(`[Motor Vault SW] Activating version ${SW_VERSION}`);

  event.waitUntil(
    (async () => {
      try {
        // Clean up old caches
        const cacheKeys = await caches.keys();
        const oldCaches = cacheKeys.filter(
          key => key.startsWith('motor-vault-') && key !== CACHE_NAME
        );

        await Promise.all(
          oldCaches.map(key => {
            console.log(`[Motor Vault SW] Deleting old cache: ${key}`);
            return caches.delete(key);
          })
        );

        // Take control of all clients immediately
        await self.clients.claim();

        console.log('[Motor Vault SW] Activation complete');
      } catch (error) {
        console.error('[Motor Vault SW] Activation failed:', error);
        throw error;
      }
    })()
  );
});

/**
 * Fetch Event Handler
 * Intercepts all network requests
 */
self.addEventListener('fetch', (event: FetchEvent) => {
  const { request } = event;
  const url = new URL(request.url);

  // Skip non-GET requests
  if (request.method !== 'GET') {
    return;
  }

  // Skip chrome-extension and other non-http(s) protocols
  if (!url.protocol.startsWith('http')) {
    return;
  }

  // Determine caching strategy based on URL patterns
  const strategy = getCachingStrategy(url.pathname);

  event.respondWith(
    handleFetchWithStrategy(request, strategy)
  );
});

/**
 * Message Event Handler
 * Handles messages from clients
 */
self.addEventListener('message', (event: ExtendableMessageEvent) => {
  const { data } = event;

  switch (data.type) {
    case 'SKIP_WAITING':
      self.skipWaiting();
      break;

    case 'CLAIM_CLIENTS':
      self.clients.claim();
      break;

    case 'CLEAR_CACHE':
      event.waitUntil(clearCache(data.cacheName));
      break;

    case 'GET_VERSION':
      event.ports[0]?.postMessage({ version: SW_VERSION });
      break;

    case 'CACHE_URLS':
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
self.addEventListener('sync', (event: Event) => {
  const syncEvent = event as unknown as SyncEvent;
  console.log(`[Motor Vault SW] Background sync: ${syncEvent.tag}`);

  if (syncEvent.tag === 'vault-sync') {
    syncEvent.waitUntil(syncVaultData());
  }
});

/**
 * Push Event Handler (Push Notifications)
 * Handles push notifications
 */
self.addEventListener('push', (event: PushEvent) => {
  const options = {
    body: event.data?.text() || 'New update available',
    icon: '/icons/icon-192x192.png',
    badge: '/icons/badge-72x72.png',
    vibrate: [200, 100, 200],
    data: {
      dateOfArrival: Date.now(),
      primaryKey: 1
    },
    actions: [
      {
        action: 'explore',
        title: 'View Details',
      },
      {
        action: 'close',
        title: 'Dismiss',
      },
    ]
  };

  event.waitUntil(
    self.registration.showNotification('Motor Vault', options)
  );
});

/**
 * Notification Click Handler
 * Handles notification click events
 */
self.addEventListener('notificationclick', (event: NotificationEvent) => {
  console.log('[Motor Vault SW] Notification clicked:', event.action);

  event.notification.close();

  if (event.action === 'explore') {
    event.waitUntil(
      self.clients.openWindow('/')
    );
  }
});

// Helper Functions

/**
 * Determines the appropriate caching strategy for a given pathname
 */
function getCachingStrategy(pathname: string): string {
  for (const [strategy, patterns] of Object.entries(STRATEGY_PATTERNS)) {
    if (patterns.some(pattern => pattern.test(pathname))) {
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
  strategy: string
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
    console.error('[Motor Vault SW] Cache-first fetch failed:', error);
    return new Response('Network error', {
      status: 408,
      statusText: 'Request Timeout'
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
    console.warn('[Motor Vault SW] Network request failed, trying cache:', error);

    const cachedResponse = await caches.match(request);

    if (cachedResponse) {
      return cachedResponse;
    }

    return new Response('Offline', {
      status: 503,
      statusText: 'Service Unavailable'
    });
  }
}

/**
 * Stale While Revalidate Strategy
 * Returns cached response immediately while fetching fresh data in background
 */
async function staleWhileRevalidate(request: Request): Promise<Response> {
  const cachedResponse = await caches.match(request);

  const fetchPromise = fetch(request).then(async (networkResponse) => {
    if (networkResponse.ok) {
      const cache = await caches.open(CACHE_NAME);
      cache.put(request, networkResponse.clone());
    }
    return networkResponse;
  }).catch(error => {
    console.warn('[Motor Vault SW] Background fetch failed:', error);
    return cachedResponse || new Response('Network error', {
      status: 503,
      statusText: 'Service Unavailable'
    });
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
    await Promise.all(cacheKeys.map(key => caches.delete(key)));
    console.log('[Motor Vault SW] Cleared all caches');
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
  console.log('[Motor Vault SW] Starting vault data sync...');

  try {
    // Implement your sync logic here
    // This could involve fetching latest vault state, updating local storage, etc.

    console.log('[Motor Vault SW] Vault data sync complete');
  } catch (error) {
    console.error('[Motor Vault SW] Vault data sync failed:', error);
    throw error;
  }
}

// Export for TypeScript module support

