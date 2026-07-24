const CACHE_NAME = 'toxic-teddies-arrow-escape-v39';
const CORE_ASSETS = [
  './',
  './index.html',
  './compiled-app.js?v=35',
  './hard-mode-v3.js?v=35',
  './compiled-level-source.js?v=35',
  './interaction-fix.js?v=35',
  './mobile-enhancements.js?v=35',
  './analytics-enhancements.js?v=35',
  './manifest.webmanifest',
  './assets/branding/loading/toxic-teddies-loading.webp',
  './levels/tt01/level-1.json',
  './levels/tt01/level-2.json',
  './levels/tt01/level-3.json',
  './levels/tt01/level-4.json',
  './levels/tt01/level-5.json',
  './assets/backdrops/tt01/neutral.svg',
  './assets/backdrops/tt01/evil-grin.svg',
  './assets/backdrops/tt01/gross.svg',
  './assets/backdrops/tt01/angry.svg',
  './assets/backdrops/tt01/maniacal-laugh.svg',
];

self.addEventListener('install', event => {
  event.waitUntil(caches.open(CACHE_NAME).then(cache => cache.addAll(CORE_ASSETS)));
  self.skipWaiting();
});

self.addEventListener('activate', event => {
  event.waitUntil(
    caches.keys().then(keys => Promise.all(
      keys.filter(key => key !== CACHE_NAME).map(key => caches.delete(key)),
    )),
  );
  self.clients.claim();
});

self.addEventListener('fetch', event => {
  if (event.request.method !== 'GET') return;
  event.respondWith(
    fetch(event.request)
      .then(response => {
        const copy = response.clone();
        caches.open(CACHE_NAME).then(cache => cache.put(event.request, copy));
        return response;
      })
      .catch(() => caches.match(event.request).then(cached => cached || caches.match('./index.html'))),
  );
});
