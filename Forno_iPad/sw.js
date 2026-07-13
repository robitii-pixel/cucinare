/* ============================================================
   FORNO — service worker
   Strategia:
   - pagina (navigazioni): prima la rete, se manca si usa la
     copia salvata → gli aggiornamenti arrivano appena c'è rete,
     ma l'app funziona anche del tutto senza rete;
   - tutto il resto (stili, script, disegni): prima la copia
     salvata, la rete solo se manca → apertura immediata.
   Per pubblicare un aggiornamento: cambia VERSIONE qui sotto.
   ============================================================ */

var VERSIONE = "forno-v16";

var FILE_BASE = [
  "./",
  "./index.html",
  "./style.css?v=16",
  "./app.js?v=16",
  "./data.js?v=16",
  "./manifest.webmanifest",
  "./assets/icona-192.png",
  "./assets/icona-512.png",
  "./assets/foto/pannello-reale.png",
  "./assets/disegni/porta-chiusa.svg",
  "./assets/disegni/porta-aperta.svg",
  "./assets/disegni/pannello-jetstart.svg",
  "./assets/disegni/pannello-stop.svg",
  "./assets/disegni/piatto.svg",
  "./assets/disegni/tazza.svg",
  "./assets/disegni/tazzona.svg",
  "./assets/disegni/ciotola.svg",
  "./assets/disegni/presine.svg",
  "./assets/disegni/vapore.svg",
  "./assets/disegni/mescola.svg",
  "./assets/disegni/attesa.svg",
  "./assets/disegni/forchetta.svg",
  "./assets/disegni/ingredienti.svg",
  "./assets/disegni/fatto.svg",
  "./assets/disegni/aiuto.svg",
  "./assets/disegni/attenzione.svg"
];

self.addEventListener("install", function (e) {
  e.waitUntil(
    caches.open(VERSIONE).then(function (c) { return c.addAll(FILE_BASE); })
      .then(function () { return self.skipWaiting(); })
  );
});

self.addEventListener("activate", function (e) {
  e.waitUntil(
    caches.keys().then(function (chiavi) {
      return Promise.all(chiavi.map(function (k) {
        if (k !== VERSIONE) return caches.delete(k);
      }));
    }).then(function () { return self.clients.claim(); })
  );
});

self.addEventListener("fetch", function (e) {
  var req = e.request;
  if (req.method !== "GET") return;

  // pagina: prima la rete (per ricevere gli aggiornamenti), poi la copia
  if (req.mode === "navigate") {
    e.respondWith(
      fetch(req, { cache: "no-store" }).then(function (r) {
        var copia = r.clone();
        caches.open(VERSIONE).then(function (c) { c.put("./index.html", copia); });
        return r;
      }).catch(function () {
        return caches.match("./index.html");
      })
    );
    return;
  }

  // resto: prima la copia salvata, poi la rete
  e.respondWith(
    caches.match(req).then(function (salvata) {
      if (salvata) return salvata;
      return fetch(req).then(function (r) {
        if (r && r.ok && new URL(req.url).origin === location.origin) {
          var copia = r.clone();
          caches.open(VERSIONE).then(function (c) { c.put(req, copia); });
        }
        return r;
      });
    })
  );
});
