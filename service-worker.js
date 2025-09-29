// service-worker.js
const CACHE_NAME = 'stampcard-cache-v4'; // ←毎回名前を変えると確実に更新されます
const ASSETS = ['./','./index.html','./manifest.webmanifest','./icons/icon-192.png','./icons/icon-512.png'];

self.addEventListener('install', e=>{
  e.waitUntil(caches.open(CACHE_NAME).then(c=>c.addAll(ASSETS)));
  self.skipWaiting(); // すぐ新SWへ
});

self.addEventListener('activate', e=>{
  e.waitUntil(
    caches.keys().then(keys=>Promise.all(keys.map(k=>k!==CACHE_NAME && caches.delete(k))))
  );
  self.clients.claim(); // すぐ制御
});

self.addEventListener('fetch', e=>{
  e.respondWith(
    caches.match(e.request).then(r=> r || fetch(e.request).then(resp=>{
      const copy = resp.clone();
      caches.open(CACHE_NAME).then(c=>c.put(e.request, copy)).catch(()=>{});
      return resp;
    }))
  );
});

// ページ側からの即時更新要求
self.addEventListener('message', (event)=>{
  if (event.data && event.data.type === 'SKIP_WAITING') self.skipWaiting();
});
