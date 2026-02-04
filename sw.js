
const CACHE_NAME = 'quest-island-v2';
const ASSETS_TO_CACHE = [
  './',
  './index.html',
  './index.tsx',
  './App.tsx',
  './types.ts',
  './constants.ts',
  './questions.ts',
  './sound.ts',
  './icon.jpg',
  'https://cdn.tailwindcss.com'
];

// Install event: Pre-cache core files
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
  // 关键修复：处理导航请求（如从主屏幕启动App）
  // 无论请求什么页面路径，如果是导航模式，都优先返回缓存的 index.html
  if (event.request.mode === 'navigate') {
    event.respondWith(
      caches.match('./index.html').then((cachedResponse) => {
        return cachedResponse || fetch(event.request);
      }).catch(() => {
        return fetch(event.request);
      })
    );
    return;
  }

  // Handle other resource requests (Images, Scripts, etc.)
  if (event.request.method !== 'GET') return;

  event.respondWith(
    caches.match(event.request).then((cachedResponse) => {
      // Stale-While-Revalidate 策略
      const fetchPromise = fetch(event.request).then((networkResponse) => {
        if (networkResponse && networkResponse.status === 200 && networkResponse.type === 'basic') {
          const responseToCache = networkResponse.clone();
          caches.open(CACHE_NAME).then((cache) => {
            cache.put(event.request, responseToCache);
          });
        }
        return networkResponse;
      }).catch((err) => {
        // Network failed, rely on cache
      });

      return cachedResponse || fetchPromise;
    })
  );
});
