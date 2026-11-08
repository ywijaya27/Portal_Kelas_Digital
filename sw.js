// Hanya shell publik. Tidak menyimpan token, respons API, bukti, atau materi berbayar.
const PREFIX='pkd-shell-',CACHE=PREFIX+'1.0.3';
const ASSETS=['./','./index.html','./css/style.css','./js/config.js','./js/app.js','./js/api.js','./js/demo.js','./js/xlsx.js','./manifest.webmanifest','./assets/icon.svg','./assets/icon-192.png','./assets/icon-512.png','./assets/code.svg','./assets/marketing.svg','./assets/design.svg','./assets/business.svg','./assets/welcome.svg'];
self.addEventListener('install',e=>{e.waitUntil(caches.open(CACHE).then(c=>c.addAll(ASSETS)).then(()=>self.skipWaiting()));});
self.addEventListener('activate',e=>{e.waitUntil(caches.keys().then(keys=>Promise.all(keys.filter(k=>k.startsWith(PREFIX)&&k!==CACHE).map(k=>caches.delete(k)))).then(()=>self.clients.claim()));});
self.addEventListener('fetch',e=>{const u=new URL(e.request.url);if(e.request.method!=='GET'||u.origin!==self.location.origin)return;const relative=u.pathname.slice(new URL(self.registration.scope).pathname.length);if(!ASSETS.some(a=>a.slice(2)===relative)&&relative!=='')return;
 // Network-first HTML/config memastikan pembaruan deployment terbaca; aset shell lain cache-first.
 if(relative===''||relative==='index.html'||relative==='js/config.js'){e.respondWith(fetch(e.request).then(r=>{if(r.ok){const copy=r.clone();caches.open(CACHE).then(c=>c.put(e.request,copy));}return r;}).catch(()=>caches.match(e.request)));return;}
 e.respondWith(caches.match(e.request).then(hit=>hit||fetch(e.request)));
});
