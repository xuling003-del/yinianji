const CACHE_NAME = 'quest-island-v40-utf8-and-cache-stability';

const CORE_ASSETS = [
  '/',
  '/index.html',
  '/manifest.json',
  '/data/manifest.json',
  '/data/math/basic.json',
  '/data/math/application.json',
  '/data/math/logic.json',
  '/data/math/emoji.json',
  '/data/chinese/sentence.json',
  '/data/chinese/word.json',
  '/data/chinese/punctuation.json',
  '/data/chinese/antonym.json'
];

const HONOR_ASSETS = [
  '/honor/jianchi.png',
  '/honor/shengli.png',
  '/honor/zhihui.png',
  '/honor/shandian.png',
  '/honor/wanmei.png',
  '/honor/baifa.png',
  '/honor/zhishi.png',
  '/honor/siwei.png',
  '/honor/qicai.png'
];

const COLLECTION_ASSETS = Array.from({ length: 10 }, (_, i) => `/media/card_${i + 1}.png`);

const OPTIONAL_ASSETS = [
  '/media/icon/icon-192x192.png',
  '/media/icon/icon-512x512.png',
  ...HONOR_ASSETS,
  ...COLLECTION_ASSETS
];

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
        } catch (_err) {
          // Ignore optional asset errors.
        }
      });

      await Promise.all(cachePromises);
    })
  );
});

self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches
      .keys()
      .then((cacheNames) =>
        Promise.all(
          cacheNames.map((cacheName) => {
            if (cacheName !== CACHE_NAME) {
              return caches.delete(cacheName);
            }
            return Promise.resolve(false);
          })
        )
      )
      .then(() => self.clients.claim())
  );
});

self.addEventListener('fetch', (event) => {
  const url = new URL(event.request.url);

  if (event.request.mode === 'navigate') {
    event.respondWith(
      fetch(event.request)
        .then((networkResponse) =>
          caches.open(CACHE_NAME).then((cache) => {
            cache.put('/index.html', networkResponse.clone());
            return networkResponse;
          })
        )
        .catch(() => caches.match('/index.html'))
    );
    return;
  }

  if (
    event.request.destination === 'script' ||
    event.request.destination === 'style' ||
    event.request.destination === 'image' ||
    event.request.destination === 'font' ||
    url.pathname.includes('/assets/') ||
    url.pathname.includes('/media/') ||
    url.pathname.includes('/honor/') ||
    url.pathname.includes('/data/')
  ) {
    event.respondWith(
      caches.match(event.request).then((cachedResponse) => {
        if (cachedResponse) {
          return cachedResponse;
        }

        return fetch(event.request)
          .then((networkResponse) => {
            const isValid =
              networkResponse &&
              (networkResponse.status === 200 ||
                (networkResponse.status === 0 && networkResponse.type === 'opaque'));

            if (!isValid) {
              return networkResponse;
            }

            const responseToCache = networkResponse.clone();
            caches.open(CACHE_NAME).then((cache) => {
              try {
                cache.put(event.request, responseToCache);
              } catch (_err) {
                // Ignore cache put errors.
              }
            });

            return networkResponse;
          })
          .catch(() => {
            if (
              event.request.destination === 'image' ||
              event.request.destination === 'script' ||
              event.request.destination === 'style' ||
              event.request.destination === 'font'
            ) {
              return caches.match(url.pathname);
            }
            return undefined;
          });
      })
    );
  }
});
