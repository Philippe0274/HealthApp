const CACHE = 'health-tracker-v' + Date.now(); // Force new cache on every load

self.addEventListener('install', (e) => {
  self.skipWaiting();
});

self.addEventListener('activate', (e) => {
  e.waitUntil(
    caches.keys().then(names => {
      return Promise.all(names.map(n => caches.delete(n))); // Delete ALL old caches
    })
  );
  self.clients.claim();
});

self.addEventListener('fetch', (e) => {
  // Allow external APIs - don't cache
  if (e.request.url.includes('api.telegram.org') || 
      e.request.url.includes('googleapis.com') ||
      e.request.url.includes('accounts.google.com') ||
      e.request.url.includes('gsi/client')) {
    return e.respondWith(fetch(e.request));
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

// Periodic Background Sync - Auto-sync naar Google Drive
self.addEventListener('periodicsync', (e) => {
  if (e.tag && e.tag.startsWith('sync-')) {
    e.waitUntil(
      (async () => {
        try {
          // Send message to app to trigger sync
          const clients = await self.clients.matchAll({ type: 'window' });
          clients.forEach(client => {
            client.postMessage({
              type: 'PERFORM_SYNC',
              tag: e.tag
            });
          });
        } catch (err) {
          console.error('Periodic sync error:', err);
        }
      })()
    );
  }
});

