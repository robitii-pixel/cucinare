/* ============================================================
   FORNO — suite di controllo automatico
   Esegui con:  node qa.js   (dalla cartella Forno_iPad)
   Usa jsdom (già presente in ../node_modules).
   Simula l'app, percorre TUTTI i percorsi e TUTTE le ricette
   fino alla fine e controlla che non esistano vicoli ciechi.
   ============================================================ */
"use strict";

const fs = require("fs");
const path = require("path");
const { JSDOM } = require("jsdom");

const CARTELLA = __dirname;
let passati = 0, falliti = 0;

function ok(nome, condizione, dettaglio) {
  if (condizione) { passati++; console.log("  ok  " + nome); }
  else { falliti++; console.log("  ERRORE  " + nome + (dettaglio ? " — " + dettaglio : "")); }
}

function creaApp() {
  const html = fs.readFileSync(path.join(CARTELLA, "index.html"), "utf8");
  const dom = new JSDOM(html, { url: "https://esempio.it/", pretendToBeVisual: true, runScripts: "outside-only" });
  const w = dom.window;
  // voce finta: registra cosa viene letto
  const letture = [];
  w.SpeechSynthesisUtterance = function (t) { this.text = t; };
  w.speechSynthesis = { speak: u => letture.push(u.text), cancel: () => {}, getVoices: () => [] };
  const erroriConsole = [];
  w.console.error = (...a) => erroriConsole.push(a.join(" "));
  // carica gli script come farebbe il browser
  for (const f of ["data.js", "app.js"]) {
    const codice = fs.readFileSync(path.join(CARTELLA, f), "utf8");
    w.eval(codice);
  }
  return { w, d: w.document, letture, erroriConsole };
}

function testo(nodo) { return (nodo && nodo.textContent || "").trim(); }
function bottoni(d) { return [...d.querySelectorAll("button")]; }
function bottonePerTesto(d, t) {
  return bottoni(d).find(b => testo(b).toLowerCase().startsWith(t.toLowerCase()));
}
function trovaBottonePaginato(app, testoCercato) {
  for (let pagina = 0; pagina < 20; pagina++) {
    const trovato = bottoni(app.d).find(b => testo(b).includes(testoCercato));
    if (trovato) return trovato;
    const altre = bottonePerTesto(app.d, "Altre");
    if (!altre) return null;
    altre.click();
  }
  return null;
}
function clicca(w, b) { b.dispatchEvent(new w.window ? null : 0); }

function percorriFlusso(app, nomeBottoneIniziale, opzioni = {}) {
  const { w, d } = app;
  let b = bottonePerTesto(d, nomeBottoneIniziale);
  if (!b && nomeBottoneIniziale.startsWith("Scalda ") && bottonePerTesto(d, "Scalda qualcosa")) {
    bottonePerTesto(d, "Scalda qualcosa").click();
    b = bottonePerTesto(d, nomeBottoneIniziale);
  }
  if (!b) return { errore: "bottone di partenza non trovato: " + nomeBottoneIniziale };
  b.click();
  let schermate = 0;
  const MAX = 120;
  while (schermate < MAX) {
    schermate++;
    // ogni schermata deve avere un modo per andarsene
    const uscite = bottoni(d).filter(x => {
      const t = testo(x).toLowerCase();
      return t.startsWith("fatto") || t.startsWith("indietro") || t.startsWith("torna") ||
             t.startsWith("esci") || t.startsWith("sì") || t.startsWith("no") ||
             t.startsWith("per una") || t.startsWith("per due") || t.startsWith("chiudi");
    });
    if (!uscite.length) return { errore: "schermata senza via d'uscita dopo " + schermate + " schermate" };
    // ogni schermata di passaggio deve avere il bottone Ascolta
    if (!bottonePerTesto(d, "Ascolta")) return { errore: "manca il bottone Ascolta" };

    const fine = bottonePerTesto(d, "Torna all'inizio");
    if (fine) { fine.click(); return { schermate }; }

    if (opzioni.persone && bottonePerTesto(d, opzioni.persone)) {
      bottonePerTesto(d, opzioni.persone).click(); continue;
    }
    if (opzioni.scelte) {
      const s = opzioni.scelte.find(t => bottonePerTesto(d, t));
      if (s) { bottonePerTesto(d, s).click(); continue; }
    }
    const avanti = bottonePerTesto(d, "Fatto, avanti");
    if (avanti) { avanti.click(); continue; }
    return { errore: "nessun bottone per proseguire alla schermata " + schermate };
  }
  return { errore: "il percorso non finisce mai (più di " + MAX + " schermate)" };
}

