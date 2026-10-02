const BUILD = "20261002-7";
const CACHE = "ad-argoncilhe-runtime-" + BUILD;
self.addEventListener("install", e => e.waitUntil(self.skipWaiting()));
self.addEventListener("activate", e => e.waitUntil((async()=>{const keys=await caches.keys();await Promise.all(keys.filter(k=>k.startsWith("ad-argoncilhe-runtime-")&&k!==CACHE).map(k=>caches.delete(k)));await self.clients.claim();})()));
self.addEventListener("message", e => { if(e.data?.type==="SKIP_WAITING") self.skipWaiting(); });
self.addEventListener("fetch", e => {
 const req=e.request,url=new URL(req.url);
 if(url.origin!==self.location.origin || url.pathname.includes("/rest/") || url.pathname.includes("/auth/") || url.pathname.includes("/realtime/")) return;
 if(req.mode==="navigate") e.respondWith((async()=>{try{return await fetch(new Request(req,{cache:"no-store"}));}catch(_){return (await caches.match(req))||caches.match("./index.html")||Response.error();}})());
 else e.respondWith((async()=>{try{return await fetch(new Request(req,{cache:"no-store"}));}catch(_){return caches.match(req)||Response.error();}})());
});
