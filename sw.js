
const CACHE_NAME = 'quest-island-v19';
const ASSETS_TO_CACHE = [
  // Core
  './',
  './index.html',
  './index.tsx',
  './App.tsx',
  './types.ts',
  './constants.ts',
  './questions.ts',
  './sound.ts',
  
  // Note: Icons are removed from strict pre-cache to prevent SW install failure 
  // if files are missing. They will be cached at runtime by the fetch handler below.
  
  // External
  'https://cdn.tailwindcss.com',
  
  // Utils & Hooks
  './utils/helpers.ts',
  './hooks/useGameState.ts',

  // Components
  './components/Header.tsx',
  './components/IslandMap.tsx',
  './components/LessonViewer.tsx',
  './components/ProfileView.tsx',
  './components/StoreView.tsx',
  './components/BouncingItem.tsx'
];

// Install event: Pre-cache core files
self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      // Attempt to cache core assets.
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
  // 1. Handle Navigation Requests (HTML)
  if (event.request.mode === 'navigate') {
    event.respondWith(
      (async () => {
        try {
          // First, try to match the exact request (e.g., / or /index.html)
          let cachedResponse = await caches.match(event.request);
          if (cachedResponse) return cachedResponse;
          
          // If not found (e.g., query params mismatch), try the generic entry point
          cachedResponse = await caches.match('./index.html');
          if (cachedResponse) return cachedResponse;
          
          cachedResponse = await caches.match('./');
          if (cachedResponse) return cachedResponse;

          // Network fallback
          return await fetch(event.request);
        } catch (error) {
           // Offline fallback: try to find the index.html in cache again
           const cache = await caches.open(CACHE_NAME);
           const cachedIndex = await cache.match('./index.html');
           return cachedIndex;
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
        // Cache valid responses
        if (networkResponse && networkResponse.status === 200 && networkResponse.type === 'basic') {
          const responseToCache = networkResponse.clone();
          caches.open(CACHE_NAME).then((cache) => {
            cache.put(event.request, responseToCache);
          });
        }
        return networkResponse;
      }).catch((err) => {
        // Network failure, ignore
      });

      return cachedResponse || fetchPromise;
    })
  );
});
