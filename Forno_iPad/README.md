# Forno

Guida passo per passo, su iPad, per usare il forno a microonde di casa
(Whirlpool Chef Plus MCP 349, chiamato nell'app semplicemente "Forno").
Pensata per una persona anziana con iniziali difficoltà cognitive:
testi molto grandi, una sola istruzione per schermata, lettura in voce e
nessuna schermata che cambia da sola. Le scritte inglesi del forno compaiono
solo nella guida dedicata, sempre accanto alla spiegazione italiana.

## Come è fatta

| File | A cosa serve |
|---|---|
| `index.html` | la pagina dell'app (solo struttura) |
| `style.css` | aspetto: testi grandi, contrasto alto, pulsanti da 60 px in su |
| `app.js` | la logica: schermate, navigazione, voce, pannello per chi assiste |
| `data.js` | **tutti i contenuti**: tempi, ricette, tasti, display, avvertenze, comportamento di JET START |
| `sw.js` | funzionamento senza rete (dopo la prima apertura) |
| `manifest.webmanifest` | installazione sulla schermata Home dell'iPad |
| `assets/disegni/` | disegni con cerchi e frecce sui tasti da premere |
| `assets/foto/` | fotografia originale e versione raddrizzata del pannello reale |
| `qa.js` | controlli automatici (`node qa.js`) |

Niente librerie esterne, niente rete necessaria dopo la prima apertura.

## Le fotografie reali

La fotografia fornita del pannello è conservata senza modifiche in
`assets/foto/pannello-originale.png`. L'app usa
`assets/foto/pannello-reale.png`, una copia raddrizzata e più leggibile.
Il cerchio rosso viene aggiunto dall'app sul tasto scelto: la stessa foto
resta riconoscibile e serve per tutti i comandi.

Mancano ancora soltanto due fotografie facoltative dello sportello:
`porta-aperta.jpg` e `porta-chiusa.jpg`. Se non ci sono, l'app mostra
automaticamente il disegno corrispondente.

## Guida al forno

Dalla prima schermata, il pulsante **Guida al forno** apre direttamente un
solo percorso ordinato:

1. prima si tocca uno dei 16 comandi sulla fotografia reale; in alternativa
   gli stessi comandi sono disponibili, quattro alla volta, come pulsanti
   grandi e facili da premere;
2. premendo **Fatto, avanti** si leggono, uno alla volta e sempre nello stesso
   ordine, DOOR, END, PRE HEAT, ADD, TURN, STIR, i numeri di programma, W e °C;
3. **Torna ai tasti** riporta al pannello con un solo tocco, mentre **INIZIO**
   riporta immediatamente alla Home; l'ultimo messaggio termina con **Fine**.

Le spiegazioni possono essere ascoltate in italiano. Le pagine quotidiane
sono divise in schede brevi; se uno schermo è insolitamente basso, lo
scorrimento verticale resta disponibile come sicurezza e nessun testo viene
nascosto. La guida non avvia né controlla il forno: il display mostrato
nell'app è una simulazione didattica del comportamento descritto dal manuale.

## Provare in locale

Serve un piccolo server (il service worker non parte aprendo il file e basta):

```
cd Forno_iPad
python3 -m http.server 8000
```

poi apri `http://localhost:8000` con Safari o Chrome.

Controlli automatici (138 controlli su percorsi, pannello, ricette, sicurezza, PWA):

```
node qa.js
```

(usa `jsdom` dalla cartella `node_modules` del progetto che contiene questa cartella;
se la sposti altrove: `npm install jsdom` dentro `Forno_iPad`).

## Pubblicare su GitHub Pages

1. Crea su GitHub un repository nuovo, per esempio `forno` (pubblico).
2. Dalla cartella `Forno_iPad`:
   ```
   git init
   git add .
   git commit -m "Forno: prima versione"
   git branch -M main
   git remote add origin https://github.com/TUO-NOME/forno.git
   git push -u origin main
   ```
3. Su GitHub: **Settings → Pages → Source: Deploy from a branch →
   Branch: main, cartella / (root) → Save**.
4. Dopo un paio di minuti l'app è su `https://TUO-NOME.github.io/forno/`.

## Installare sull'iPad

1. Apri l'indirizzo dell'app con **Safari** (non Chrome).
2. Tocca il pulsante **Condividi** (il quadrato con la freccia in su).
3. Tocca **Aggiungi alla schermata Home** → **Aggiungi**.
4. Sull'iPad compare l'icona **Forno**: da lì l'app si apre a schermo
   intero e funziona anche senza rete.

Consiglio: dopo l'installazione apri l'app una volta con la rete accesa,
così scarica e salva tutto per l'uso senza rete.

## Aggiornare l'app dopo una modifica

1. Modifica i file e fai `git push`.
2. In `sw.js` aumenta il numero nella riga `var VERSIONE = "forno-v16";`
   (per esempio portandolo a `"forno-v17"`): è ciò che dice all'iPad di scaricare i file nuovi.
3. Sull'iPad: apri l'app **con la rete accesa**, chiudila del tutto
   (doppio clic sul tasto Home / scorri in su) e riaprila. La seconda
   apertura usa la versione nuova.

## Modificare ricette, tempi e procedure

Tutto sta in `data.js`, in italiano commentato:

- **tempi di riscaldamento**: `CONFIG.tempi` (secondi) — modificabili anche
  dal pannello per chi assiste, senza toccare i file;
- **comportamento di JET START**: `CONFIG.jetStart` (etichetta, secondi per
  pressione, verificato sì/no). L'app calcola da sola quante pressioni
  servono: il numero non è mai scritto a mano nei testi;
- **ricette**: la lista `RICETTE`. Ogni passo è una schermata; un passo con
  `scaldaSec: 90` genera da solo le schermate "Avvia il forno" (con il
  numero di pressioni) e "Aspetta che finisca";
- **tasti e traduzioni**: la lista `FUNZIONI`, comprese le coordinate del
  riquadro rosso sulla foto;
- **messaggi del display**: la lista `DISPLAY`;
- **avvertenze di sicurezza**: la lista `SICUREZZA`.

Il **pannello per chi assiste** si apre tenendo premuto il titolo "Forno"
in alto per 3 secondi. Da lì si possono cambiare tempi, voce, ricette
attive, funzioni mostrate, foto, persona da chiamare, ed esportare o
importare tutte le impostazioni (che restano solo su quell'iPad).

## Verificare la cache (se l'app sembra vecchia)

1. Controlla di avere cambiato `VERSIONE` in `sw.js` prima del push.
2. Su Safari iPad: Impostazioni → Safari → Avanzate → Dati dei siti web →
   cerca il sito → elimina; poi riapri l'app con la rete accesa.
3. In locale: nella finestra del browser, ricarica forzando
   (Cmd+Maiusc+R) oppure usa una finestra di navigazione privata.

## Il pannello vero del forno

La guida usa la fotografia del pannello reale dell'MCP 349. Riprende i tasti
visibili: Micro, Grill, Forced Air, Combi, Crisp, Steam, Jet Reheat,
Jet Defrost, Chef Menu, Auto Clean, blocco del piatto girevole, STOP e
JET START. La guida ufficiale Whirlpool conferma che JET START avvia il
microonde a piena potenza (800 W) per 30 secondi e che ogni pressione in
più aggiunge 30 secondi; STOP o l'apertura dello sportello fermano tutto.

Le spiegazioni di accessori e funzioni derivano dal manuale MCP 349. Prima
di usare Grill, Forced Air, Combi, Crisp, Steam o un programma automatico,
va comunque controllato sul forno reale di avere l'accessorio indicato.

Gli accessori della famiglia sono stati confermati come presenti: griglia alta,
griglia bassa, piatto Crisp con manico e vaporiera.

## Come sono trattati i tempi

Il manuale conferma valori tecnici precisi: JET START usa 800 watt per 30
secondi e ogni pressione aggiunge 30 secondi; per il piatto Crisp consiglia
2-3 minuti di preriscaldamento nelle preparazioni brevi; dopo i liquidi
raccomanda 30 secondi di riposo.

Non esiste invece un tempo universale per ogni alimento. Jet Reheat, Jet
Defrost, Steam e Chef Menu calcolano la durata in base a programma, quantità
o peso. Anche il manuale dice di controllare il grado di cottura perché gli
alimenti possono variare. Per questo i tempi delle ricette domestiche restano
indicativi e ogni percorso termina con un controllo semplice del risultato.

## Test sul forno reale (da fare, con calma)

L'app dichiara i tempi come **indicativi** finché non li provi:

1. **JET START**: il comportamento (30 secondi a piena potenza per ogni
   pressione) è confermato dalla guida ufficiale, ma fai comunque una
   prova con un bicchiere d'acqua dentro il forno; poi spunta
   "Comportamento verificato" nel pannello per chi assiste.
2. **Scalda un piatto (90 secondi)** e **Scalda una tazza (60 secondi)**:
   prova con un piatto e una tazza veri e aggiusta i secondi nel pannello.
3. **Tempi delle ricette**: la potenza dei microonde varia; prova le ricette
   una per una e ritocca i valori `scaldaSec` in `data.js` se serve.
4. **Accessori**: verifica di avere la griglia alta, la griglia bassa, il
   piatto Crisp con manico e la vaporiera originali prima di seguire le
   relative spiegazioni.
5. **Voce**: controlla che sull'iPad ci sia una voce italiana
   (Impostazioni → Accessibilità → Contenuto letto → Voci → Italiano).

## Regole di sicurezza incluse nell'app

- niente metallo né alluminio, mai;
- niente contenitori chiusi ermeticamente;
- mai uova con il guscio;
- solo recipienti adatti al microonde (vetro, ceramica);
- presine sempre, attenzione a vapore e liquidi molto caldi
  (attesa di 30 secondi dopo il riscaldamento di liquidi);
- con fumo, scintille o odore di bruciato: STOP, sportello CHIUSO,
  spina staccata solo se comoda, chiedere aiuto;
- in ogni schermata c'è il pulsante rosso FERMA TUTTO;
- ogni percorso si può interrompere con "Esci" senza conseguenze.

## Limiti del progetto

- L'app **non comunica col forno**: è una guida da seguire, non un telecomando.
- Il comportamento di JET START e tutti i tempi sono **da verificare sul
  forno reale** (vedi sopra): finché non lo fai, l'app li presenta come
  indicativi.
- Le posizioni dei riquadri rossi sono state allineate alla fotografia
  fornita, ma vanno controllate sull'iPad in verticale e in orizzontale.
- La guida spiega le funzioni ma non sceglie automaticamente il programma,
  il peso, la potenza o la temperatura: per i programmi automatici resta
  necessario seguire il display e il manuale del forno.
- La lettura in voce dipende dalle voci installate sull'iPad.
- Le impostazioni del pannello per chi assiste valgono solo sul singolo
  dispositivo (si possono esportare e importare a mano).