console.log("FORNO — controlli automatici\n");

/* ---------- 1. file presenti ---------- */
console.log("File del progetto:");
for (const f of ["index.html", "style.css", "app.js", "data.js", "sw.js",
                 "manifest.webmanifest", "README.md",
                 "assets/icona-192.png", "assets/icona-512.png"]) {
  ok("esiste " + f, fs.existsSync(path.join(CARTELLA, f)));
}

/* ---------- 2. dati ---------- */
console.log("\nDati (data.js):");
{
  const app = creaApp();
  const DATI = app.w.FORNO_DATI;
  ok("configurazione presente", !!DATI && !!DATI.CONFIG && !!DATI.CONFIG.jetStart);
  ok("JET START configurabile in un punto solo",
     typeof DATI.CONFIG.jetStart.secondiPerPressione === "number");
  ok("JET START dichiarato non verificato", DATI.CONFIG.jetStart.verificato === false);
  ok("13 tasti del pannello spiegati", DATI.FUNZIONI.length === 13,
     "trovati " + DATI.FUNZIONI.length);
  ok("anche meno, OK e più sono spiegati", DATI.CONTROLLI.length === 3);
  ok("ogni tasto interattivo ha una risposta fedele",
     DATI.FUNZIONI.concat(DATI.CONTROLLI).every(f => !!DATI.MESSAGGI_TASTI[f.id]));
  ok("ogni tasto ha traduzione, uso, accessorio, tempo e avvertenza",
     DATI.FUNZIONI.every(f => f.id && f.inglese && f.italiano && f.cosa &&
       f.ricette && f.serve && f.tempo && f.attenzione));
  ok("ogni tasto ha una posizione sulla foto",
     DATI.FUNZIONI.every(f => f.pos && [f.pos.x, f.pos.y, f.pos.w, f.pos.h]
       .every(n => typeof n === "number" && n > 0)));
  ok("messaggi principali del display tradotti",
     ["DOOR", "END", "PRE HEAT", "ADD", "TURN", "STIR"].every(parola =>
       DATI.DISPLAY.some(v => v.inglese === parola)));
  ok("10 ricette", DATI.RICETTE.length === 10, "trovate " + DATI.RICETTE.length);
  const testoDati = fs.readFileSync(path.join(CARTELLA, "data.js"), "utf8");
  ok("niente cipolla, porro o curcuma", !/cipoll|porr[oi]\b|curcuma/i.test(testoDati));
  for (const r of DATI.RICETTE) {
    const campi = r.id && r.nome && r.difficolta && r.tempoMin && r.utensile &&
      Array.isArray(r.ingredienti) && r.ingredienti.length >= 3 &&
      Array.isArray(r.passi) && r.passi.length >= 4 &&
      r.riposoMin >= 1 && r.verifica && Array.isArray(r.avvertenze) && r.avvertenze.length >= 1 &&
      typeof r.alternativa === "string" && typeof r.tipo === "string";
    ok("ricetta completa: " + r.nome, !!campi);
    const q = r.ingredienti.every(i => i.n && i.q1 && i.q2);
    ok("quantità per 1 e 2 persone: " + r.nome, q);
    const scalda = r.passi.some(p => p.scaldaSec > 0);
    ok("tempi nel file dati (non nel codice): " + r.nome, scalda);
  }
  const t = app.w.__forno_test;
  const primaRicetta = DATI.RICETTE[0];
  const avvioPerUno = t.percorsoRicetta(primaRicetta, 1).passi.find(p => p.t === "Avvia il forno");
  const avvioPerDue = t.percorsoRicetta(primaRicetta, 2).passi.find(p => p.t === "Avvia il forno");
  ok("per due persone il tempo del forno aumenta", avvioPerUno.i !== avvioPerDue.i);
  // le immagini citate esistono davvero
  const chiavi = new Set();
  DATI.RICETTE.forEach(r => r.passi.forEach(p => p.img && chiavi.add(p.img)));
  let tutte = true, mancanti = [];
  for (const k of chiavi) {
    if (!fs.existsSync(path.join(CARTELLA, "assets/disegni", k + ".svg"))) { tutte = false; mancanti.push(k); }
  }
  ok("ogni disegno citato esiste", tutte, mancanti.join(", "));
}

