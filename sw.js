
const CACHE_NAME = 'quest-island-v3';
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
  // 1. 处理导航请求 (页面跳转或PWA启动)
  // 这是解决 404 问题的关键：无论请求什么页面，如果是导航模式，都尝试返回 index.html
  if (event.request.mode === 'navigate') {
    event.respondWith(
      caches.match('./index.html').then((cachedResponse) => {
        // 如果缓存里有 index.html，直接返回
        if (cachedResponse) {
          return cachedResponse;
        }
        // 如果缓存没有，尝试网络请求
        return fetch(event.request).catch(() => {
           // 如果网络也失败了（离线），再次尝试返回缓存的 index.html (作为兜底)
           return caches.match('./index.html');
        });
      })
    );
    return;
  }

  // 2. 处理其他资源请求 (图片, 脚本, 样式等)
  if (event.request.method !== 'GET') return;

  event.respondWith(
    caches.match(event.request).then((cachedResponse) => {
      // Stale-While-Revalidate 策略: 优先用缓存，同时后台更新
      const fetchPromise = fetch(event.request).then((networkResponse) => {
        if (networkResponse && networkResponse.status === 200 && networkResponse.type === 'basic') {
          const responseToCache = networkResponse.clone();
          caches.open(CACHE_NAME).then((cache) => {
            cache.put(event.request, responseToCache);
          });
        }
        return networkResponse;
      }).catch((err) => {
        // 网络失败，不做处理，下面的 cachedResponse 会被返回
      });

      return cachedResponse || fetchPromise;
    })
  );
});
