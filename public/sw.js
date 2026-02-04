
const CACHE_NAME = 'quest-island-v24-fix';

// 核心文件：必须存在，否则 Service Worker 安装失败
const CORE_ASSETS = [
  '/',
  '/index.html',
  '/manifest.json'
];

// 可选文件：如果不存在（例如图标未上传）不会阻止 SW 安装
const OPTIONAL_ASSETS = [
  '/icon/icon-192x192.png',
  '/icon/icon-512x512.png',
  'https://cdn.tailwindcss.com',
  'https://fonts.googleapis.com/css2?family=ZCOOL+KuaiLe&family=Noto+Sans+SC:wght@400;500;700;900&display=swap'
];

// Install: 预缓存核心文件
self.addEventListener('install', (event) => {
  self.skipWaiting(); // 强制立即接管
  event.waitUntil(
    caches.open(CACHE_NAME).then(async (cache) => {
      // 1. 缓存核心文件 (如果失败则 SW 安装失败)
      await cache.addAll(CORE_ASSETS);
      
      // 2. 尝试缓存可选文件 (允许失败，防止因缺少图标导致离线功能全挂)
      for (const asset of OPTIONAL_ASSETS) {
        try {
          await cache.add(asset);
        } catch (err) {
          console.warn('Optional asset failed to cache:', asset);
        }
      }
    })
  );
});

// Activate: 清理旧缓存
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
    }).then(() => self.clients.claim())
  );
});

// Fetch: 处理请求
self.addEventListener('fetch', (event) => {
  const url = new URL(event.request.url);

  // 1. 导航请求 (HTML) -> 网络优先，失败回退到缓存
  // 这样保证用户联网时总能看到最新版本
  if (event.request.mode === 'navigate') {
    event.respondWith(
      fetch(event.request)
        .then((networkResponse) => {
          return caches.open(CACHE_NAME).then((cache) => {
            cache.put('/index.html', networkResponse.clone()); // 更新缓存中的 index.html
            return networkResponse;
          });
        })
        .catch(() => {
          // 离线时返回缓存的 index.html
          return caches.match('/index.html');
        })
    );
    return;
  }

  // 2. 静态资源 (JS, CSS, Images) -> 缓存优先，失败回退到网络 (并写入缓存)
  // 这是解决离线后白屏或无法加载的关键
  if (event.request.destination === 'script' || 
      event.request.destination === 'style' || 
      event.request.destination === 'image' ||
      event.request.destination === 'font' ||
      url.pathname.includes('/assets/')) {
      
    event.respondWith(
      caches.match(event.request).then((cachedResponse) => {
        if (cachedResponse) {
          return cachedResponse;
        }

        return fetch(event.request).then((networkResponse) => {
          // 检查响应是否有效
          if (!networkResponse || networkResponse.status !== 200 || networkResponse.type !== 'basic' && networkResponse.type !== 'cors') {
            return networkResponse;
          }

          // 将新获取的资源放入缓存 (运行时缓存)
          const responseToCache = networkResponse.clone();
          caches.open(CACHE_NAME).then((cache) => {
            cache.put(event.request, responseToCache);
          });

          return networkResponse;
        }).catch(() => {
          // 网络失败且无缓存，如果是图片，可以返回一个占位图 (此处省略)
        });
      })
    );
  }
});
