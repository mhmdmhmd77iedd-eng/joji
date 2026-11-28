// Offline cache: network first for the page, cache first for hashed assets.
const C = 'joji-v15';
self.addEventListener('install', (e) => { self.skipWaiting(); });
self.addEventListener('activate', (e) => e.waitUntil(caches.keys().then((ks) => Promise.all(ks.filter((k) => k !== C && !k.startsWith('joji-ai-')).map((k) => caches.delete(k)))).then(() => self.clients.claim())));
self.addEventListener('fetch', (e) => {
  const u = new URL(e.request.url);
  if (e.request.method !== 'GET' || u.origin !== location.origin) return;
  // AI model parts keep their own checked cache (joji-ai-*, kept across releases): not stored twice
  if (/\/models\/ai\/.*\.onnx\.\d+/.test(u.pathname)) return;
  // hashed files and the vision models never change under the same name
  const hashed = /\/(assets|models|mediapipe)\//.test(u.pathname);
  e.respondWith((async () => {
    const cache = await caches.open(C);
    if (hashed) {
      const hit = await cache.match(e.request);
      if (hit) return hit;
    }
    try {
      const res = await fetch(e.request);
      if (res.ok) cache.put(e.request, res.clone());
      return res;
    } catch {
      return (await cache.match(e.request)) || Response.error();
    }
  })());
});