/* ---------- 3. avvio e prima schermata ---------- */
console.log("\nPrima schermata:");
{
  const app = creaApp();
  const { d } = app;
  ok("nessun errore in console", app.erroriConsole.length === 0, app.erroriConsole[0]);
  ok("titolo Forno presente", testo(d.getElementById("titolo-app")) === "Forno");
  for (const v of ["Scalda qualcosa", "Ricette", "FERMA TUTTO", "Consigli di sicurezza", "Guida al forno"]) {
    ok("voce di menu: " + v, !!bottonePerTesto(d, v));
  }
  ok("massimo 2 scelte quotidiane", d.querySelectorAll(".menu-principale .voce-menu").length <= 2);
  bottonePerTesto(d, "Scalda qualcosa").click();
  ok("scelta separata: piatto", !!bottonePerTesto(d, "Scalda un piatto"));
  ok("scelta separata: tazza", !!bottonePerTesto(d, "Scalda una tazza"));
}

/* ---------- 3b. guida al pannello ---------- */
console.log("\nGuida al pannello reale:");
{
  let app = creaApp();
  bottonePerTesto(app.d, "Guida al forno").click();
  ok("la guida entra direttamente nel pannello", /Premi un tasto grande/.test(app.d.body.textContent));
  ok("foto reale del pannello presente",
     !!app.d.querySelector('img[src="assets/foto/pannello-reale.png"]'));
  ok("tutti i 16 tasti della foto sono toccabili", app.d.querySelectorAll(".tasto-foto").length === 16);
  ok("quattro tasti grandi sempre disponibili", app.d.querySelectorAll(".tasto-grande").length === 4);
  ok("i tasti grandi mostrano il ritaglio del tasto reale",
     app.d.querySelectorAll(".tasto-grande .foto-tasto-reale").length === 4 &&
     [...app.d.querySelectorAll(".tasto-grande")].every(b => !b.textContent.trim()));
  ok("la spiegazione si trova subito dopo i tasti grandi",
     !!(app.d.querySelector(".griglia-tasti-grandi").compareDocumentPosition(app.d.querySelector(".risposta-pannello")) & 4));
  app.d.querySelector('button[aria-label^="Tasto Micro:"]').click();
  ok("Micro produce il valore reale 800 W", /800 W/.test(app.d.querySelector(".display-simulato").textContent));
  ok("la spiegazione del tasto riunisce funzione e display",
     /microonde/i.test(app.d.querySelector(".risposta-spiegazione").textContent) &&
     /Sul display/.test(app.d.querySelector(".risposta-spiegazione").textContent));
  ok("la spiegazione del tasto si può ascoltare", !!bottonePerTesto(app.d, "Ascolta"));
  ok("dopo la scelta compare 'Scegli un altro tasto'", !!bottonePerTesto(app.d, "Scegli un altro tasto"));
  const grandiVisti = new Set();
  const ordineGrandi = [];
  for (let pagina = 0; pagina < 4; pagina++) {
    app.d.querySelectorAll("[data-tasto-grande]").forEach(b => {
      grandiVisti.add(b.getAttribute("data-tasto-grande"));
      ordineGrandi.push(b.getAttribute("data-tasto-grande"));
    });
    if (pagina < 3) bottonePerTesto(app.d, "Altre").click();
  }
  ok("tutti i 16 tasti hanno anche un pulsante grande", grandiVisti.size === 16);
  ok("i tasti seguono l'ordine fisico dall'alto in basso",
     ordineGrandi.join(",") === "micro,grill,forced-air,combi,crisp,steam,jet-reheat,jet-defrost,chef-menu,auto-clean,stop-turntable,meno,ok,piu,stop,jet-start");
  bottonePerTesto(app.d, "INIZIO").click();
  ok("INIZIO torna direttamente alla prima schermata", !!bottonePerTesto(app.d, "Guida al forno"));
  bottonePerTesto(app.d, "Guida al forno").click();
  bottonePerTesto(app.d, "Fatto, avanti").click();
  ok("display traduce DOOR", /DOOR/.test(app.d.body.textContent) && /Apri e richiudi lo sportello/.test(app.d.body.textContent));
  ok("display ha un ordine visibile", /Messaggio 1 di/.test(app.d.body.textContent));
  bottonePerTesto(app.d, "Fatto, avanti").click();
  ok("display traduce END", /END/.test(app.d.body.textContent) && /Fine/.test(app.d.body.textContent));
  bottonePerTesto(app.d, "Fatto, avanti").click();
  ok("display traduce PRE HEAT", /PRE HEAT/.test(app.d.body.textContent) && /Preriscaldamento/.test(app.d.body.textContent));
  ok("dal display si torna ai tasti con un solo tocco", !!bottonePerTesto(app.d, "Torna ai tasti"));
  ok("guida al display si può ascoltare", !!bottonePerTesto(app.d, "Ascolta"));
}

