/* Guionista — service worker: funciona sin conexión */
const VERSION='guionista-v10';
const ASSETS=['./','index.html','manifest.webmanifest','fonts/fonts.css',
  'fonts/courier-prime-latin-400-normal.woff2','fonts/courier-prime-latin-700-normal.woff2',
  'fonts/CourierPrime-Regular.ttf','fonts/CourierPrime-Bold.ttf','fonts/inter-latin-400-normal.woff2','fonts/inter-latin-500-normal.woff2','fonts/inter-latin-600-normal.woff2',
  'vendor/jspdf.umd.min.js','pies.js','icons/icon-192.png','icons/icon-512.png','icons/apple-touch-icon.png','icons/favicon-32.png'];
self.addEventListener('install',e=>{e.waitUntil(caches.open(VERSION).then(c=>c.addAll(ASSETS)).then(()=>self.skipWaiting()))});
self.addEventListener('activate',e=>{e.waitUntil(caches.keys().then(ks=>Promise.all(ks.filter(k=>k!==VERSION).map(k=>caches.delete(k)))).then(()=>self.clients.claim()))});
const timeout=(p,ms)=>Promise.race([p,new Promise((_,r)=>setTimeout(()=>r(new Error('timeout')),ms))]);
self.addEventListener('fetch',e=>{
  const req=e.request;if(req.method!=='GET')return;
  const url=new URL(req.url);if(url.origin!==location.origin)return;
  if(req.mode==='navigate'){
    // la página: primero la red (para tener siempre la última versión), si no hay, la copia guardada
    e.respondWith(timeout(fetch(req),4000).then(res=>{const cp=res.clone();caches.open(VERSION).then(c=>c.put('index.html',cp));return res})
      .catch(()=>caches.match('index.html',{ignoreSearch:true})));
    return;
  }
  e.respondWith(caches.match(req,{ignoreSearch:true}).then(hit=>hit||fetch(req).then(res=>{if(res.ok){const cp=res.clone();caches.open(VERSION).then(c=>c.put(req,cp))}return res})));
});
