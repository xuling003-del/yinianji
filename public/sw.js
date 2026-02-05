
const CACHE_NAME = 'quest-island-v33-json-support';

// 核心文件：必须存在，否则 Service Worker 安装失败
const CORE_ASSETS = [
  '/',
  '/index.html',
  '/manifest.json',
  '/data/questions.json',
  'https://cdn.tailwindcss.com',
  'https://fonts.googleapis.com/css2?family=ZCOOL+KuaiLe&family=Noto+Sans+SC:wght@400;500;700;900&display=swap',
  'https://esm.sh/react@^19.2.4',
  'https://esm.sh/react-dom@^19.2.4',
  'https://esm.sh/vite@^7.3.1',
  'https://esm.sh/@vitejs/plugin-react@^5.1.3'
];

// 1. 荣誉卡片 (Achievement Cards) - 固定名称
const HONOR_ASSETS = [
  'media/honor/jianchi.png',  // 坚持之星
  'media/honor/shengli.png',  // 胜利勋章
  'media/honor/zhihui.png',   // 智慧光环
  'media/honor/shandian.png', // 闪电侠
  'media/honor/wanmei.png'    // 完美风暴
];

// 2. 收集卡片 (Collection Cards) - 编号命名
const COLLECTION_ASSETS = Array.from({ length: 10 }, (_, i) => `media/card_${i + 1}.png`);

// 可选文件
const OPTIONAL_ASSETS = [
  'icon/icon-192x192.png',
  'icon/icon-512x512.png',
  'https://esm.sh/@google/genai@^1.38.0',
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

  if (event.request.destination === 'script' || 
      event.request.destination === 'style' || 
      event.request.destination === 'image' ||
      event.request.destination === 'font' ||
      url.pathname.includes('/assets/') ||
      url.pathname.includes('/media/') || 
      url.pathname.includes('/data/') ||
      url.hostname === 'esm.sh' || 
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
