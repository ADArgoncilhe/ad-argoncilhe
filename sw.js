const BUILD_ID = "20260928223000";
const CACHE_NAME = `ad-argoncilhe-sub10-${BUILD_ID}`;
const STATIC_CACHE = `${CACHE_NAME}-static`;

const STATIC_ASSETS = [
  "./icons/icon-180.png",
  "./icons/icon-192.png",
  "./icons/icon-512.png"
];

self.addEventListener("install", event => {
  event.waitUntil(
    caches.open(STATIC_CACHE)
      .then(cache => cache.addAll(STATIC_ASSETS))
      .then(() => self.skipWaiting())
  );
});

self.addEventListener("activate", event => {
  event.waitUntil(
    caches.keys()
      .then(keys => Promise.all(
        keys
          .filter(key => key.startsWith("ad-argoncilhe-sub10-") && key !== STATIC_CACHE)
          .map(key => caches.delete(key))
      ))
      .then(() => self.clients.claim())
  );
});

self.addEventListener("fetch", event => {
  const request = event.request;
  if (request.method !== "GET") return;

  const url = new URL(request.url);
  const isSameOrigin = url.origin === self.location.origin;

  if (request.mode === "navigate" || url.pathname.endsWith("/index.html")) {
    event.respondWith(
      fetch(request, { cache: "no-store" })
        .then(response => {
          if (response && response.ok) {
            const copy = response.clone();
            caches.open(STATIC_CACHE).then(cache => cache.put("./index.html", copy)).catch(() => {});
          }
          return response;
        })
        .catch(() => caches.match("./index.html"))
    );
    return;
  }

  // Supabase e outros pedidos externos nunca passam pelo cache deste SW.
  if (!isSameOrigin) return;

  if (url.pathname.endsWith("/manifest.json")) {
    event.respondWith(
      fetch(request, { cache: "no-store" }).catch(() => caches.match(request))
    );
    return;
  }

  const isStaticAsset = /\.(?:css|js|png|jpg|jpeg|webp|svg|ico|woff2?)$/i.test(url.pathname);
  if (isStaticAsset) {
    event.respondWith(
      caches.match(request).then(cached => {
        const network = fetch(request).then(response => {
          if (response && response.ok) {
            const copy = response.clone();
            caches.open(STATIC_CACHE).then(cache => cache.put(request, copy)).catch(() => {});
          }
          return response;
        });
        return cached || network;
      })
    );
  }
});
