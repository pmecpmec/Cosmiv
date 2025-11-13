// Service Worker for Cosmiv PWA
const VERSION = "3.0.0";
const CACHE_NAME = `cosmiv-v${VERSION}`;
const RUNTIME_CACHE = `cosmiv-runtime-v${VERSION}`;
const MAX_CACHE_SIZE = 50 * 1024 * 1024; // 50MB max cache size

// Assets to cache on install (minimal - let network handle most assets)
const STATIC_ASSETS = ["/", "/index.html"];

// Cache version tracking
const CACHE_VERSION_KEY = "cosmiv_cache_version";

// Check if a URL can be cached (exclude extension URLs, data URLs, etc.)
function isCacheableUrl(url) {
  try {
    const urlObj = new URL(url);
    const scheme = urlObj.protocol;
    
    // Block unsupported schemes
    const unsupportedSchemes = [
      'chrome-extension:',
      'moz-extension:',
      'safari-extension:',
      'ms-browser-extension:',
      'data:',
      'blob:',
      'about:',
      'chrome:',
      'edge:'
    ];
    
    return !unsupportedSchemes.includes(scheme) && 
           (scheme === 'http:' || scheme === 'https:');
  } catch (e) {
    // Invalid URL, don't cache
    return false;
  }
}

// Install event - cache static assets
self.addEventListener("install", (event) => {
  console.log("[Service Worker] Installing...");
  event.waitUntil(
    caches
      .open(CACHE_NAME)
      .then((cache) => {
        console.log("[Service Worker] Caching static assets");
        return cache.addAll(STATIC_ASSETS);
      })
      .then(() => self.skipWaiting())
  );
});

// Activate event - clean up old caches
self.addEventListener("activate", (event) => {
  console.log(`[Service Worker] Activating v${VERSION}...`);
  event.waitUntil(
    caches
      .keys()
      .then((cacheNames) => {
        // Delete ALL old caches to force fresh load
        const deletePromises = cacheNames.map((name) => {
          if (name !== CACHE_NAME && name !== RUNTIME_CACHE) {
            console.log("[Service Worker] Deleting old cache:", name);
            return caches.delete(name);
          }
          return Promise.resolve();
        });
        return Promise.all(deletePromises);
      })
      .then(() => {
        // Update cache version
        return self.clients.matchAll().then((clients) => {
          clients.forEach((client) => {
            client.postMessage({ 
              type: "SW_UPDATED", 
              version: VERSION,
              action: "reload"
            });
          });
        });
      })
      .then(() => {
        // Clean up old IndexedDB data if needed
        return cleanupOldData();
      })
      .then(() => self.skipWaiting())
      .then(() => self.clients.claim())
      .then(() => {
        console.log(`[Service Worker] Activated v${VERSION}`);
      })
  );
});

// Cleanup old data
async function cleanupOldData() {
  try {
    // Store current version
    if (typeof self.indexedDB !== 'undefined') {
      // Could add IndexedDB cleanup here if needed
    }
  } catch (error) {
    console.error("[Service Worker] Cleanup error:", error);
  }
}

// Fetch event - network first, fallback to cache
self.addEventListener("fetch", (event) => {
  const { request } = event;
  const url = new URL(request.url);

  // Skip non-GET requests
  if (request.method !== "GET") {
    return;
  }

  // Skip API calls (let them go to network, don't cache)
  if (url.pathname.startsWith("/api/")) {
    // Always go to network for API calls, never cache
    event.respondWith(
      fetch(request)
        .then((response) => {
          // Don't cache API responses to avoid stale data
          return response;
        })
        .catch((error) => {
          // Network failed - return offline response
          console.error("[Service Worker] API request failed:", error);
          return new Response(
            JSON.stringify({ 
              error: "Network error", 
              offline: true,
              message: "Cannot connect to server. Please check your connection."
            }), 
            { 
              status: 503,
              headers: { 'Content-Type': 'application/json' }
            }
          );
        })
    );
    return;
  }

  // For JavaScript bundles and assets, network first (to avoid serving old cached bundles)
  // Check if it's a JS/CSS bundle that might be outdated
  const isAssetBundle = /\.(js|css)$/.test(url.pathname) && url.pathname.includes('/assets/');
  
  if (isAssetBundle) {
    // Network first for JS/CSS bundles - always fetch fresh
    event.respondWith(
      fetch(request)
        .then((response) => {
          // Only cache if successful and URL is cacheable
          if (response && response.status === 200 && isCacheableUrl(request.url)) {
            const responseToCache = response.clone();
            caches.open(RUNTIME_CACHE).then((cache) => {
              cache.put(request, responseToCache).catch((error) => {
                // Silently fail if caching fails (e.g., quota exceeded, unsupported scheme)
                console.warn("[Service Worker] Failed to cache:", request.url, error.message);
              });
            });
          }
          return response;
        })
        .catch(() => {
          // Network failed, try cache as fallback
          return caches.match(request);
        })
    );
    return;
  }

  // For other static assets, network first
  event.respondWith(
    fetch(request)
      .then((response) => {
        // Only cache successful responses with cacheable URLs
        if (
          response &&
          response.status === 200 &&
          response.type === "basic" &&
          isCacheableUrl(request.url)
        ) {
          const responseToCache = response.clone();
          caches.open(RUNTIME_CACHE).then((cache) => {
            cache.put(request, responseToCache).catch((error) => {
              // Silently fail if caching fails (e.g., quota exceeded, unsupported scheme)
              console.warn("[Service Worker] Failed to cache:", request.url, error.message);
            });
          });
        }
        return response;
      })
      .catch(() => {
        // Network failed, try cache as fallback
        return caches.match(request).then((cachedResponse) => {
          if (cachedResponse) {
            return cachedResponse;
          }
          // Offline fallback
          if (request.destination === "document") {
            return caches.match("/index.html");
          }
          return new Response("Offline", { status: 503 });
        });
      })
  );
});

