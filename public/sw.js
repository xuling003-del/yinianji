
const CACHE_NAME = 'quest-island-v23';
// Only cache static files that exist in the build output (public folder)
const ASSETS_TO_CACHE = [
  '/',
  '/index.html',
  '/manifest.json', // Now in public
  '/icon/icon-192x192.png',
  '/icon/icon-512x512.png',
  'https://cdn.tailwindcss.com',
  'https://fonts.googleapis.com/css2?family=ZCOOL+KuaiLe&family=Noto+Sans+SC:wght@400;500;700;900&display=swap'
];

// Install event: Pre-cache core static files
self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      return cache.addAll(ASSETS_TO_CACHE);
    })
  );
  self.skipWaiting();
});

// Activate event: Clean up old caches
self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames.map((cacheName) => {
          if (cacheName !== CACHE_NAME) {
            return caches.delete(cacheName);
          }
        })
      );
    })
  );
  self.clients.claim();
});

// Fetch event
self.addEventListener('fetch', (event) => {
  // 1. Handle Navigation Requests (HTML) - App Shell Pattern
  if (event.request.mode === 'navigate') {
    event.respondWith(
      (async () => {
        try {
          const cache = await caches.open(CACHE_NAME);
          const cachedIndex = await cache.match('/index.html');
          if (cachedIndex) return cachedIndex;
          
          const networkResponse = await fetch(event.request);
          if (networkResponse) {
             cache.put('/index.html', networkResponse.clone()); // Cache latest index.html
             return networkResponse;
          }
        } catch (error) {
           return new Response('Offline - Content not available', { status: 503, headers: { 'Content-Type': 'text/plain' } });
        }
      })()
    );
    return;
  }

  // 2. Handle Asset Requests
  if (event.request.method !== 'GET') return;

  event.respondWith(
    caches.match(event.request, { ignoreSearch: true }).then((cachedResponse) => {
      const fetchPromise = fetch(event.request).then((networkResponse) => {
        if (!networkResponse || networkResponse.status !== 200 || networkResponse.type === 'error') {
            return networkResponse;
        }

        // Cache Rules:
        // 1. External scripts (Tailwind, Fonts) - cors/basic
        // 2. Build Assets (Vite generates files in /assets/)
        const isExternal = networkResponse.type === 'cors' || networkResponse.type === 'basic';
        const isBuildAsset = event.request.url.includes('/assets/');
        
        if (isExternal || isBuildAsset) {
          const responseToCache = networkResponse.clone();
          caches.open(CACHE_NAME).then((cache) => {
            cache.put(event.request, responseToCache);
          });
        }
        return networkResponse;
      }).catch(() => {
        // Network failed
      });

      return cachedResponse || fetchPromise;
    })
  );
});
