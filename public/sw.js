
const CACHE_NAME = 'quest-island-v43-root-paths';

// 核心文件：必须存在
const CORE_ASSETS = [
  './',
  'index.html',
  'manifest.json',
  'data/manifest.json',
  'data/math/basic.json',
  'data/math/application.json',
  'data/math/logic.json',
  'data/math/emoji.json',
  'data/chinese/sentence.json',
  'data/chinese/word.json',
  'data/chinese/punctuation.json',
  'data/chinese/antonym.json',
  'https://cdn.tailwindcss.com',
  'https://fonts.googleapis.com/css2?family=ZCOOL+KuaiLe&family=Noto+Sans+SC:wght@400;500;700;900&display=swap'
];

// 1. 荣誉卡片 (Achievement Cards) - 位于 public/honor/
const HONOR_ASSETS = [
  'honor/jianchi.png',
  'honor/shengli.png',
  'honor/zhihui.png',
  'honor/shandian.png',
  'honor/wanmei.png',
  'honor/baifa.png',
  'honor/zhishi.png',
  'honor/siwei.png',
  'honor/qicai.png'
];

// 2. 收集卡片 (Collection Cards) - 位于 public/media/
const COLLECTION_ASSETS = [
  'media/card_1.png',
  'media/card_2.png',
  'media/card_3.png',
  'media/card_4.png',
  'media/card_5.png',
  'media/card_6.png',
  'media/card_7.png',
  'media/card_8.png',
  'media/card_9.png',
  'media/card_10.png'
];

// 可选文件
const OPTIONAL_ASSETS = [
  'icon/icon-192x192.png',
  'icon/icon-512x512.png',
  ...HONOR_ASSETS,
  ...COLLECTION_ASSETS
];

// Install: 预缓存
self.addEventListener('install', (event) => {
  self.skipWaiting();
  event.waitUntil(
    caches.open(CACHE_NAME).then(async (cache) => {
      // 1. 缓存核心文件
      try {
        await cache.addAll(CORE_ASSETS);
      } catch (e) {
        console.error('Pre-cache core failed:', e);
      }
      
      // 2. 尝试缓存可选文件
      const cachePromises = OPTIONAL_ASSETS.map(async (asset) => {
        try {
           await cache.add(asset);
        } catch (err) {
           console.log(`Failed to cache optional asset: ${asset}`, err);
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

  // HTML 页面：网络优先
  if (event.request.mode === 'navigate') {
    event.respondWith(
      fetch(event.request)
        .then((networkResponse) => {
          return caches.open(CACHE_NAME).then((cache) => {
            cache.put('index.html', networkResponse.clone());
            return networkResponse;
          });
        })
        .catch(() => {
          return caches.match('index.html');
        })
    );
    return;
  }

  // 静态资源：缓存优先
  if (event.request.destination === 'script' || 
      event.request.destination === 'style' || 
      event.request.destination === 'image' ||
      event.request.destination === 'font' ||
      url.pathname.includes('/honor/') ||
      url.pathname.includes('/media/') ||
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
          if (!networkResponse || networkResponse.status !== 200 || networkResponse.type !== 'basic') {
            if (networkResponse && networkResponse.type === 'opaque') {
               // Opaque response for CDNs, cache it
            } else if (!networkResponse || networkResponse.status !== 200) {
               return networkResponse;
            }
          }

          const responseToCache = networkResponse.clone();
          caches.open(CACHE_NAME).then((cache) => {
            try {
              cache.put(event.request, responseToCache);
            } catch (err) {}
          });

          return networkResponse;
        }).catch(() => {
          // Network failed and no cache
        });
      })
    );
  }
});
