const BUILD = "20261004-9";
const CACHE = "ad-argoncilhe-runtime-" + BUILD;
self.addEventListener("install", event => { event.waitUntil(self.skipWaiting()); });
self.addEventListener("activate", event => { event.waitUntil((async()=>{const keys=await caches.keys();await Promise.all(keys.filter(k=>k.startsWith("ad-argoncilhe-runtime-")&&k!==CACHE).map(k=>caches.delete(k)));await self.clients.claim();})()); });
self.addEventListener("message", event => { if(event.data?.type === "SKIP_WAITING") self.skipWaiting(); });
self.addEventListener("fetch", event => {
 const req=event.request; if(req.method!=="GET") return;
 const url=new URL(req.url);
 if(url.origin!==self.location.origin || /\/(rest|auth|realtime)\//.test(url.pathname)) return;
 if(req.mode==="navigate") { event.respondWith((async()=>{try{const fresh=await fetch(new Request(req,{cache:"no-store"}));if(fresh.ok){const c=await caches.open(CACHE);c.put(req,fresh.clone()).catch(()=>{});}return fresh;}catch(e){return (await caches.match(req))||(await caches.match("./index.html"))||Response.error();}})());return; }
 event.respondWith((async()=>{try{const fresh=await fetch(new Request(req,{cache:"no-store"}));if(fresh.ok && ["script","style","manifest"].includes(req.destination)){const c=await caches.open(CACHE);c.put(req,fresh.clone()).catch(()=>{});}return fresh;}catch(e){return (await caches.match(req))||Response.error();}})());
});
