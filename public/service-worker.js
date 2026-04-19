const CACHE_NAME = 'glovia-v3';
const OFFLINE_URL = '/offline';

const STATIC_ASSETS = [
  '/',
  '/offline',
  '/manifest.json',
  '/placeholder.jpg',
  '/og-image.jpg',
  '/icon-192.svg',
  '/icon-512.svg',
];

// Install event - cache static assets
self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      return cache.addAll(STATIC_ASSETS);
    })
  );
  self.skipWaiting();
});

// Activate event - clean up old caches
self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames
          .filter((name) => name !== CACHE_NAME)
          .map((name) => caches.delete(name))
      );
    })
  );
  self.clients.claim();
});

// Fetch event - network first, fallback to cache
self.addEventListener('fetch', (event) => {
  const { request } = event;
  const url = new URL(request.url);
  const isSameOrigin = url.origin === self.location.origin;

  // Skip non-GET requests
  if (request.method !== 'GET') {
    return;
  }

  // Never intercept cross-origin requests (prevents CORS side effects)
  if (!isSameOrigin) {
    return;
  }

  // Skip API and Next.js runtime assets - always network
  if (url.pathname.startsWith('/api/') || url.pathname.startsWith('/_next/')) {
    event.respondWith(fetch(request));
    return;
  }

  // Network first for HTML pages (do not cache full pages to avoid hydration mismatch)
  if (request.mode === 'navigate') {
    event.respondWith(
      fetch(request)
        .then((response) => response)
        .catch(() => {
          return caches.match(OFFLINE_URL);
        })
    );
    return;
  }

  // Cache first for static assets
  event.respondWith(
    caches.match(request).then((cachedResponse) => {
      if (cachedResponse) {
        // Return cached response and update cache in background
        fetch(request)
          .then((response) => {
            if (response.ok) {
              caches.open(CACHE_NAME).then((cache) => {
                cache.put(request, response);
              });
            }
          })
          .catch((error) => {
            // Silently fail - keep cached version
            console.debug('[ServiceWorker] Background fetch failed:', request.url, error);
          });
        return cachedResponse;
      }

      // Not in cache, fetch from network
      return fetch(request).then((response) => {
        // Cache the response for future use (only if successful)
        if (response.ok) {
          const responseClone = response.clone();
          caches.open(CACHE_NAME).then((cache) => {
            cache.put(request, responseClone);
          });
        }
        return response;
      }).catch((error) => {
        // If fetch fails, try to return offline page
        console.debug('[ServiceWorker] Fetch failed:', request.url, error);
        if (request.mode === 'navigate') {
          return caches.match(OFFLINE_URL);
        }
        throw error;
      });
    })
  );
});

// Handle background sync for cart operations
self.addEventListener('sync', (event) => {
  if (event.tag === 'sync-cart') {
    event.waitUntil(syncCart());
  }
});

async function syncCart() {
  let db;
  try {
    db = await new Promise((resolve, reject) => {
      const req = indexedDB.open('glovia-cart-sync', 1);
      req.onupgradeneeded = (e) => {
        e.target.result.createObjectStore('pending-ops', { keyPath: 'id', autoIncrement: true });
      };
      req.onsuccess = (e) => resolve(e.target.result);
      req.onerror = () => reject(req.error);
    });

    const ops = await new Promise((resolve, reject) => {
      const tx = db.transaction('pending-ops', 'readonly');
      const req = tx.objectStore('pending-ops').getAll();
      req.onsuccess = () => resolve(req.result);
      req.onerror = () => reject(req.error);
    });

    for (const op of ops) {
      try {
        await fetch(op.url, {
          method: op.method,
          headers: { 'Content-Type': 'application/json' },
          body: op.body ? JSON.stringify(op.body) : undefined,
          credentials: 'include',
        });
        // Remove synced operation
        await new Promise((resolve, reject) => {
          const tx = db.transaction('pending-ops', 'readwrite');
          const req = tx.objectStore('pending-ops').delete(op.id);
          req.onsuccess = resolve;
          req.onerror = () => reject(req.error);
        });
      } catch {
        // Leave op in store to retry next sync
      }
    }
  } catch (err) {
    console.debug('[ServiceWorker] syncCart failed:', err);
  } finally {
    if (db) db.close();
  }
}

// Handle push notifications
self.addEventListener('push', (event) => {
  const data = event.data?.json() || {};
  
  const options = {
    body: data.body || 'New notification from Glovia Market place',
    icon: '/icon-192.svg',
    vibrate: [100, 50, 100],
    data: {
      url: data.url || '/',
    },
    actions: data.actions || [],
  };

  event.waitUntil(
    self.registration.showNotification(data.title || 'Glovia Market place', options)
  );
});

// Handle notification click
self.addEventListener('notificationclick', (event) => {
  event.notification.close();
  
  const url = event.notification.data?.url || '/';
  
  event.waitUntil(
    clients.matchAll({ type: 'window' }).then((clientList) => {
      // If a window is already open, focus it
      for (const client of clientList) {
        if (client.url === url && 'focus' in client) {
          return client.focus();
        }
      }
      // Otherwise, open a new window
      if (clients.openWindow) {
        return clients.openWindow(url);
      }
    })
  );
});

