const CACHE_NAME = 'toxic-teddies-arrow-escape-v3';
const CORE_ASSETS = [
  './',
  './index.html',
  './styles.css',
  './arrow-extras.css',
  './skin.css',
  './app.js',
  './skin.js',
  './characters.js',
  './manifest.webmanifest',
  './assets/backdrops/toxic-toby-expression-sheet.svg',
  './.nojekyll'
];

self.addEventListener('install', event => {
  event.waitUntil(caches.open(CACHE_NAME).then(cache => cache.addAll(CORE_ASSETS)));
  self.skipWaiting();
});

self.addEventListener('activate', event => {
  event.waitUntil(
    caches.keys().then(keys => Promise.all(keys.filter(key => key !== CACHE_NAME).map(key => caches.delete(key))))
  );
  self.clients.claim();
});

self.addEventListener('fetch', event => {
  if (event.request.method !== 'GET') return;
  event.respondWith(
    fetch(event.request).then(response => {
      const copy = response.clone();
      caches.open(CACHE_NAME).then(cache => cache.put(event.request, copy));
      return response;
    }).catch(() => caches.match(event.request).then(cached => cached || caches.match('./index.html')))
  );
});
