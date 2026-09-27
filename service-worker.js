const CACHE_NAME = 'safespace-v6';
const ASSETS_TO_CACHE = [
  './',
  './index.html',
  './css/style.css',
  './js/i18n.js',
  './js/phrases.js',
  './js/map.js',
  './data/phrases.json',
  './js/app.js',
  './js/api.js',
  './js/dom.js',
  './js/storage.js',
  './js/geolocation.js',
  './js/utils.js',
  './js/xmlHandler.js',
  './js/fakeCall.js',
  './js/voiceControl.js',
  './js/followMe.js',
  './js/shakeDetect.js',
  './manifest.json',
  'https://cdn.jsdelivr.net/npm/bootstrap@5.3.2/dist/css/bootstrap.min.css',
  'https://cdn.jsdelivr.net/npm/bootstrap@5.3.2/dist/js/bootstrap.bundle.min.js',
  'https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800&display=swap'
];

// Install Event
self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then((cache) => {
        return cache.addAll(ASSETS_TO_CACHE);
      })
  );
  self.skipWaiting();
});

// Activate Event
self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames.map((name) => {
          if (name !== CACHE_NAME) {
            return caches.delete(name);
          }
        })
      );
    })
  );
  self.clients.claim();
});

// Fetch Event
self.addEventListener('fetch', (event) => {
  // We only handle GET requests for caching
  if (event.request.method !== 'GET') return;
  
  event.respondWith(
    caches.match(event.request)
      .then((response) => {
        // Return cached response if found, else fetch from network
        return response || fetch(event.request).catch(() => {
          // If network fails (offline), could return a specific offline page if needed
          return null;
        });
      })
  );
});
