/* La nostra cucina — service worker v2
   Strategia: per la pagina PRIMA LA RETE (cosi' gli aggiornamenti arrivano subito),
   cache solo come rete di sicurezza offline. Icone e manifest: cache-first. */
const CACHE = "cucina-v2";
const FILES = ["./", "./index.html", "./manifest.json", "./icona.png", "./icona-512.png"];

self.addEventListener("install", e => {
  e.waitUntil(caches.open(CACHE).then(c => c.addAll(FILES)).then(() => self.skipWaiting()));
});

self.addEventListener("activate", e => {
  e.waitUntil(caches.keys().then(keys =>
    Promise.all(keys.filter(k => k !== CACHE).map(k => caches.delete(k)))
  ).then(() => self.clients.claim()));
});

self.addEventListener("fetch", e => {
  const req = e.request;
  const isPage = req.mode === "navigate" || (req.destination === "document") || /index\.html$|\/$/.test(new URL(req.url).pathname);
  if (isPage) {
    /* rete prima: l'aggiornamento su GitHub arriva alla prima apertura */
    e.respondWith(
      fetch(req).then(r => {
        const cp = r.clone();
        caches.open(CACHE).then(c => c.put("./index.html", cp));
        return r;
      }).catch(() => caches.match("./index.html"))
    );
  } else {
    e.respondWith(
      caches.match(req).then(hit => hit ||
        fetch(req).then(r => {
          if (req.method === "GET" && r.ok) {
            const cp = r.clone();
            caches.open(CACHE).then(c => c.put(req, cp));
          }
          return r;
        })
      )
    );
  }
});
