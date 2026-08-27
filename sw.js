const APP_VERSION = '3.0.9';
const CACHE_PREFIX = 'health-tracker-cache-';
const CACHE_NAME = CACHE_PREFIX + APP_VERSION;
const APP_BASE = new URL(self.registration.scope).pathname;
const appPath = (path = '') => APP_BASE + path;
const APP_SHELL = [
  appPath(),
  appPath('index.html'),
  appPath('manifest.json'),
  appPath('logo.png'),
  appPath('telegram.png'),
  appPath('drugs.png'),
  appPath('24-hours.png'),
  appPath('recovery.png'),
  appPath('folder.png'),
  appPath('database-management.png'),
  appPath('event.png')
];

self.addEventListener('install', (event) => {
  event.waitUntil((async () => {
    const cache = await caches.open(CACHE_NAME);
    await Promise.all(APP_SHELL.map(async (url) => {
      try {
        const response = await fetch(new Request(url, { cache: 'reload' }));
        if (response && response.ok) await cache.put(url, response);
      } catch (err) {
        // Missing optional assets must not block a new service worker.
      }
    }));
    await self.skipWaiting();
  })());
});

self.addEventListener('activate', (event) => {
  event.waitUntil((async () => {
    const keys = await caches.keys();
    await Promise.all(keys.map((key) => {
      const appCache = key.startsWith(CACHE_PREFIX) || /health|HealthApp|health-tracker/i.test(key);
      if (appCache && key !== CACHE_NAME) {
        return caches.delete(key);
      }
      return Promise.resolve();
    }));
    await self.clients.claim();
    const clients = await self.clients.matchAll({ type: 'window', includeUncontrolled: true });
    clients.forEach((client) => client.postMessage({ type: 'NEW_VERSION_READY', version: APP_VERSION, reload: true }));
  })());
});

self.addEventListener('message', (event) => {
  if (event.data && event.data.type === 'SKIP_WAITING') {
    self.skipWaiting();
  }
});

self.addEventListener('fetch', (event) => {
  const request = event.request;
  if (request.method !== 'GET') return;

  const url = new URL(request.url);
  if (url.origin !== self.location.origin) return;
  if (url.pathname.endsWith('/sw.js')) return;

  if (request.mode === 'navigate' || url.pathname.endsWith('/index.html')) {
    event.respondWith(networkFirst(request));
    return;
  }

  event.respondWith(staleWhileRevalidate(request));
});

async function networkFirst(request) {
  const cache = await caches.open(CACHE_NAME);
  try {
    const fresh = await fetch(new Request(request, { cache: 'reload' }));
    if (fresh && fresh.ok) await cache.put(appPath('index.html'), fresh.clone());
    return fresh;
  } catch (err) {
    return (await cache.match(request)) || (await cache.match(appPath('index.html'))) || (await cache.match(appPath())) || Response.error();
  }
}

async function staleWhileRevalidate(request) {
  const cache = await caches.open(CACHE_NAME);
  const cached = await cache.match(request);
  const freshPromise = fetch(new Request(request, { cache: 'reload' }))
    .then((response) => {
      if (response && response.ok) cache.put(request, response.clone());
      return response;
    })
    .catch(() => null);
  return cached || (await freshPromise) || Response.error();
}