/* ---------- 4. percorsi completi ---------- */
console.log("\nPercorsi (dall'inizio alla fine):");
{
  let app = creaApp();
  let r = percorriFlusso(app, "Scalda un piatto");
  ok("Scalda un piatto arriva alla fine", !r.errore, r.errore);

  app = creaApp();
  r = percorriFlusso(app, "Scalda una tazza");
  ok("Scalda una tazza arriva alla fine", !r.errore, r.errore);

  app = creaApp();
  const t = app.w.__forno_test;
  ok("liquidi: riposo ufficiale di 30 secondi",
     t.percorsoScaldaTazza().passi.some(p => /aspetta 30 secondi/i.test(p.i)));
  ok("piatto: riposo prudente di 3 minuti",
     t.percorsoScaldaPiatto().passi.some(p => /aspetta 3 minuti/i.test(p.i)));

  app = creaApp();
  r = percorriFlusso(app, "FERMA TUTTO", { scelte: ["No, è tutto a posto"] });
  ok("Ferma tutto (tutto a posto) arriva alla fine", !r.errore, r.errore);

  app = creaApp();
  r = percorriFlusso(app, "FERMA TUTTO", { scelte: ["Sì, c'è qualcosa"] });
  ok("Ferma tutto (con fumo) arriva alla fine", !r.errore, r.errore);

  app = creaApp();
  r = percorriFlusso(app, "Consigli di sicurezza");
  ok("Consigli di sicurezza arrivano alla fine", !r.errore, r.errore);
}

/* ---------- 5. tutte le ricette, per 1 e per 2 persone ---------- */
console.log("\nRicette (dall'inizio alla fine):");
{
  const nomi = creaApp().w.FORNO_DATI.RICETTE.map(r => r.nome);
  for (const nome of nomi) {
    for (const persone of ["Per una persona", "Per due persone"]) {
      const app = creaApp();
      bottonePerTesto(app.d, "Ricette").click();
      const carta = trovaBottonePaginato(app, nome);
      if (!carta) { ok(nome + " (" + persone + ")", false, "carta non trovata"); continue; }
      carta.click();
      const r = percorriFlusso(app, persone.startsWith("Per una") ? "Per una" : "Per due");
      // percorriFlusso qui parte già dalla scelta persone
      ok(nome + " — " + persone.toLowerCase(), !r.errore, r.errore);
    }
  }
}

