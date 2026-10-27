/* Service Worker basico (FASE 1): cache de app shell, network-first para API.
   No cachear videos. Los videos van por CDN del proveedor (FASE 3). */
const CACHE = 'talentbridge-v1';
const APP_SHELL = ['/', '/index.html', '/css/styles.css', '/js/app.js', '/js/api.js', '/js/ui.js', '/manifest.json', '/assets/icons/icon.svg'];

self.addEventListener('install', (e) => {
  e.waitUntil(caches.open(CACHE).then((c) => c.addAll(APP_SHELL)).then(() => self.skipWaiting()));
});

self.addEventListener('activate', (e) => {
  e.waitUntil(caches.keys().then((keys) => Promise.all(keys.filter((k) => k !== CACHE).map((k) => caches.delete(k)))).then(() => self.clients.claim()));
});

self.addEventListener('fetch', (e) => {
  const url = new URL(e.request.url);
  if (url.pathname.startsWith('/api/')) return; // API: siempre red
  if (e.request.destination === 'video') return; // videos: siempre red
  e.respondWith(
    caches.match(e.request).then((cached) => cached || fetch(e.request).then((res) => {
      const copy = res.clone();
      caches.open(CACHE).then((c) => c.put(e.request, copy));
      return res;
    }).catch(() => cached))
  );
});
