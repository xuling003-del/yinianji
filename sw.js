
const CACHE_NAME = 'quest-island-v12';
const ASSETS_TO_CACHE = [
  './',
  './index.html',
  './index.tsx',
  './App.tsx',
  './types.ts',
  './constants.ts',
  './questions.ts',
  './sound.ts',
  './icon/android-chrome-192x192.png',
  './icon/android-chrome-512x512.png',
  'https://cdn.tailwindcss.com'
];

// Install event: Pre-cache core files
self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      // 使用 cache.addAll 如果任何一个文件失败都会导致 SW 安装失败
      // 所以确保列表里的文件真实存在
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
        // 优先返回缓存的 index.html
        if (cachedResponse) {
          return cachedResponse;
        }
        // 如果缓存没有，尝试网络请求
        return fetch(event.request).catch(() => {
           // 网络也失败（离线），再次尝试匹配缓存（作为兜底）
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
        // 网络请求失败，什么都不做，如果前面 cachedResponse 存在则会返回它
      });

      return cachedResponse || fetchPromise;
    })
  );
});
