// Service Worker Registration
export function registerServiceWorker() {
  if ("serviceWorker" in navigator) {
    window.addEventListener("load", () => {
      const swPath = import.meta.env.BASE_URL + "sw.js"
      
      // Unregister any existing service workers first to clear old caches
      navigator.serviceWorker.getRegistrations().then((registrations) => {
        registrations.forEach((registration) => {
          registration.unregister();
        });
      }).then(() => {
        // Clear all caches
        return caches.keys().then((cacheNames) => {
          return Promise.all(
            cacheNames.map((cacheName) => caches.delete(cacheName))
          );
        });
      }).then(() => {
        // Register new service worker
        return navigator.serviceWorker.register(swPath);
      }).then((registration) => {
        console.log("[Service Worker] Registered:", registration.scope);

        // Force immediate update check
        registration.update();

        // Check for updates every 5 minutes (more frequent)
        setInterval(() => {
          registration.update();
        }, 5 * 60 * 1000);

        // Handle updates
        registration.addEventListener("updatefound", () => {
          const newWorker = registration.installing;

          newWorker.addEventListener("statechange", () => {
            if (
              newWorker.state === "installed" &&
              navigator.serviceWorker.controller
            ) {
              // New service worker available - force reload
              console.log("[Service Worker] New version available, reloading...");
              window.location.reload();
            }
          });
        });
      })
      .catch((error) => {
        console.error("[Service Worker] Registration failed:", error);
      });

      // Listen for messages from service worker
      navigator.serviceWorker.addEventListener("message", (event) => {
        const { type, version, action } = event.data || {};
        
        if (type === "SW_UPDATED") {
          console.log(`[Service Worker] Updated to v${version}`);
          if (action === "reload") {
            // Show notification or auto-reload
            if (confirm(`New version available (v${version}). Reload now?`)) {
              window.location.reload();
            }
          }
        } else if (type === "SKIP_WAITING") {
          window.location.reload();
        }
        
        console.log("[Service Worker] Message:", event.data);
      });
    });
  }
}

export function unregisterServiceWorker() {
  if ("serviceWorker" in navigator) {
    navigator.serviceWorker.ready.then((registration) => {
      registration.unregister();
    });
  }
}