// Background sync for offline actions
self.addEventListener("sync", (event) => {
  console.log("[Service Worker] Background sync:", event.tag);
  
  if (event.tag === "sync-uploads") {
    event.waitUntil(syncUploads());
  } else if (event.tag === "sync-cache") {
    event.waitUntil(syncCache());
  }
});

async function syncUploads() {
  // Get pending uploads from IndexedDB
  // Retry failed uploads when back online
  console.log("[Service Worker] Syncing uploads...");
  try {
    // TODO: Implement upload sync logic
    // This would read from IndexedDB and retry failed uploads
  } catch (error) {
    console.error("[Service Worker] Upload sync error:", error);
  }
}

async function syncCache() {
  // Clean up old cache entries
  console.log("[Service Worker] Syncing cache...");
  try {
    const cache = await caches.open(RUNTIME_CACHE);
    const keys = await cache.keys();
    
    // Limit cache size by removing oldest entries if needed
    if (keys.length > 100) {
      // Remove oldest 20% of entries
      const toRemove = keys.slice(0, Math.floor(keys.length * 0.2));
      await Promise.all(toRemove.map(key => cache.delete(key)));
      console.log(`[Service Worker] Removed ${toRemove.length} old cache entries`);
    }
  } catch (error) {
    console.error("[Service Worker] Cache sync error:", error);
  }
}

// Push notifications (for job completion, etc.)
self.addEventListener("push", (event) => {
  const data = event.data ? event.data.json() : {};
  const title = data.title || "Cosmiv";
  const options = {
    body: data.body || "You have a new notification",
    icon: "/icons/icon-192x192.png",
    badge: "/icons/icon-72x72.png",
    tag: data.tag || "default",
    data: data.url || "/",
  };

  event.waitUntil(self.registration.showNotification(title, options));
});

// Notification click handler
self.addEventListener("notificationclick", (event) => {
  event.notification.close();

  event.waitUntil(clients.openWindow(event.notification.data || "/"));
});

// Message handler for skip waiting and other commands
self.addEventListener("message", (event) => {
  const { type, data } = event.data || {};
  
  if (type === "SKIP_WAITING") {
    self.skipWaiting();
  } else if (type === "CLEAR_CACHE") {
    // Clear all caches
    caches.keys().then((cacheNames) => {
      return Promise.all(cacheNames.map((name) => caches.delete(name)));
    }).then(() => {
      event.ports[0]?.postMessage({ success: true });
    });
  } else if (type === "GET_VERSION") {
    // Return service worker version
    event.ports[0]?.postMessage({ version: VERSION, cacheName: CACHE_NAME });
  } else if (type === "CACHE_URL") {
    // Manually cache a URL
    if (data?.url && isCacheableUrl(data.url)) {
      caches.open(RUNTIME_CACHE).then((cache) => {
        return fetch(data.url).then((response) => {
          if (response.ok) {
            return cache.put(data.url, response)
              .then(() => {
                event.ports[0]?.postMessage({ success: true });
              })
              .catch((error) => {
                console.warn("[Service Worker] Failed to cache URL:", data.url, error.message);
                event.ports[0]?.postMessage({ success: false, error: error.message });
              });
          } else {
            event.ports[0]?.postMessage({ success: false, error: "Response not OK" });
          }
        }).catch((error) => {
          console.warn("[Service Worker] Failed to fetch URL:", data.url, error.message);
          event.ports[0]?.postMessage({ success: false, error: error.message });
        });
      });
    } else {
      event.ports[0]?.postMessage({ success: false, error: "URL is not cacheable" });
    }
  }
});
