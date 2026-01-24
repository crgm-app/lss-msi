// Nombre del caché
const CACHE_NAME = 'heartbeat-clock-v1';
// Archivos a guardar para que funcione sin internet
const urlsToCache = [
  './',
  './index.html',
  './manifest.json',
  './icon.png'
];

// Instalar el Service Worker
self.addEventListener('install', event => {
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then(cache => {
        console.log('Opened cache');
        return cache.addAll(urlsToCache);
      })
  );
});

// Usar archivos cacheados si no hay internet
self.addEventListener('fetch', event => {
  event.respondWith(
    caches.match(event.request)
      .then(response => {
        if (response) {
          return response;
        }
        return fetch(event.request);
      })
  );
});
