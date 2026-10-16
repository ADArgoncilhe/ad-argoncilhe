/* V28: fresh navigation, no caching of API responses, retain push support. */
const BUILD_ID = "20261016-v30";
const CACHE_NAME = `ad-argoncilhe-sub10-${BUILD_ID}`;
const APP_SHELL = ["./index.html", "./manifest.json"];
const SCOPE = new URL(self.registration.scope);
const isAppPage = url => url.origin === SCOPE.origin && (url.pathname === SCOPE.pathname || url.pathname === SCOPE.pathname + "index.html");
self.addEventListener("install", event => {
  event.waitUntil((async () => {
    const cache = await caches.open(CACHE_NAME);
    await Promise.allSettled(APP_SHELL.map(async path => {
      const response = await fetch(new Request(path, {cache:"reload"}));
      if (response.ok) await cache.put(path, response);
    }));
    await self.skipWaiting();
  })());
});
self.addEventListener("activate", event => {
  event.waitUntil((async () => {
    const names = await caches.keys();
    await Promise.all(names.filter(name => name.startsWith("ad-argoncilhe-sub10-") && name !== CACHE_NAME).map(name => caches.delete(name)));
    await self.clients.claim();
  })());
});
self.addEventListener("fetch", event => {
  const request = event.request;
  if (request.method !== "GET") return;
  const url = new URL(request.url);
  // Never intercept external requests, authentication, database or API traffic.
  if (url.origin !== SCOPE.origin || !url.pathname.startsWith(SCOPE.pathname)) return;
  if (request.mode === "navigate" || isAppPage(url)) {
    event.respondWith((async () => {
      try {
        const response = await fetch(new Request(request, {cache:"no-store"}));
        if (response.ok) return response;
        throw new Error("Navigation unavailable");
      } catch (_) {
        const cache = await caches.open(CACHE_NAME);
        return (await cache.match("./index.html")) || Response.error();
      }
    })());
    return;
  }
  // Only explicitly identified local static resources may be cached.
  if ([".png",".jpg",".jpeg",".webp",".svg",".ico",".css",".js",".json"].some(ext => url.pathname.toLowerCase().endsWith(ext))) {
    event.respondWith((async () => {
      try {
        const response = await fetch(request);
        if (response.ok && response.type === "basic") {
          const cache = await caches.open(CACHE_NAME);
          await cache.put(request, response.clone());
        }
        return response;
      } catch (_) {
        const cache = await caches.open(CACHE_NAME);
        return (await cache.match(request)) || Response.error();
      }
    })());
  }
});

self.addEventListener("push", event => {
  let data = {};
  try { data = event.data ? event.data.json() : {}; } catch (_) { data = { body: event.data?.text?.() || "Há uma atualização na equipa." }; }
  const title = data.title || "AD Argoncilhe Sub-10";
  const options = {
    body: data.body || "Há uma nova atualização na aplicação.",
    icon: data.icon || "./icons/icon-192.png",
    badge: data.badge || "./icons/icon-192.png",
    tag: data.tag || "ad-argoncilhe-update",
    renotify: true,
    data: { url: data.url || "./" },
    vibrate: [100, 50, 100]
  };
  event.waitUntil(self.registration.showNotification(title, options));
});

self.addEventListener("notificationclick", event => {
  event.notification.close();
  const target = new URL(event.notification.data?.url || "./", self.location.origin).href;
  event.waitUntil((async () => {
    const clients = await self.clients.matchAll({ type: "window", includeUncontrolled: true });
    for (const client of clients) {
      if ("focus" in client) {
        try { await client.focus(); } catch (_) {}
        if ("navigate" in client) { try { await client.navigate(target); } catch (_) {} }
        return;
      }
    }
    if (self.clients.openWindow) await self.clients.openWindow(target);
  })());
});
