// AVANCE — service worker mínimo (necessário para instalação PWA)
// Estratégia: network-first, com cache de fallback offline.

const CACHE = 'avance-v1';
const CORE = ['./', './index.html', './manifest.json', './icon-192.png'];

self.addEventListener('install', e => {
  self.skipWaiting();
  e.waitUntil(
    caches.open(CACHE).then(c => c.addAll(CORE)).catch(() => {})
  );
});

self.addEventListener('activate', e => {
  e.waitUntil(
    caches.keys().then(keys =>
      Promise.all(keys.filter(k => k !== CACHE).map(k => caches.delete(k)))
    ).then(() => self.clients.claim())
  );
});

// Handler de fetch — exigido pelo Chrome/Brave para liberar o "instalar app".
self.addEventListener('fetch', e => {
  const req = e.request;
  // só GET; deixa Firebase Auth/Firestore passarem direto
  if (req.method !== 'GET') return;
  const url = new URL(req.url);
  if (url.origin !== self.location.origin) return; // não intercepta domínios externos

  e.respondWith(
    fetch(req)
      .then(res => {
        const copy = res.clone();
        caches.open(CACHE).then(c => c.put(req, copy)).catch(() => {});
        return res;
      })
      .catch(() => caches.match(req).then(r => r || caches.match('./index.html')))
  );
});
