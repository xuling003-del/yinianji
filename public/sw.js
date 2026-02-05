
const CACHE_NAME = 'quest-island-v36-offline-fix';

// 核心文件：必须存在，否则 Service Worker 安装失败
// 注意：移除了 esm.sh 的外部依赖，因为我们现在让 Vite 将 React 打包到本地文件中，这样离线更稳定。
const CORE_ASSETS = [
  '/',
  '/index.html',
  '/manifest.json',
  '/data/questions.json',
  'https://cdn.tailwindcss.com',
  'https://fonts.googleapis.com/css2?family=ZCOOL+KuaiLe&family=Noto+Sans+SC:wght@400;500;700;900&display=swap'
];

// 1. 荣誉卡片 (Achievement Cards) - 修正为 /honor/ 目录下的绝对路径
const HONOR_ASSETS = [
  '/honor/jianchi.png',  // 坚持之星
  '/honor/shengli.png',  // 胜利勋章
  '/honor/zhihui.png',   // 智慧光环
  '/honor/shandian.png', // 闪电侠
  '/honor/wanmei.png'    // 完美风暴
];

// 2. 收集卡片 (Collection Cards) - 修正为 /media/ 目录下的绝对路径
const COLLECTION_ASSETS = Array.from({ length: 10 }, (_, i) => `/media/card_${i + 1}.png`);

// 可选文件
const OPTIONAL_ASSETS = [
  '/icon/icon-192x192.png',
  '/icon/icon-512x512.png',
  ...HONOR_ASSETS,
  ...COLLECTION_ASSETS
];

// Install: 预缓存核心文件
self.addEventListener('install', (event) => {
  self.skipWaiting();
  event.waitUntil(
    caches.open(CACHE_NAME).then(async (cache) => {
      try {
        await cache.addAll(CORE_ASSETS);
      } catch (e) {
        console.error('Pre-cache failed:', e);
      }
      
      const cachePromises = OPTIONAL_ASSETS.map(async (asset) => {
        try {
           const response = await fetch(asset);
           if (response.ok) {
             await cache.put(asset, response);
           }
        } catch (err) {
           // Ignore optional asset errors
        }
      });
      
      await Promise.all(cachePromises);
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

  // HTML 页面：网络优先，失败则使用缓存
  if (event.request.mode === 'navigate') {
    event.respondWith(
      fetch(event.request)
        .then((networkResponse) => {
          return caches.open(CACHE_NAME).then((cache) => {
            cache.put('/index.html', networkResponse.clone());
            return networkResponse;
          });
        })
        .catch(() => {
          return caches.match('/index.html');
        })
    );
    return;
  }

  // 静态资源：缓存优先 (Cache-First)
  // 这会捕获 JS, CSS, Images 以及通过 Vite 打包生成的 assets 目录下的文件
  if (event.request.destination === 'script' || 
      event.request.destination === 'style' || 
      event.request.destination === 'image' ||
      event.request.destination === 'font' ||
      url.pathname.includes('/assets/') ||
      url.pathname.includes('/media/') || 
      url.pathname.includes('/honor/') || 
      url.pathname.includes('/data/') ||
      url.hostname === 'cdn.tailwindcss.com' ||
      url.hostname.includes('googleapis.com') ||
      url.hostname.includes('gstatic.com')) {
      
    event.respondWith(
      caches.match(event.request).then((cachedResponse) => {
        if (cachedResponse) {
          return cachedResponse;
        }

        return fetch(event.request).then((networkResponse) => {
          const isValid = networkResponse && (
            networkResponse.status === 200 || 
            (networkResponse.status === 0 && networkResponse.type === 'opaque')
          );

          if (!isValid) {
            return networkResponse;
          }

          const responseToCache = networkResponse.clone();
          caches.open(CACHE_NAME).then((cache) => {
            try {
              cache.put(event.request, responseToCache);
            } catch (err) {}
          });

          return networkResponse;
        }).catch(() => {});
      })
    );
  }
});
