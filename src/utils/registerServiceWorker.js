// Service Worker Registration
export function registerServiceWorker() {
  if ("serviceWorker" in navigator) {
    window.addEventListener("load", () => {
      navigator.serviceWorker
        .register("/sw.js")
        .then((registration) => {
          console.log("[Service Worker] Registered:", registration.scope);

          // Check for updates every hour
          setInterval(() => {
            registration.update();
          }, 60 * 60 * 1000);

          // Handle updates
          registration.addEventListener("updatefound", () => {
            const newWorker = registration.installing;

            newWorker.addEventListener("statechange", () => {
              if (
                newWorker.state === "installed" &&
                navigator.serviceWorker.controller
              ) {
                // New service worker available
                console.log("[Service Worker] New version available");
                // Show update notification to user
                if (window.showUpdateNotification) {
                  window.showUpdateNotification();
                }
              }
            });
          });
        })
        .catch((error) => {
          console.error("[Service Worker] Registration failed:", error);
        });

      // Listen for messages from service worker
      navigator.serviceWorker.addEventListener("message", (event) => {
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
