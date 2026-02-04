
const CACHE_NAME = 'quest-island-v4';
const ASSETS_TO_CACHE = [
  './',
  './index.html',
  './index.tsx',
  './App.tsx',
  './types.ts',
  './constants.ts',
  './questions.ts',
  './sound.ts',
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
  // 1. 处理导航请求 (页面跳转或PWA启动)
  if (event.request.mode === 'navigate') {
    event.respondWith(
      caches.match('./index.html').then((cachedResponse) => {
        if (cachedResponse) {
          return cachedResponse;
        }
        return fetch(event.request).catch(() => {
           // 离线状态下，导航请求失败时，返回首页作为兜底
           return caches.match('./index.html');
        });
      })
    );
    return;
  }

  // 2. 处理其他资源请求
  if (event.request.method !== 'GET') return;

  event.respondWith(
    caches.match(event.request).then((cachedResponse) => {
      // 这里的策略是：优先用缓存，同时发起网络请求更新缓存 (Stale-while-revalidate)
      const fetchPromise = fetch(event.request).then((networkResponse) => {
        // 只缓存有效的响应
        if (networkResponse && networkResponse.status === 200 && networkResponse.type === 'basic') {
          const responseToCache = networkResponse.clone();
          caches.open(CACHE_NAME).then((cache) => {
            cache.put(event.request, responseToCache);
          });
        }
        return networkResponse;
      }).catch((err) => {
        // 网络失败，不做处理
      });

      return cachedResponse || fetchPromise;
    })
  );
});
