const CACHE = 'health-tracker-v1';

self.addEventListener('install', (e) => {
  self.skipWaiting();
});

self.addEventListener('activate', (e) => {
  e.waitUntil(
    caches.keys().then(names => {
      return Promise.all(names.filter(n => n !== CACHE).map(n => caches.delete(n)));
    })
  );
  self.clients.claim();
});

self.addEventListener('fetch', (e) => {
  // Don't cache Telegram API calls - let them go direct
  if (e.request.url.includes('api.telegram.org')) {
    e.respondWith(fetch(e.request));
    return;
  }
  
  e.respondWith(
    fetch(e.request)
      .then(r => {
        if (!r || r.status !== 200 || r.type === 'error') {
          return r;
        }
        const c = r.clone();
        caches.open(CACHE).then(cache => cache.put(e.request, c));
        return r;
      })
      .catch(() => {
        return caches.match(e.request);
      })
  );
});