/* ---------- 6. indietro, esci, lettura vocale ---------- */
console.log("\nNavigazione e voce:");
{
  const app = creaApp();
  const { d } = app;
  bottonePerTesto(d, "Scalda qualcosa").click();
  bottonePerTesto(d, "Scalda un piatto").click();
  ok("passaggio numerato", /passaggio 1 di/i.test(testo(d.querySelector(".numero-passo"))));
  ok("una sola istruzione per schermata", d.querySelectorAll(".istruzione").length === 1);
  ok("immagine presente con testo alternativo",
     !!d.querySelector(".figura") &&
       ((d.querySelector(".figura").alt || d.querySelector(".figura").getAttribute("aria-label") || "").length > 3));
  bottonePerTesto(d, "Fatto, avanti").click();
  ok("avanti funziona", /passaggio 2 di/i.test(testo(d.querySelector(".numero-passo"))));
  bottonePerTesto(d, "Indietro").click();
  ok("indietro funziona", /passaggio 1 di/i.test(testo(d.querySelector(".numero-passo"))));
  const prima = app.letture.length;
  bottonePerTesto(d, "Ascolta").click();
  ok("il bottone Ascolta legge in voce", app.letture.length === prima + 1);
  ok("la lettura è in italiano piano", /passaggio 1 di/i.test(app.letture[app.letture.length - 1]));
  bottonePerTesto(d, "Esci").click();
  ok("esci chiede conferma", !!bottonePerTesto(d, "Sì, esco"));
  bottonePerTesto(d, "Sì, esco").click();
  ok("dopo l'uscita si torna alla prima schermata", !!bottonePerTesto(d, "Scalda qualcosa"));
}

/* ---------- 7. FERMA TUTTO sempre raggiungibile ---------- */
console.log("\nFerma tutto sempre a portata di mano:");
{
  const app = creaApp();
  const { d } = app;
  bottonePerTesto(d, "Scalda qualcosa").click();
  bottonePerTesto(d, "Scalda un piatto").click();
  ok("bottone rosso in alto durante un percorso", !!bottonePerTesto(d, "FERMA TUTTO"));
  bottonePerTesto(d, "FERMA TUTTO").click();
  ok("il bottone porta al percorso di arresto", /Premi STOP/i.test(testo(d.querySelector(".titolo-passo"))));
}

/* ---------- 8. la configurazione cambia davvero i testi ---------- */
console.log("\nConfigurazione (JET START in un punto solo):");
{
  const app = creaApp();
  const t = app.w.__forno_test;
  const cfg = t.leggiConfig();
  const f1 = t.percorsoScaldaPiatto();
  const avvia1 = f1.passi.find(p => p.t === "Avvia il forno");
  ok("il passo Avvia il forno cita JET START", avvia1.i.includes("JET START"));
  const attese = Math.max(1, Math.round(cfg.tempi.scaldaPiatto / cfg.jetStart.secondiPerPressione));
  ok("numero di pressioni calcolato dai dati", avvia1.i.includes("Premi " + attese + " volte"));
  cfg.jetStart.secondiPerPressione = 10;
  const f2 = t.percorsoScaldaPiatto();
  const avvia2 = f2.passi.find(p => p.t === "Avvia il forno");
  ok("cambiando la configurazione cambia il testo", avvia2.i !== avvia1.i);
  ok("avviso 'tempo indicativo' finché non verificato", !!avvia1.avviso);
  cfg.jetStart.verificato = true;
  const f3 = t.percorsoScaldaPiatto();
  ok("l'avviso sparisce dopo la verifica sul forno",
     !f3.passi.find(p => p.t === "Avvia il forno").avviso);
}

