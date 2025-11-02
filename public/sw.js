// Service Worker for Cosmiv PWA
const CACHE_NAME = "cosmiv-v1";
const RUNTIME_CACHE = "cosmiv-runtime";

// Assets to cache on install
const STATIC_ASSETS = ["/", "/index.html", "/manifest.json"];

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
  console.log("[Service Worker] Activating...");
  event.waitUntil(
    caches
      .keys()
      .then((cacheNames) => {
        return Promise.all(
          cacheNames
            .filter((name) => name !== CACHE_NAME && name !== RUNTIME_CACHE)
            .map((name) => {
              console.log("[Service Worker] Deleting old cache:", name);
              return caches.delete(name);
            })
        );
      })
      .then(() => self.clients.claim())
  );
});

// Fetch event - network first, fallback to cache
self.addEventListener("fetch", (event) => {
  const { request } = event;
  const url = new URL(request.url);

  // Skip non-GET requests
  if (request.method !== "GET") {
    return;
  }

  // Skip API calls (let them go to network)
  if (url.pathname.startsWith("/api/")) {
    // Try network first, but cache successful responses
    event.respondWith(
      fetch(request)
        .then((response) => {
          // Cache successful API responses (read-only, don't cache errors)
          if (response.status === 200) {
            const responseClone = response.clone();
            caches.open(RUNTIME_CACHE).then((cache) => {
              cache.put(request, responseClone);
            });
          }
          return response;
        })
        .catch(() => {
          // Network failed, try cache for GET requests
          if (request.method === "GET") {
            return caches.match(request);
          }
          return new Response("Offline", { status: 503 });
        })
    );
    return;
  }

  // For static assets, cache first
  event.respondWith(
    caches.match(request).then((cachedResponse) => {
      if (cachedResponse) {
        return cachedResponse;
      }

      return fetch(request)
        .then((response) => {
          // Don't cache if not a valid response
          if (
            !response ||
            response.status !== 200 ||
            response.type !== "basic"
          ) {
            return response;
          }

          const responseToCache = response.clone();
          caches.open(RUNTIME_CACHE).then((cache) => {
            cache.put(request, responseToCache);
          });

          return response;
        })
        .catch(() => {
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
  if (event.tag === "sync-uploads") {
    event.waitUntil(syncUploads());
  }
});

async function syncUploads() {
  // Get pending uploads from IndexedDB
  // Retry failed uploads when back online
  console.log("[Service Worker] Syncing uploads...");
}

// Push notifications (for job completion, etc.)
self.addEventListener("push", (event) => {
  const data = event.data ? event.data.json() : {};
  const title = data.title || "Aiditor";
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

// Message handler for skip waiting
self.addEventListener("message", (event) => {
  if (event.data && event.data.type === "SKIP_WAITING") {
    self.skipWaiting();
  }
});
