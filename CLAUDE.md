# La nostra cucina — istruzioni di progetto

App vegetariana personale di **Roberto** (medico neurologo, Cagliari) e **Gigi**: meal planner con
tracking di kcal/proteine, scuola di cucina ("la Bottega", 26 tecniche in curriculum), coach
comportamentale, dispensa, lista spesa, progressi. Pubblicata su GitHub Pages come PWA.
Tutta la comunicazione col proprietario è **in italiano**.

## Architettura (non negoziabile senza consenso esplicito)
- **Un solo file HTML per build**: CSS e JS inline, vanilla JS, zero dipendenze esterne, offline-first.
  Non spacchettare in moduli: la portabilità del file unico è un requisito del proprietario
  (soglia di ripensamento dichiarata: ~400 KB; oggi ~260 KB).
- **Due build sincronizzate**:
  - `la-nostra-cucina.html` = build personale (PERSONAL=true, profili precompilati con dati reali).
  - `index.html` = build web pubblicabile, **generata SOLO da `build.py`** (mai a mano):
    PERSONAL=false, zero dati personali. `build.py` contiene assert che bloccano fughe di dati.
- Dati utente in `localStorage`, chiave `settimana_veg_v2`. I piani vivono in
  `state.weeks[isoLunedì].{plan,train,sgarro,done}` — MAI in `state.plan` diretto (bug storico).
- PWA: `sw.js` con strategia **rete-prima per la pagina** (gli aggiornamenti devono arrivare
  subito), cache-first per icone/manifest. Non tornare mai a cache-first per index.html.

## Regole ferree di modifica (nate da errori reali di questo progetto)
1. **Ogni sostituzione di testo nel file va verificata con assert sull'anchor**: tre bug storici
   sono nati da replace falliti in silenzio. Nessuna modifica "alla cieca".
2. **Dopo OGNI modifica**: `npm run check` (rigenera build web + esegue le due suite QA).
   Le suite (`qa.js`, `qa-web.js`, jsdom) contano 65+ test funzionali: devono essere TUTTI verdi
   su ENTRAMBE le build prima di qualunque consegna o commit.
3. **Incrementa `APPV`** (var in testa al JS, es. "v16"→"v17") a ogni versione consegnata:
   è il marcatore visibile che il proprietario usa per verificare gli aggiornamenti sul telefono.
4. **Niente emoji nell'interfaccia**: solo le icone SVG dello sprite in testa al body
   (45 simboli `#i-*`, tratto 1.8, 24×24). Nuove icone → stesso stile. Audit: zero emoji residue.
5. **Contrasto WCAG AA (≥4.5:1)** su ogni coppia testo/sfondo, nei due temi. Il tema parte
   sempre CHIARO; il pulsante cicla chiaro→auto→scuro.
6. **Copy in italiano piano**: ogni testo del coach o parla da persona, o è un pulsante che
   agisce. Mai gergo tecnico, frecce di flusso, codici (bug storico: "R·PRE 🔋").
7. **Mobile-first**: su telefono si scorre SOLO in verticale; una schermata, un obiettivo;
   tocchi ≥44px; input ≥16px (anti-zoom iOS). La barra inferiore è riparentata nel body via JS
   (backdrop-filter dell'header rompe position:fixed su Safari: non rimuovere quel codice).
8. Formule nutrizionali: Mifflin-St Jeor, fattore 1.40 + allenamenti per-giorno; obiettivi
   ricomp −5% / cut −15%; proteine con tetto pratico vegetariano a 135 g. I valori sono
   dichiarati come stime indicative (nota presente: non rimuoverla).
9. Il proprietario NON è uno sviluppatore: spiegazioni brevi, in italiano, senza tecnicismi;
   consegne sempre pronte all'uso.

## Flusso di lavoro standard
modifica `la-nostra-cucina.html` → `npm run check` → se verde: commit con messaggio in italiano
("v17: descrizione") → push → ricordare al proprietario di verificare la versione in alto nell'app.

## File del repo pubblicato (GitHub Pages)
`index.html`, `sw.js`, `manifest.json`, `icona.png`, `icona-512.png`.
La build personale (`la-nostra-cucina.html`) e gli strumenti (qa*, build.py, CLAUDE.md, LOOP.md)
possono stare nel repo: non contengono dati sensibili? NO — la build personale CONTIENE date di
nascita e pesi: **NON committarla in un repo pubblico**. Tenerla solo locale (è in .gitignore).

## Backlog concordato
- Rotazione stagionale autunnale (settembre 2026): meccanismo `sea:` già pronto, servono ricette.
- Assistente contestuale (richiede rete: ora che l'app è online è possibile; discutere prima).
- Sync tra dispositivi = backend: rimandato; il ponte è esporta/importa.
- Modalità trasferta attiva per il viaggio in Francia 25/7–8/8 (promemoria automatico in Home).
