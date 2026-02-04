
const CACHE_NAME = 'quest-island-v22';
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
  
  // Icons - Now essential for PWA install experience
  './icon/icon-192x192.png',
  './icon/icon-512x512.png',
  
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
  // This is the App Shell pattern: for any navigation, return index.html
  if (event.request.mode === 'navigate') {
    event.respondWith(
      (async () => {
        try {
          // Attempt to find index.html in cache
          const cache = await caches.open(CACHE_NAME);
          const cachedIndex = await cache.match('./index.html');
          
          if (cachedIndex) {
            return cachedIndex;
          }
          
          // If not in cache, try network
          return await fetch(event.request);
        } catch (error) {
           // Network failed and no cache? Nothing we can do, but usually cachedIndex handles it.
           return new Response('Offline - Content not available');
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
        // IMPORTANT: Allow 'basic' (same-origin) AND 'cors' (external scripts/fonts like tailwind)
        // Check if response is valid before caching
        if (networkResponse && networkResponse.status === 200 && (networkResponse.type === 'basic' || networkResponse.type === 'cors')) {
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
