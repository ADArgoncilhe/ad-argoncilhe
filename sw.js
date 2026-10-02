const BUILD = "20261002-6";
const CACHE = "ad-argoncilhe-runtime-" + BUILD;

self.addEventListener("install", event => {
  self.skipWaiting();
});

self.addEventListener("activate", event => {
  event.waitUntil((async () => {
    const keys = await caches.keys();
    await Promise.all(keys.filter(k => k.startsWith("ad-argoncilhe-runtime-") && k !== CACHE).map(k => caches.delete(k)));
    await self.clients.claim();
  })());
});

self.addEventListener("message", event => {
  if (event.data?.type === "SKIP_WAITING") self.skipWaiting();
});

self.addEventListener("fetch", event => {
  const req = event.request;
  const url = new URL(req.url);

  // Never cache Supabase/API/auth/realtime requests.
  if (url.origin !== self.location.origin || url.pathname.includes("/rest/") || url.pathname.includes("/auth/") || url.pathname.includes("/realtime/")) {
    return;
  }

  // HTML navigation: always go to network first. Cache is only an offline fallback.
  if (req.mode === "navigate") {
    event.respondWith((async () => {
      try {
        const fresh = await fetch(new Request(req, {cache:"no-store"}));
        if (fresh.ok) {
          const copy = fresh.clone();
          caches.open(CACHE).then(c => c.put(req, copy)).catch(()=>{});
        }
        return fresh;
      } catch (_) {
        const cached = await caches.match(req);
        return cached || caches.match("./index.html") || Response.error();
      }
    })());
    return;
  }

  // Static same-origin files: network first, then cache.
  event.respondWith((async () => {
    try {
      const fresh = await fetch(new Request(req, {cache:"no-store"}));
      if (fresh.ok && ["script","style","manifest"].includes(req.destination)) {
        const copy=fresh.clone();
        caches.open(CACHE).then(c=>c.put(req,copy)).catch(()=>{});
      }
      return fresh;
    } catch (_) {
      return caches.match(req) || Response.error();
    }
  })());
});
