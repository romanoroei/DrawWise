/* DrawWise service worker.
   This is an online-only planning tool, so the worker never serves stale
   assets: every request goes to the network, and any old caches are purged.
   Its whole job is to guarantee that a new deploy reaches every device
   immediately, even when the browser is holding a cached index.html.
   Bump VERSION on every release so the browser detects a byte change,
   installs the new worker, and reloads open tabs. */
const VERSION = 'mobile19';

self.addEventListener('install', () => self.skipWaiting());

self.addEventListener('activate', (event) => {
  event.waitUntil((async () => {
    const keys = await caches.keys();
    await Promise.all(keys.map((key) => caches.delete(key)));
    await self.clients.claim();
  })());
});

self.addEventListener('fetch', (event) => {
  const request = event.request;
  if (request.method !== 'GET') return;
  event.respondWith(
    fetch(request, { cache: 'no-store' }).catch(() => fetch(request))
  );
});
