/* ============================================================
   FORNO — dati e configurazione
   Tutti i tempi e i comportamenti del forno stanno QUI,
   non nel codice. Modifica questo file (o usa il pannello
   amministratore) per cambiare tempi, ricette e testi.

   Comportamento di JET START — fonte ufficiale:
   la guida rapida Whirlpool dell'MCP 349 (codice W10890328)
   dice: "Per avviare la funzione microonde alla massima
   potenza (800 W) per 30 secondi, basta premere il pulsante
   Jet Start. Ogni pressione aggiuntiva aumenterà il tempo di
   cottura di 30 secondi." Il tasto STOP (in basso a sinistra
   del pannello) o l'apertura dello sportello fermano tutto.
   Finché "verificato" resta false, l'app mostra comunque i
   tempi come indicativi: dopo la prima prova pratica sul
   forno di casa metti "verificato: true" qui o dal pannello
   per chi assiste.
   ============================================================ */

window.FORNO_DATI = {

  /* ----- Configurazione predefinita (modificabile dal
           pannello amministratore, salvata in localStorage) ----- */
  CONFIG: {
    versione: 1,

    jetStart: {
      etichetta: "JET START",        // scritta sul tasto del forno
      secondiPerPressione: 30,       // ogni pressione aggiunge questi secondi
      verificato: false              // true solo dopo la prova sul forno reale
    },

    voce: {
      velocita: 0.9,                 // da 0.5 (lenta) a 1.4 (veloce)
      letturaAutomatica: true        // legge da sola ogni nuova schermata
    },

    fotografie: false,               // true = usa le foto in assets/foto/
                                     // (se una foto manca, appare il disegno)

    tempi: {                         // secondi di riscaldamento
      scaldaPiatto: 90,              // DA VERIFICARE sul forno reale
      scaldaTazza: 60                // DA VERIFICARE sul forno reale
    },

    mostra: {                        // quali funzioni compaiono nella prima schermata
      scaldaPiatto: true,
      scaldaTazza: true,
      ricette: true,
      conosciForno: true
    },

    aiuto: {                         // persona da chiamare in caso di dubbio
      nome: "",                      // es. "Roberto"
      telefono: ""                   // es. "3331234567" (vuoto = nessun pulsante)
    },

    ricetteAttive: {
      "couscous-ceci": true,
      "porridge-mela": true,
      "patata-ripiena": true,
      "tortino-zucchine": true,
      "pera-cioccolato": true,
      "uovo-strapazzato": true,
      "zucchine-yogurt": true,
      "riso-verdure": true,
      "mela-cotta": true,
      "melanzane-mozzarella": true
    }
  },

  /* ----- Avvertenze generali di sicurezza (mostrate nel
           percorso "Prima di usare il forno" e nelle ricette) ----- */
  SICUREZZA: [
    "Non mettere mai metallo o alluminio nel forno: niente posate, niente carta stagnola.",
    "Non usare contenitori chiusi ermeticamente: il coperchio va solo appoggiato.",
    "Non cuocere mai le uova con il guscio: possono scoppiare.",
    "Usa solo piatti e ciotole adatti al microonde: vetro e ceramica vanno bene.",
    "Quando togli qualcosa dal forno, usa le presine: piatti e tazze scottano.",
    "Attenzione al vapore quando sollevi un coperchio: alza il lato lontano da te.",
    "I liquidi molto caldi possono traboccare: aspetta un momento prima di prenderli.",
    "Se vedi scintille, fumo o senti odore di bruciato: premi STOP e non aprire subito lo sportello.",
    "Se hai un dubbio, fermati e chiedi aiuto: non è mai un problema."
  ],

  /* ----- Tasti reali del pannello MCP349 fotografato.
           Le coordinate sono percentuali sulla foto raddrizzata e
           servono soltanto per disegnare il cerchio rosso. ----- */
  FUNZIONI: [
    {
      id: "micro", inglese: "Micro", italiano: "Microonde",
      cosa: "Scalda e cuoce usando solo le microonde. Puoi scegliere la potenza e il tempo.",
      ricette: "Zuppe, bevande, verdure, riso già cotto e piatti da riscaldare.",
      serve: "Un recipiente adatto al microonde, di vetro o ceramica.",
      tempo: "Il tempo si sceglie con più e meno. A 800 watt, JET START parte da 30 secondi e ogni pressione aggiunge altri 30 secondi.",
      attenzione: "Per uova, formaggi e salse delicate è meglio una potenza più bassa di quella massima.",
      pos: { x: 25, y: 21, w: 25, h: 10 }
    },
    {
      id: "grill", inglese: "Grill", italiano: "Doratura dall'alto",
      cosa: "Accende la resistenza in alto. Fa una crosticina, ma non usa le microonde.",
      ricette: "Pane tostato, verdure gratinate e formaggio da dorare.",
      serve: "La griglia alta e un recipiente resistente al calore.",
      tempo: "Non c'è un tempo unico: scegli i minuti con più e meno e controlla la doratura.",
      attenzione: "Niente plastica, legno o carta. La parte alta del forno e la griglia scottano.",
      pos: { x: 50, y: 21, w: 23, h: 10 }
    },
    {
      id: "forced-air", inglese: "Forced Air", italiano: "Aria calda ventilata",
      cosa: "Funziona come un piccolo forno ventilato e prima si preriscalda.",
      ricette: "Torte, biscotti, sformati e verdure al forno.",
      serve: "La griglia bassa e un recipiente resistente al calore.",
      tempo: "Prima scegli temperatura e tempo. Il forno esegue da solo il preriscaldamento.",
      attenzione: "Quando compare PRE HEAT, aspetta: il forno sta ancora raggiungendo la temperatura.",
      pos: { x: 76, y: 21, w: 27, h: 10 }
    },
    {
      id: "combi", inglese: "Combi", italiano: "Cottura combinata",
      cosa: "Usa le microonde insieme al grill oppure all'aria calda, così cuoce dentro e dora fuori.",
      ricette: "Patate gratinate, lasagne, sformati e verdure ripiene.",
      serve: "Un recipiente adatto sia al microonde sia alle alte temperature.",
      tempo: "Prima scegli Combi 1 o Combi 2, poi potenza o temperatura e infine il tempo.",
      attenzione: "Combi 1 significa microonde più grill. Combi 2 significa microonde più aria calda.",
      pos: { x: 25, y: 30, w: 25, h: 11 }
    },
    {
      id: "crisp", inglese: "Crisp", italiano: "Doratura sopra e sotto",
      cosa: "Usa microonde e grill insieme. Il piatto Crisp diventa molto caldo e rende il cibo croccante.",
      ricette: "Pizza, torte salate, patate e cibi impanati.",
      serve: "Solo il piatto Crisp originale e il suo manico.",
      tempo: "Per pizza e torte il manuale consiglia di scaldare prima il piatto Crisp vuoto per 2 o 3 minuti.",
      attenzione: "Il piatto Crisp scotta molto. Toglilo soltanto con il manico e le presine.",
      pos: { x: 50, y: 30, w: 23, h: 11 }
    },
    {
      id: "steam", inglese: "Steam", italiano: "Cottura al vapore",
      cosa: "Cuoce con il vapore scegliendo il tipo di alimento e la quantità.",
      ricette: "Pasta, riso, patate, verdure, pesce e frutta.",
      serve: "Solo la vaporiera fornita con il forno, appoggiata sul piatto girevole.",
      tempo: "Per pasta e riso usa il tempo scritto sulla confezione. Per gli altri alimenti il forno calcola la durata dal tipo e dal peso.",
      attenzione: "Per verdure e pesce metti 100 millilitri d'acqua nel fondo. Apri il coperchio lontano dal viso.",
      pos: { x: 76, y: 30, w: 25, h: 11 }
    },
    {
      id: "jet-reheat", inglese: "Jet Reheat", italiano: "Riscaldamento automatico",
      cosa: "Il forno sceglie da solo la durata dopo che indichi il cibo e il peso.",
      ricette: "Zuppa, salsa, pizza fredda, piatto pronto e bevande.",
      serve: "Un piatto o una ciotola adatti al microonde.",
      tempo: "Il forno calcola da solo la durata in base al tipo di alimento e al peso.",
      attenzione: "Se il forno chiede STIR, mescola. Lascia riposare il piatto prima di mangiare.",
      pos: { x: 25, y: 40, w: 28, h: 10 }
    },
    {
      id: "jet-defrost", inglese: "Jet Defrost", italiano: "Scongelamento automatico",
      cosa: "Scongela scegliendo il tipo di alimento e il suo peso.",
      ricette: "Pane, verdure, pesce, carne e pollo congelati.",
      serve: "Un piatto adatto al microonde; per il programma pane può servire il piatto Crisp.",
      tempo: "Il forno calcola da solo la durata in base al tipo di alimento e al peso.",
      attenzione: "Se il forno chiede TURN, gira il cibo. Dopo lo scongelamento cuoci subito gli alimenti crudi.",
      pos: { x: 50, y: 40, w: 28, h: 10 }
    },
    {
      id: "chef-menu", inglese: "Chef Menu", italiano: "Ricette automatiche",
      cosa: "Propone programmi già pronti. Scegli il numero della ricetta e, quando richiesto, il peso.",
      ricette: "Pizza, verdure, patate, torte e diversi alimenti congelati.",
      serve: "L'accessorio indicato dal programma sul manuale: piatto, griglia o piatto Crisp.",
      tempo: "Il forno calcola da solo la durata in base al programma e, quando richiesto, al peso.",
      attenzione: "Non scegliere un programma solo dal numero. Prima controlla a quale alimento corrisponde.",
      pos: { x: 76, y: 40, w: 28, h: 10 }
    },
    {
      id: "auto-clean", inglese: "Auto Clean", italiano: "Pulizia automatica",
      cosa: "Scalda 235 millilitri d'acqua per ammorbidire lo sporco; poi si passa un panno.",
      ricette: "Non serve per cucinare. Serve soltanto per pulire l'interno.",
      serve: "Un recipiente leggero adatto al microonde, largo 17-20 centimetri e basso.",
      tempo: "La durata compare sul display dopo aver premuto Auto Clean.",
      attenzione: "Il recipiente diventa caldo. Usa le presine. Tenendo questo tasto per 3 secondi si regola l'orologio.",
      pos: { x: 23, y: 72, w: 28, h: 10 }
    },
    {
      id: "stop-turntable", inglese: "Simbolo del piatto barrato", italiano: "Ferma il piatto girevole",
      cosa: "Ferma la rotazione quando un recipiente grande non riesce a girare.",
      ricette: "Può servire con teglie grandi usate con aria calda o cottura combinata.",
      serve: "Un recipiente che entri bene e non tocchi le pareti.",
      tempo: "Non cambia il tempo di cottura: ferma soltanto la rotazione.",
      attenzione: "Funziona soltanto con aria calda, Combi Grill e Combi Air. Di solito è meglio lasciare girare il piatto.",
      pos: { x: 76, y: 72, w: 23, h: 9 }
    },
    {
      id: "stop", inglese: "STOP", italiano: "Ferma o annulla",
      cosa: "Ferma la cottura e annulla quello che stavi impostando.",
      ricette: "Usalo ogni volta che vuoi interrompere il forno o se qualcosa non va.",
      serve: "Nessun accessorio.",
      tempo: "L'arresto è immediato.",
      attenzione: "Con fumo o scintille premi STOP e lascia chiuso lo sportello.",
      pos: { x: 23, y: 89, w: 24, h: 9 }
    },
    {
      id: "jet-start", inglese: "JET START", italiano: "Avvio rapido",
      cosa: "A forno fermo avvia 30 secondi alla massima potenza. Ogni altra pressione aggiunge 30 secondi.",
      ricette: "È il tasto più semplice per riscaldare piatti, bevande e cibi ricchi d'acqua.",
      serve: "Un recipiente adatto al microonde.",
      tempo: "Parte a 800 watt per 30 secondi. Ogni altra pressione aggiunge esattamente 30 secondi.",
      attenzione: "Se hai già scelto una funzione, JET START la avvia invece di partire con il riscaldamento rapido.",
      pos: { x: 76, y: 89, w: 28, h: 9 }
    }
  ],

  /* I tre comandi centrali non avviano una funzione: modificano
     o confermano il valore che lampeggia sul display. */
  CONTROLLI: [
    {
      id: "meno", inglese: "−", italiano: "Diminuisci",
      cosa: "Riduce il valore che lampeggia: tempo, peso, potenza, temperatura o numero del programma.",
      ricette: "Si usa dopo aver scelto una funzione, quando il valore mostrato è troppo alto.",
      serve: "Nessun accessorio.",
      tempo: "Non avvia il forno e non cambia da solo schermata.",
      attenzione: "Guarda quale numero lampeggia prima di premerlo.",
      pos: { x: 24, y: 81, w: 21, h: 7 }
    },
    {
      id: "ok", inglese: "OK", italiano: "Conferma",
      cosa: "Conferma il valore che lampeggia e porta alla scelta successiva.",
      ricette: "Si usa per confermare programma, peso, potenza, temperatura o tempo.",
      serve: "Nessun accessorio.",
      tempo: "Di solito non avvia la cottura: conferma soltanto la scelta.",
      attenzione: "Se non sei sicura del valore, premi STOP e ricomincia.",
      pos: { x: 50, y: 81, w: 21, h: 7 }
    },
    {
      id: "piu", inglese: "+", italiano: "Aumenta",
      cosa: "Aumenta il valore che lampeggia: tempo, peso, potenza, temperatura o numero del programma.",
      ricette: "Si usa dopo aver scelto una funzione, quando il valore mostrato è troppo basso.",
      serve: "Nessun accessorio.",
      tempo: "Durante la cottura, JET START aggiunge 30 secondi; il tasto più modifica invece il valore selezionato.",
      attenzione: "Guarda quale numero lampeggia prima di premerlo.",
      pos: { x: 76, y: 81, w: 21, h: 7 }
    }
  ],

  /* Risposta reale del pannello dopo il tocco. "letterale" è true
     soltanto quando il manuale conferma la scritta o il valore esatto.
     Negli altri casi descriviamo l'icona e il valore che lampeggia,
     senza inventare parole che il display non mostra. */
  MESSAGGI_TASTI: {
    "micro": { letterale: true, display: "800 W", spiega: "Si accende l'icona Microonde e lampeggia la potenza iniziale di 800 watt." },
    "grill": { letterale: false, display: "Tempo da scegliere", spiega: "Si accende l'icona Grill e lampeggia il tempo. Regolalo con più e meno." },
    "forced-air": { letterale: false, display: "Temperatura da scegliere", spiega: "Si accende l'icona della ventola e lampeggiano i gradi. Durante il preriscaldamento compare PRE HEAT." },
    "combi": { letterale: true, display: "1 oppure 2", spiega: "Scegli 1 per microonde più grill oppure 2 per microonde più aria calda, poi premi OK." },
    "crisp": { letterale: false, display: "Tempo da scegliere", spiega: "Si accende l'icona Crisp e lampeggia il tempo. Regolalo con più e meno." },
    "steam": { letterale: true, display: "P1 – P8", spiega: "Scegli il tipo di alimento: P1 pasta, P2 riso, P3-P8 gli altri alimenti indicati dal manuale." },
    "jet-reheat": { letterale: true, display: "P1 – P5", spiega: "Scegli P1 zuppa, P2 salsa, P3 pizza fredda, P4 piatto pronto o P5 bevanda; poi imposta il peso." },
    "jet-defrost": { letterale: true, display: "P1 – P6", spiega: "Scegli il tipo di alimento e poi il peso. Con P6 pane possono comparire PRE HEAT, ADD e TURN." },
    "chef-menu": { letterale: false, display: "Numero della ricetta", spiega: "Compare il numero del programma. In alcuni programmi il forno chiede anche peso, ADD, STIR o TURN." },
    "auto-clean": { letterale: false, display: "Durata della pulizia", spiega: "Si accende l'icona Auto Clean e il display mostra la durata del ciclo." },
    "stop-turntable": { letterale: false, display: "Icona piatto fermo", spiega: "Si accende o si spegne l'icona del piatto girevole. Non compare una parola." },
    "meno": { letterale: false, display: "Il numero diminuisce", spiega: "Diminuisce soltanto il valore che in quel momento lampeggia." },
    "ok": { letterale: false, display: "Scelta confermata", spiega: "Il valore smette di lampeggiare e il forno passa alla scelta successiva." },
    "piu": { letterale: false, display: "Il numero aumenta", spiega: "Aumenta soltanto il valore che in quel momento lampeggia." },
    "stop": { letterale: false, display: "Orologio oppure :", spiega: "La scelta o la cottura viene annullata. In attesa il display torna all'orologio oppure ai due punti." },
    "jet-start": { letterale: true, display: "30 secondi", spiega: "A forno fermo parte subito a 800 watt per 30 secondi. Ogni altra pressione aggiunge 30 secondi." }
  },

  DISPLAY: [
    { inglese: "DOOR", italiano: "Apri e richiudi lo sportello", spiega: "È il blocco di sicurezza: il forno vuole sapere che hai aperto la porta prima di partire." },
    { inglese: "END", italiano: "Fine", spiega: "La cottura è terminata." },
    { inglese: "PRE HEAT", italiano: "Preriscaldamento", spiega: "Aspetta. Il forno sta raggiungendo la temperatura e non devi ancora mettere il cibo se non era già previsto." },
    { inglese: "ADD", italiano: "Aggiungi", spiega: "Apri, aggiungi l'alimento richiesto, richiudi e premi JET START." },
    { inglese: "TURN", italiano: "Gira", spiega: "Apri, gira il cibo, richiudi e premi JET START." },
    { inglese: "STIR", italiano: "Mescola", spiega: "Apri, mescola il cibo, richiudi e premi JET START." },
    { inglese: "P1, P2, P3...", italiano: "Numero del programma", spiega: "Non è un errore: indica quale alimento o ricetta automatica hai scelto." },
    { inglese: "W", italiano: "Watt", spiega: "Indica la potenza delle microonde." },
    { inglese: "°C", italiano: "Gradi", spiega: "Indica la temperatura dell'aria calda." }
  ],

  /* ============================================================
     RICETTE — piatti semplici di casa, soprattutto vegetariani,
     per 1 persona (q2 = per 2 persone).
     Ogni passo ha: t (titolo breve), i (istruzione),
     img (disegno), e se serve: scaldaSec (riscaldamento),
     avviso (avvertenza mostrata in evidenza).
     I tempi di cottura sono INDICATIVI: da verificare sul
     forno reale, potenza per potenza.
     ============================================================ */
  RICETTE: [

    {
      id: "couscous-ceci",
      nome: "Cous cous con ceci e pomodorini",
      tipo: "Piatto vegetariano",
      difficolta: "Facile",
      tempoMin: 15,
      utensile: "Una ciotola grande adatta al microonde",
      ingredienti: [
        { n: "Cous cous", q1: "60 grammi (mezzo bicchiere)", q2: "120 grammi (un bicchiere)" },
        { n: "Acqua", q1: "80 millilitri (mezzo bicchiere scarso)", q2: "160 millilitri" },
        { n: "Ceci già cotti", q1: "mezza scatola, sciacquati", q2: "una scatola, sciacquati" },
        { n: "Pomodorini", q1: "6, tagliati a metà", q2: "12, tagliati a metà" },
        { n: "Olio di oliva", q1: "un cucchiaio", q2: "due cucchiai" },
        { n: "Sale", q1: "un pizzico", q2: "un pizzico abbondante" }
      ],
      passi: [
        { t: "Cous cous e acqua", i: "Metti il cous cous e l'acqua nella ciotola grande.", img: "ciotola" },
        { t: "Scalda", i: "Metti la ciotola nel forno e chiudi lo sportello.", img: "porta-chiusa", scaldaSec: 60 },
        { t: "Riposo", i: "Togli la ciotola con le presine. Appoggia sopra un piatto e aspetta 5 minuti: il cous cous assorbe l'acqua da solo.", img: "attesa", avviso: "La ciotola scotta: usa le presine." },
        { t: "Sgrana", i: "Togli il piatto e sgrana il cous cous con una forchetta, così i chicchi si separano.", img: "forchetta" },
        { t: "Aggiungi", i: "Aggiungi i ceci sciacquati e i pomodorini tagliati a metà. Mescola.", img: "mescola" },
        { t: "Scalda ancora", i: "Rimetti la ciotola nel forno e chiudi lo sportello.", img: "porta-chiusa", scaldaSec: 60 },
        { t: "Condisci", i: "Togli la ciotola con le presine. Aggiungi l'olio e il pizzico di sale. Mescola bene.", img: "mescola", avviso: "La ciotola scotta: usa le presine." }
      ],
      riposoMin: 2,
      verifica: "Il cous cous è pronto quando i chicchi sono morbidi e si separano bene con la forchetta.",
      avvertenze: ["La ciotola diventa molto calda: prendila sempre con le presine."],
      alternativa: "Se non hai i pomodorini, va bene anche mezzo pomodoro grande a pezzetti."
    },

    {
      id: "porridge-mela",
      nome: "Porridge con mela e cannella",
      tipo: "Colazione",
      difficolta: "Facile",
      tempoMin: 10,
      utensile: "Una ciotola molto grande adatta al microonde",
      ingredienti: [
        { n: "Fiocchi di avena", q1: "40 grammi (4 cucchiai colmi)", q2: "80 grammi (8 cucchiai colmi)" },
        { n: "Latte", q1: "200 millilitri (un bicchiere)", q2: "400 millilitri (due bicchieri)" },
        { n: "Mela", q1: "mezza, a pezzetti piccoli", q2: "una intera, a pezzetti piccoli" },
        { n: "Cannella", q1: "una spolverata", q2: "una spolverata" },
        { n: "Noci sgusciate", q1: "due, spezzettate", q2: "quattro, spezzettate" }
      ],
      passi: [
        { t: "Nella ciotola", i: "Metti i fiocchi di avena, il latte e i pezzetti di mela nella ciotola molto grande.", img: "ciotola", avviso: "La ciotola deve restare piena al massimo per metà: il latte può salire." },
        { t: "Prima cottura", i: "Metti la ciotola nel forno e chiudi lo sportello.", img: "porta-chiusa", scaldaSec: 60 },
        { t: "Mescola", i: "Togli la ciotola con le presine e mescola bene, anche sul fondo.", img: "mescola" },
        { t: "Finisci la cottura", i: "Rimetti la ciotola nel forno e chiudi lo sportello.", img: "porta-chiusa", scaldaSec: 60 },
        { t: "Completa", i: "Togli la ciotola con le presine. Aggiungi la cannella e le noci spezzettate. Mescola.", img: "mescola" }
      ],
      riposoMin: 2,
      verifica: "Il porridge è pronto quando è cremoso e la mela è morbida. Se è troppo denso, aggiungi un poco di latte freddo.",
      avvertenze: ["Il latte può traboccare: usa una ciotola molto grande e mescola a metà cottura."],
      alternativa: "Al posto del latte puoi usare una bevanda di soia senza zuccheri aggiunti."
    },

    {
      id: "patata-ripiena",
      nome: "Patata ripiena mediterranea",
      tipo: "Piatto vegetariano",
      difficolta: "Media",
      tempoMin: 20,
      utensile: "Un piatto adatto al microonde",
      ingredienti: [
        { n: "Patata media", q1: "una", q2: "due" },
        { n: "Pomodorini", q1: "4, a pezzetti", q2: "8, a pezzetti" },
        { n: "Olive snocciolate", q1: "5, a pezzetti", q2: "10, a pezzetti" },
        { n: "Formaggio spalmabile", q1: "due cucchiai", q2: "quattro cucchiai" },
        { n: "Olio di oliva", q1: "un cucchiaio", q2: "due cucchiai" },
        { n: "Sale", q1: "un pizzico", q2: "un pizzico abbondante" }
      ],
      passi: [
        { t: "Lava la patata", i: "Lava bene la patata sotto l'acqua. Non serve sbucciarla.", img: "ingredienti" },
        { t: "Buca la patata", i: "Punzecchia tutta la patata con una forchetta, almeno 8 volte. È importante: così non scoppia.", img: "forchetta", avviso: "Non saltare questo passo: una patata non bucata può scoppiare nel forno." },
        { t: "Scalda", i: "Metti la patata sul piatto, mettila nel forno e chiudi lo sportello.", img: "porta-chiusa", scaldaSec: 240 },
        { t: "Gira la patata", i: "Apri lo sportello e gira la patata dall'altro lato. Scotta: aiutati con una forchetta.", img: "forchetta" },
        { t: "Scalda ancora", i: "Chiudi lo sportello e scalda di nuovo.", img: "porta-chiusa", scaldaSec: 180 },
        { t: "Riposo", i: "Lascia la patata nel forno, con lo sportello chiuso, per 3 minuti: finisce di cuocere da sola.", img: "attesa" },
        { t: "Taglia e schiaccia", i: "Togli il piatto con le presine. Taglia la patata a metà per il lungo e schiaccia un poco la polpa con la forchetta.", img: "forchetta", avviso: "La patata è molto calda dentro: attenzione al vapore." },
        { t: "Farcisci", i: "Metti sopra il formaggio spalmabile, i pomodorini, le olive, l'olio e il sale.", img: "mescola" }
      ],
      riposoMin: 2,
      verifica: "La patata è pronta quando la forchetta entra facilmente fino in fondo. Se fa resistenza, scaldala ancora un minuto.",
      avvertenze: [
        "Mai avvolgere la patata nell'alluminio: nel microonde è pericoloso.",
        "La patata resta caldissima a lungo: aspetta prima del primo boccone."
      ],
      alternativa: "Al posto del formaggio spalmabile va bene la ricotta."
    },

    {
      id: "tortino-zucchine",
      nome: "Tortino di zucchine e feta",
      tipo: "Piatto vegetariano",
      difficolta: "Media",
      tempoMin: 15,
      utensile: "Una tazza grande da colazione adatta al microonde",
      ingredienti: [
        { n: "Uovo", q1: "uno", q2: "due" },
        { n: "Zucchina piccola", q1: "una, grattugiata", q2: "due, grattugiate" },
        { n: "Feta", q1: "40 grammi, a pezzetti", q2: "80 grammi, a pezzetti" },
        { n: "Sale", q1: "pochissimo (la feta è già salata)", q2: "pochissimo" },
        { n: "Olio di oliva", q1: "un cucchiaino", q2: "due cucchiaini" }
      ],
      passi: [
        { t: "Strizza la zucchina", i: "Grattugia la zucchina, poi strizzala bene con le mani per togliere l'acqua.", img: "ingredienti" },
        { t: "Sbatti l'uovo", i: "Rompi l'uovo nella tazza grande e sbattilo con una forchetta.", img: "forchetta", avviso: "Mai cuocere un uovo intero con il guscio: scoppia." },
        { t: "Unisci tutto", i: "Aggiungi nella tazza la zucchina strizzata, la feta a pezzetti, l'olio e pochissimo sale. Mescola.", img: "mescola" },
        { t: "Scalda", i: "Metti la tazza nel forno e chiudi lo sportello.", img: "porta-chiusa", scaldaSec: 90 },
        { t: "Controlla", i: "Guarda il tortino: deve essere sodo, non liquido. Se al centro è ancora liquido, chiudi lo sportello e scalda ancora 30 secondi.", img: "tazzona" }
      ],
      riposoMin: 1,
      verifica: "Il tortino è pronto quando è sodo al tatto e non ci sono parti liquide o trasparenti.",
      avvertenze: ["La tazza scotta: prendila con le presine."],
      alternativa: "Alcune fete sono fatte con caglio animale: se vuoi essere sicuro, usa un formaggio fresco con scritto vegetariano sull'etichetta, oppure la ricotta."
    },

    {
      id: "pera-cioccolato",
      nome: "Pera calda con cioccolato",
      tipo: "Dolce occasionale",
      difficolta: "Facile",
      tempoMin: 8,
      utensile: "Una ciotola adatta al microonde e un piatto per coprirla",
      ingredienti: [
        { n: "Pera matura", q1: "una, sbucciata e a fette", q2: "due, sbucciate e a fette" },
        { n: "Cioccolato fondente", q1: "un quadretto", q2: "due quadretti" },
        { n: "Acqua", q1: "un cucchiaio", q2: "due cucchiai" }
      ],
      passi: [
        { t: "Prepara la pera", i: "Sbuccia la pera, tagliala a fette e mettila nella ciotola con l'acqua.", img: "ingredienti" },
        { t: "Copri", i: "Appoggia un piatto sopra la ciotola, senza chiudere ermeticamente.", img: "ciotola" },
        { t: "Cuoci la pera", i: "Metti la ciotola nel forno e chiudi lo sportello.", img: "porta-chiusa", scaldaSec: 120 },
        { t: "Attento al vapore", i: "Togli la ciotola con le presine. Solleva il piatto dal lato lontano da te.", img: "vapore", avviso: "Il vapore scotta: tieni il viso lontano." },
        { t: "Aggiungi il cioccolato", i: "Appoggia il cioccolato sopra le fette calde, senza coprire.", img: "ciotola" },
        { t: "Fai sciogliere", i: "Rimetti la ciotola nel forno e chiudi lo sportello.", img: "porta-chiusa", scaldaSec: 30 }
      ],
      riposoMin: 2,
      verifica: "La pera è pronta quando la forchetta entra facilmente e il cioccolato è sciolto.",
      avvertenze: ["La frutta resta molto calda dentro: aspetta prima di assaggiare."],
      alternativa: "Al posto della pera puoi usare una mela. Il cioccolato si può anche non mettere."
    },

    {
      id: "uovo-strapazzato",
      nome: "Uovo strapazzato morbido",
      tipo: "Secondo piatto",
      difficolta: "Facile",
      tempoMin: 6,
      utensile: "Una ciotola adatta al microonde",
      ingredienti: [
        { n: "Uova", q1: "due", q2: "quattro" },
        { n: "Latte", q1: "due cucchiai", q2: "quattro cucchiai" },
        { n: "Sale", q1: "un pizzico", q2: "un pizzico abbondante" },
        { n: "Olio di oliva", q1: "un cucchiaino", q2: "due cucchiaini" }
      ],
      passi: [
        { t: "Sbatti le uova", i: "Rompi le uova nella ciotola. Aggiungi il latte e il sale. Sbatti bene con una forchetta.", img: "forchetta", avviso: "Mai cuocere le uova con il guscio: scoppiano. Sempre sbattute." },
        { t: "Scalda", i: "Metti la ciotola nel forno e chiudi lo sportello.", img: "porta-chiusa", scaldaSec: 30 },
        { t: "Mescola", i: "Apri lo sportello e mescola con la forchetta, staccando le parti già sode dai bordi.", img: "mescola" },
        { t: "Scalda ancora", i: "Chiudi lo sportello e scalda di nuovo.", img: "porta-chiusa", scaldaSec: 30 },
        { t: "Ultima mescolata", i: "Mescola ancora. Le uova devono essere quasi sode ma ancora lucide: finiranno di cuocere da sole nel riposo.", img: "mescola" }
      ],
      riposoMin: 1,
      verifica: "Le uova sono pronte quando sono morbide e non ci sono più parti trasparenti. Se sono ancora molto liquide, scalda altri 20 secondi.",
      avvertenze: ["Meglio toglierle un po' morbide: con il calore della ciotola finiscono di cuocere da sole."],
      alternativa: "Con un cucchiaino di parmigiano grattugiato vengono più saporite."
    },

    {
      id: "zucchine-yogurt",
      nome: "Zucchine con yogurt e basilico",
      tipo: "Contorno vegetariano",
      difficolta: "Facile",
      tempoMin: 10,
      utensile: "Una ciotola adatta al microonde e un piatto per coprirla",
      ingredienti: [
        { n: "Zucchina", q1: "una, a rondelle sottili", q2: "due, a rondelle sottili" },
        { n: "Acqua", q1: "due cucchiai", q2: "tre cucchiai" },
        { n: "Yogurt greco", q1: "due cucchiai", q2: "quattro cucchiai" },
        { n: "Basilico fresco", q1: "4 foglie", q2: "8 foglie" },
        { n: "Olio di oliva", q1: "un cucchiaio", q2: "due cucchiai" },
        { n: "Sale", q1: "un pizzico", q2: "un pizzico abbondante" }
      ],
      passi: [
        { t: "Nella ciotola", i: "Metti le rondelle di zucchina nella ciotola con due cucchiai di acqua. Appoggia sopra un piatto, senza chiudere.", img: "ciotola" },
        { t: "Scalda", i: "Metti la ciotola nel forno e chiudi lo sportello.", img: "porta-chiusa", scaldaSec: 180 },
        { t: "Attento al vapore", i: "Togli la ciotola con le presine. Solleva il piatto dal lato lontano da te: esce vapore caldo.", img: "vapore", avviso: "Il vapore scotta: solleva il coperchio lontano dal viso." },
        { t: "Scola l'acqua", i: "Butta via l'acqua rimasta nella ciotola, tenendo ferme le zucchine con una forchetta.", img: "forchetta" },
        { t: "Condisci", i: "Aspetta un minuto che si intiepidiscano. Aggiungi lo yogurt, le foglie di basilico spezzettate, l'olio e il sale. Mescola piano.", img: "mescola" }
      ],
      riposoMin: 1,
      verifica: "Le zucchine sono pronte quando sono morbide ma non sfatte. Lo yogurt va aggiunto quando non scottano più, così non impazzisce.",
      avvertenze: ["Buone tiepide o fredde: non serve mangiarle bollenti."],
      alternativa: "Al posto dello yogurt greco va bene anche la ricotta."
    },

    {
      id: "riso-verdure",
      nome: "Riso veloce con verdure",
      tipo: "Piatto vegetariano",
      difficolta: "Facile",
      tempoMin: 10,
      utensile: "Una ciotola grande adatta al microonde",
      ingredienti: [
        { n: "Riso già cotto in vaschetta", q1: "una vaschetta (circa 125 grammi)", q2: "due vaschette" },
        { n: "Piselli surgelati", q1: "tre cucchiai colmi", q2: "sei cucchiai colmi" },
        { n: "Acqua", q1: "due cucchiai", q2: "tre cucchiai" },
        { n: "Parmigiano grattugiato", q1: "un cucchiaio", q2: "due cucchiai" },
        { n: "Olio di oliva", q1: "un cucchiaio", q2: "due cucchiai" }
      ],
      passi: [
        { t: "Piselli", i: "Metti i piselli surgelati nella ciotola con due cucchiai di acqua.", img: "ciotola" },
        { t: "Scalda", i: "Metti la ciotola nel forno e chiudi lo sportello.", img: "porta-chiusa", scaldaSec: 120 },
        { t: "Aggiungi il riso", i: "Togli la ciotola con le presine. Versa il riso della vaschetta sopra i piselli e mescola. Non mettere mai la vaschetta chiusa nel forno.", img: "mescola", avviso: "Apri sempre la vaschetta del riso: mai scaldarla chiusa." },
        { t: "Scalda ancora", i: "Rimetti la ciotola nel forno e chiudi lo sportello.", img: "porta-chiusa", scaldaSec: 90 },
        { t: "Condisci", i: "Togli la ciotola con le presine. Aggiungi l'olio e il parmigiano. Mescola bene.", img: "mescola", avviso: "La ciotola scotta: usa le presine." }
      ],
      riposoMin: 1,
      verifica: "Il riso è pronto quando è caldo in ogni punto: assaggia un cucchiaino preso dal centro.",
      avvertenze: ["Controlla sulla vaschetta del riso che sia adatta al microonde solo se la usi come contenitore: meglio sempre travasare nella ciotola."],
      alternativa: "Al posto dei piselli vanno bene zucchine a dadini piccoli o mais già cotto."
    },

    {
      id: "mela-cotta",
      nome: "Mela cotta con cannella",
      tipo: "Frutta cotta",
      difficolta: "Facile",
      tempoMin: 8,
      utensile: "Una ciotola adatta al microonde e un piatto per coprirla",
      ingredienti: [
        { n: "Mela", q1: "una", q2: "due" },
        { n: "Acqua", q1: "due cucchiai", q2: "tre cucchiai" },
        { n: "Cannella in polvere", q1: "una spolverata", q2: "una spolverata" },
        { n: "Miele", q1: "un cucchiaino", q2: "due cucchiaini" }
      ],
      passi: [
        { t: "Taglia la mela", i: "Taglia la mela a spicchi e togli il torsolo con i semi. Se preferisci, sbucciala.", img: "ingredienti" },
        { t: "Nella ciotola", i: "Metti gli spicchi nella ciotola con due cucchiai di acqua. Appoggia sopra un piatto, senza chiudere.", img: "ciotola" },
        { t: "Scalda", i: "Metti la ciotola nel forno e chiudi lo sportello.", img: "porta-chiusa", scaldaSec: 180 },
        { t: "Attento al vapore", i: "Togli la ciotola con le presine. Solleva il piatto dal lato lontano da te: esce vapore caldo.", img: "vapore", avviso: "Il vapore scotta: solleva il coperchio lontano dal viso." },
        { t: "Condisci", i: "Spolvera con la cannella e aggiungi il miele sopra gli spicchi caldi.", img: "ciotola" }
      ],
      riposoMin: 2,
      verifica: "La mela è pronta quando la forchetta entra facilmente negli spicchi. Se è ancora dura, scalda un altro minuto.",
      avvertenze: ["La frutta cotta resta caldissima dentro: aspetta i minuti di riposo prima di assaggiare."],
      alternativa: "Con una pera viene altrettanto buona."
    },

    {
      id: "melanzane-mozzarella",
      nome: "Melanzane al pomodoro e mozzarella",
      tipo: "Piatto vegetariano",
      difficolta: "Media",
      tempoMin: 18,
      utensile: "Una pirofila piccola adatta al microonde e un piatto per coprirla",
      ingredienti: [
        { n: "Melanzana", q1: "mezza, a cubetti piccoli", q2: "una, a cubetti piccoli" },
        { n: "Passata di pomodoro", q1: "100 grammi (circa mezzo bicchiere)", q2: "200 grammi" },
        { n: "Mozzarella", q1: "60 grammi, ben scolata", q2: "120 grammi, ben scolata" },
        { n: "Olio di oliva", q1: "un cucchiaino", q2: "due cucchiaini" },
        { n: "Origano", q1: "un pizzico", q2: "due pizzichi" }
      ],
      passi: [
        { t: "Prepara la melanzana", i: "Taglia la melanzana a cubetti piccoli e mettila nella pirofila con un cucchiaio di acqua.", img: "ingredienti" },
        { t: "Copri", i: "Appoggia un piatto sopra la pirofila, senza chiudere ermeticamente.", img: "ciotola" },
        { t: "Cuoci la melanzana", i: "Metti la pirofila nel forno e chiudi lo sportello.", img: "porta-chiusa", scaldaSec: 240 },
        { t: "Aggiungi il pomodoro", i: "Togli la pirofila con le presine. Solleva il piatto lontano dal viso. Aggiungi la passata, l'olio e l'origano e mescola.", img: "mescola", avviso: "Il vapore scotta: tieni il viso lontano." },
        { t: "Cuoci ancora", i: "Copri di nuovo, rimetti la pirofila nel forno e chiudi lo sportello.", img: "porta-chiusa", scaldaSec: 180 },
        { t: "Aggiungi la mozzarella", i: "Togli la pirofila con le presine. Metti sopra la mozzarella ben scolata, senza coprire.", img: "ciotola" },
        { t: "Fai sciogliere", i: "Rimetti la pirofila nel forno e chiudi lo sportello.", img: "porta-chiusa", scaldaSec: 60 }
      ],
      riposoMin: 2,
      verifica: "Le melanzane sono pronte quando la forchetta entra facilmente nei cubetti e la mozzarella è sciolta. Se sono ancora dure, scalda altri 30 secondi.",
      avvertenze: ["La pirofila e il pomodoro restano molto caldi: usa le presine e aspetta prima di assaggiare."],
      alternativa: "Al posto della mozzarella puoi usare ricotta a piccoli cucchiai."
    }
  ]
};
