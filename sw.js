/* La nostra cucina — service worker v4
   Strategia: per la pagina PRIMA LA RETE, ignorando la cache del browser (cosi' gli
   aggiornamenti arrivano DAVVERO subito), con un tempo massimo di attesa: se la rete e'
   lenta si mostra intanto l'ultima versione salvata, mentre il download prosegue in
   background e aggiorna la cache per la prossima apertura. Icone e manifest: cache-first. */
const CACHE = "cucina-v4";
const FILES = ["./", "./index.html", "./manifest.json", "./icona.png", "./icona-512.png"];
const TIMEOUT_MS = 2500;

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
    /* rete prima, senza cache del browser: l'aggiornamento arriva sempre alla prima apertura */
    const netFetch = fetch(req, { cache: "no-store" }).then(r => {
      const cp = r.clone();
      caches.open(CACHE).then(c => c.put("./index.html", cp));
      return r;
    });
    e.respondWith((async () => {
      const race = await Promise.race([
        netFetch.then(r => ({ ok: true, r })).catch(() => ({ ok: false })),
        new Promise(resolve => setTimeout(() => resolve({ ok: false }), TIMEOUT_MS))
      ]);
      if (race.ok) return race.r;
      /* rete lenta o assente: si mostra subito l'ultima versione salvata */
      const cached = await caches.match("./index.html");
      if (cached) return cached;
      /* niente in cache (prima apertura in assoluto): si aspetta comunque la rete */
      try { return await netFetch; } catch (err) { return new Response("Offline", { status: 503 }); }
    })());
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