/* ---------- 9. ricette spente spariscono dall'elenco ---------- */
console.log("\nPannello amministratore:");
{
  const app = creaApp();
  const t = app.w.__forno_test;
  t.leggiConfig().ricetteAttive["melanzane-mozzarella"] = false;
  t.vaiHome();
  bottonePerTesto(app.d, "Ricette").click();
  ok("una ricetta spenta non compare",
     !trovaBottonePaginato(app, "Melanzane al pomodoro"));
  t.vaiHome();
  bottonePerTesto(app.d, "Ricette").click();
  ok("le altre restano", !!trovaBottonePaginato(app, "Cous cous"));
  t.mostra({ tipo: "admin" });
  const etichette = [...app.d.querySelectorAll(".admin .riga label")];
  ok("controlli del pannello collegati alle etichette",
     etichette.length > 0 && etichette.every(l => l.htmlFor && app.d.getElementById(l.htmlFor)));
}

/* ---------- 10. testi adatti: niente inglese, niente emoji ---------- */
console.log("\nLinguaggio:");
{
  const app = creaApp();
  const tuttoIlTesto = app.d.body.textContent;
  ok("niente termini inglesi nell'interfaccia",
     !/\b(start|stop\b(?! sul)|next|back|home|menu|ok|settings|loading)\b/i.test(
       tuttoIlTesto.replace(/JET START|STOP/g, "")));
  const codice = fs.readFileSync(path.join(CARTELLA, "app.js"), "utf8") +
                 fs.readFileSync(path.join(CARTELLA, "data.js"), "utf8");
  ok("nessuna emoji nei testi", !/[\u{1F300}-\u{1FAFF}\u{2600}-\u{27BF}]/u.test(codice));
  ok("nessun uso di innerHTML", !/\.innerHTML\s*[=+]/.test(codice));
}

/* ---------- 11. service worker e manifest coerenti ---------- */
console.log("\nPWA:");
{
  const sw = fs.readFileSync(path.join(CARTELLA, "sw.js"), "utf8");
  const inCache = [...sw.matchAll(/"\.\/([^"]+)"/g)].map(m => m[1]);
  let tutti = true, mancano = [];
  for (const f of inCache) {
    const fileLocale = f.split("?")[0];
    if (!fs.existsSync(path.join(CARTELLA, fileLocale))) { tutti = false; mancano.push(f); }
  }
  ok("ogni file elencato nel service worker esiste", tutti, mancano.join(", "));
  ok("pagina: rete prima e cache del browser ignorata",
     /req\.mode === "navigate"/.test(sw) && /fetch\(req, \{ cache: "no-store" \}\)/.test(sw));
  ok("pagina: copia offline come ripiego", /catch\(function \(\) \{\s*return caches\.match\("\.\/index\.html"\)/.test(sw));
  ok("service worker: versione aggiornata", /var VERSIONE = "forno-v18"/.test(sw));
  ok("foto reale disponibile anche senza rete", sw.includes('"./assets/foto/pannello-reale.png"'));
  const htmlPwa = fs.readFileSync(path.join(CARTELLA, "index.html"), "utf8");
  ok("pagina: service worker registrato", /serviceWorker\.register\("sw\.js"\)/.test(htmlPwa));
  const man = JSON.parse(fs.readFileSync(path.join(CARTELLA, "manifest.webmanifest"), "utf8"));
  ok("manifest: nome Forno", man.name === "Forno");
  ok("manifest: app installabile a schermo intero", man.display === "standalone");
  ok("manifest: due icone", man.icons.length === 2);
  const css = fs.readFileSync(path.join(CARTELLA, "style.css"), "utf8");
  ok("iPhone: testata adattata sotto 480 pixel",
     /@media \(max-width: 480px\)/.test(css) && /\.btn-ferma \{ font-size: 18px/.test(css));
  ok("nessun testo può essere nascosto: scorrimento verticale di emergenza",
     /\.contenuto\s*\{[^}]*overflow-y:\s*auto/s.test(css) &&
     /\.contenuto-admin\s*\{[^}]*overflow-y:\s*auto/s.test(css));
  ok("gli elementi non vengono compressi o sovrapposti",
     /\.contenuto\s*>\s*\*\s*\{[^}]*flex-shrink:\s*0/s.test(css));
}

console.log("\nRisultato: " + passati + " controlli superati, " + falliti + " falliti.");
process.exit(falliti ? 1 : 0);
