/* ============================================================
   FORNO — logica dell'app
   Navigazione lineare: una schermata, una azione.
   Tutti i contenuti vengono da data.js (window.FORNO_DATI).
   Nessuna dipendenza esterna. Nessun innerHTML con dati:
   ogni testo entra nel DOM con textContent.
   ============================================================ */
(function () {
  "use strict";

  var DATI = window.FORNO_DATI;
  var CHIAVE_CONFIG = "forno_config_v1";
  var CHIAVE_RIPRESA = "forno_ripresa_v1";
  var RIPRESA_MAX_MIN = 45; // dopo 45 minuti si riparte dall'inizio

  /* ---------------- configurazione ---------------- */

  function copiaProfonda(o) { return JSON.parse(JSON.stringify(o)); }

  function unisci(base, extra) {
    // riempie base con i valori salvati, senza perdere le chiavi nuove
    var out = copiaProfonda(base);
    if (!extra || typeof extra !== "object") return out;
    Object.keys(extra).forEach(function (k) {
      if (out[k] && typeof out[k] === "object" && !Array.isArray(out[k]) &&
          extra[k] && typeof extra[k] === "object" && !Array.isArray(extra[k])) {
        out[k] = unisci(out[k], extra[k]);
      } else if (extra[k] !== undefined) {
        out[k] = extra[k];
      }
    });
    return out;
  }

  function caricaConfig() {
    var salvata = null;
    try { salvata = JSON.parse(localStorage.getItem(CHIAVE_CONFIG) || "null"); }
    catch (e) { salvata = null; }
    return unisci(DATI.CONFIG, salvata);
  }

  function salvaConfig() {
    try { localStorage.setItem(CHIAVE_CONFIG, JSON.stringify(cfg)); } catch (e) {}
  }

  var cfg = caricaConfig();

  /* ---------------- testi dei tempi ---------------- */

  function durataParole(sec) {
    var m = Math.floor(sec / 60), s = sec % 60, parti = [];
    if (m === 1) parti.push("1 minuto");
    else if (m > 1) parti.push(m + " minuti");
    if (s === 1) parti.push("1 secondo");
    else if (s > 1) parti.push(s + " secondi");
    return parti.join(" e ") || "0 secondi";
  }

  function pressioniPer(sec) {
    return Math.max(1, Math.round(sec / cfg.jetStart.secondiPerPressione));
  }

  // Il passo "avvia il forno": tutto il testo viene dalla configurazione,
  // così il comportamento di JET START si corregge in un punto solo.
  function passoAvvia(sec) {
    var n = pressioniPer(sec);
    var testo;
    if (n === 1) {
      testo = "Premi 1 volta il tasto " + cfg.jetStart.etichetta +
              ". Il forno parte da solo per " + durataParole(cfg.jetStart.secondiPerPressione) + ".";
    } else {
      testo = "Premi " + n + " volte il tasto " + cfg.jetStart.etichetta +
              ". Ogni pressione aggiunge " + durataParole(cfg.jetStart.secondiPerPressione) +
              ". In tutto: " + durataParole(n * cfg.jetStart.secondiPerPressione) + ".";
    }
    return {
      t: "Avvia il forno",
      i: testo,
      img: "pannello-jetstart",
      avviso: cfg.jetStart.verificato ? null :
        "Tempo indicativo: alla prima prova controlla il risultato e, se serve, scalda ancora un poco."
    };
  }

  function passoAspetta() {
    return {
      t: "Aspetta che finisca",
      i: "Il forno lavora da solo. Quando suona e si ferma, premi il pulsante verde qui sotto.",
      img: "attesa"
    };
  }

  /* ---------------- percorsi (una azione per schermata) ---------------- */

  function passiScaldati(passi, persone) {
    // Per due porzioni aumenta il tempo del 50% e arrotonda a 30 secondi.
    // È un punto di partenza prudente: ogni ricetta chiede comunque di
    // controllare il centro del cibo prima di servirlo.
    var out = [];
    passi.forEach(function (p) {
      var passo = copiaProfonda(p);
      if (passo.scaldaSec && persone === 2) {
        passo.scaldaSec = Math.ceil((passo.scaldaSec * 1.5) / 30) * 30;
      }
      out.push(passo);
      if (passo.scaldaSec) {
        out.push(passoAvvia(passo.scaldaSec));
        out.push(passoAspetta());
      }
    });
    return out;
  }

  function percorsoScaldaPiatto() {
    return {
      id: "scalda-piatto",
      titolo: "Scalda un piatto",
      passi: passiScaldati([
        { t: "Prepara il piatto", i: "Metti il cibo in un piatto adatto al microonde: vetro o ceramica.", img: "piatto",
          avviso: "Mai metallo, mai alluminio, mai contenitori chiusi." },
        { t: "Metti il piatto nel forno", i: "Apri lo sportello e appoggia il piatto al centro.", img: "porta-aperta" },
        { t: "Chiudi lo sportello", i: "Chiudi bene lo sportello, fino allo scatto.", img: "porta-chiusa", scaldaSec: cfg.tempi.scaldaPiatto },
        { t: "Lascia riposare", i: "Quando il forno si ferma, aspetta 3 minuti. Il calore si distribuisce anche al centro del cibo.", img: "attesa" },
        { t: "Togli il piatto", i: "Apri lo sportello e togli il piatto usando le presine.", img: "presine",
          avviso: "Il piatto scotta. Se il cibo non è abbastanza caldo, rimettilo dentro e premi ancora 1 volta " + cfg.jetStart.etichetta + "." }
      ]),
      fine: { titolo: "Il piatto è pronto", testo: "Buon appetito. Mescola il cibo prima di mangiare: così il calore si distribuisce." }
    };
  }

  function percorsoScaldaTazza() {
    return {
      id: "scalda-tazza",
      titolo: "Scalda una tazza",
      passi: passiScaldati([
        { t: "Prepara la tazza", i: "Riempi la tazza, ma non fino all'orlo.", img: "tazza",
          avviso: "Solo tazze senza parti di metallo: niente bordi dorati o argentati." },
        { t: "Metti la tazza nel forno", i: "Apri lo sportello e appoggia la tazza al centro.", img: "porta-aperta" },
        { t: "Chiudi lo sportello", i: "Chiudi bene lo sportello, fino allo scatto.", img: "porta-chiusa", scaldaSec: cfg.tempi.scaldaTazza },
        { t: "Aspetta un momento", i: "Quando il forno si ferma, aspetta 30 secondi prima di aprire: il liquido si calma.", img: "attesa",
          avviso: "Un liquido scaldato troppo può fare bolle improvvise: meglio aspettare." },
        { t: "Togli la tazza", i: "Apri lo sportello e togli la tazza usando le presine. Mescola con un cucchiaino.", img: "presine",
          avviso: "Il liquido può essere più caldo della tazza: bevi a piccoli sorsi." }
      ]),
      fine: { titolo: "La tazza è pronta", testo: "Ricorda: prima piccoli sorsi, per non scottarti." }
    };
  }

  function percorsoFermaTutto() {
    // costruito con salti espliciti per la domanda sul fumo
    var passi = [
      { t: "Premi STOP", i: "Premi il tasto STOP sul pannello del forno. Il forno si ferma.", img: "pannello-stop" },
      { t: "Oppure apri lo sportello", i: "Puoi anche aprire lo sportello: il forno si ferma da solo, sempre.", img: "porta-aperta" },
      { t: "Una domanda", i: "C'è fumo, ci sono scintille o senti odore di bruciato?", img: "attenzione",
        scelta: [
          { testo: "No, è tutto a posto", vai: "fine-ok" },
          { testo: "Sì, c'è qualcosa che non va", vai: "fumo-1" }
        ] },
      { id: "fumo-1", t: "Lascia chiuso lo sportello", i: "Non aprire lo sportello: senza aria, il fumo si spegne da solo.", img: "attenzione",
        avviso: "Aprire subito lo sportello peggiora le cose. Aspetta." },
      { id: "fumo-2", t: "Stacca la spina", i: "Se la spina è facile da raggiungere, staccala. Se non lo è, lascia stare.", img: "attenzione" },
      { id: "fumo-3", t: "Chiedi aiuto", i: "Chiama qualcuno di famiglia e racconta cosa è successo. Non usare il forno finché qualcuno non lo controlla.", img: "aiuto", vai: "fine-aiuto" },
      { id: "fine-ok", fineTitolo: "Tutto fermo", fineTesto: "Il forno è spento. Puoi stare tranquillo." },
      { id: "fine-aiuto", fineTitolo: "Hai fatto la cosa giusta", fineTesto: "Fermarsi e chiedere aiuto è sempre la scelta migliore." }
    ];
    return { id: "ferma-tutto", titolo: "Ferma tutto", passi: passi };
  }

  function percorsoSicurezza() {
    var passi = DATI.SICUREZZA.map(function (testo, i) {
      return { t: "Consiglio " + (i + 1), i: testo, img: (i >= 7 ? "attenzione" : (i === 4 ? "presine" : (i === 5 ? "vapore" : "porta-chiusa"))) };
    });
    return {
      id: "sicurezza", titolo: "Consigli di sicurezza", passi: passi,
      fine: { titolo: "Ben fatto", testo: "Questi consigli li trovi sempre qui, quando vuoi ripassarli." }
    };
  }

  function percorsoRicetta(ricetta, persone) {
    var passi = [];
    passi.push({
      t: ricetta.nome,
      i: ricetta.tipo + ". Difficoltà: " + ricetta.difficolta.toLowerCase() +
         ". Tempo indicativo: " + ricetta.tempoMin + " minuti.",
      img: "ingredienti"
    });
    passi.push({
      t: "Prepara l'utensile",
      i: "Prendi " + ricetta.utensile.toLowerCase() + ".",
      img: "contenitore",
      avviso: (ricetta.avvertenze && ricetta.avvertenze[0]) || null
    });
    passi.push({
      t: "Prepara gli ingredienti",
      i: "Ora prepariamo " + ricetta.ingredienti.length + " ingredienti, uno alla volta" +
         (persone === 2 ? ", per due persone." : "."),
      img: "ingredienti"
    });
    ricetta.ingredienti.forEach(function (ing, indiceIngrediente) {
      passi.push({
        t: "Ingrediente " + (indiceIngrediente + 1) + " di " + ricetta.ingredienti.length,
        i: ing.n + ": " + (persone === 2 ? ing.q2 : ing.q1) + ". Mettilo sul tavolo.",
        img: "ingredienti"
      });
    });
    passiScaldati(ricetta.passi, persone).forEach(function (p) { passi.push(p); });
    if (ricetta.riposoMin) {
      passi.push({
        t: "Lascia riposare",
        i: "Aspetta " + (ricetta.riposoMin === 1 ? "1 minuto" : ricetta.riposoMin + " minuti") +
           " senza fretta: il cibo finisce di cuocere e smette di scottare.",
        img: "attesa"
      });
    }
    passi.push({ t: "Controlla che sia pronto", i: ricetta.verifica, img: "forchetta" });
    return {
      id: "ricetta-" + ricetta.id,
      ricettaId: ricetta.id,
      persone: persone,
      titolo: ricetta.nome,
      passi: passi,
      fine: { titolo: "Buon appetito", testo: ricetta.alternativa || "Ben fatto." }
    };
  }

  /* ---------------- voce ---------------- */

  var vociItaliane = [];
  function aggiornaVoci() {
    try {
      vociItaliane = (window.speechSynthesis ? speechSynthesis.getVoices() : [])
        .filter(function (v) { return (v.lang || "").toLowerCase().indexOf("it") === 0; });
    } catch (e) { vociItaliane = []; }
  }
  if (window.speechSynthesis) {
    aggiornaVoci();
    speechSynthesis.onvoiceschanged = aggiornaVoci;
  }

  function parla(testo) {
    if (!window.speechSynthesis || !testo) return;
    try {
      speechSynthesis.cancel();
      var u = new SpeechSynthesisUtterance(testo);
      u.lang = "it-IT";
      u.rate = cfg.voce.velocita;
      if (vociItaliane.length) u.voice = vociItaliane[0];
      speechSynthesis.speak(u);
    } catch (e) {}
  }

  function zitto() {
    if (window.speechSynthesis) { try { speechSynthesis.cancel(); } catch (e) {} }
  }

  /* ---------------- immagini ---------------- */

  var ALT = {
    "porta-chiusa": "Il forno con lo sportello chiuso",
    "porta-aperta": "Il forno con lo sportello aperto",
    "pannello-jetstart": "Il pannello del forno: il tasto JET START è cerchiato in rosso",
    "pannello-stop": "Il pannello del forno: il tasto STOP è cerchiato in rosso",
    "piatto": "Un piatto di cibo",
    "tazza": "Una tazza",
    "tazzona": "Una tazza grande da colazione, da riempire a metà",
    "ciotola": "Una ciotola",
    "presine": "Due presine da cucina",
    "vapore": "Una ciotola da cui esce vapore",
    "mescola": "Una ciotola con un cucchiaio che mescola",
    "attesa": "Un orologio",
    "forchetta": "Una forchetta",
    "ingredienti": "Un tagliere con gli ingredienti",
    "fatto": "Un segno di spunta verde",
    "aiuto": "Un telefono per chiedere aiuto",
    "attenzione": "Un triangolo di attenzione"
  };

  function creaFigura(chiave) {
    if (!chiave) return null;
    if (chiave === "pannello-jetstart") {
      return creaFotoPannello(trovaFunzione("jet-start"), ALT[chiave], true);
    }
    if (chiave === "pannello-stop") {
      return creaFotoPannello(trovaFunzione("stop"), ALT[chiave], true);
    }
    var img = document.createElement("img");
    img.className = "figura";
    img.alt = ALT[chiave] || "";
    var disegno = "assets/disegni/" + chiave + ".svg";
    if (cfg.fotografie) {
      img.src = "assets/foto/" + chiave + ".jpg";
      img.onerror = function () { img.onerror = null; img.src = disegno; };
    } else {
      img.src = disegno;
    }
    return img;
  }

  function creaFotoPannello(funzione, alt, compatta) {
    var figura = document.createElement("figure");
    figura.className = "figura foto-pannello-wrap" + (compatta ? " foto-pannello-compatta" : "");
    figura.setAttribute("role", "img");
    figura.setAttribute("aria-label", alt || "Il pannello reale del forno");
    var img = document.createElement("img");
    img.className = "foto-pannello";
    img.src = "assets/foto/pannello-reale.png";
    img.alt = "";
    figura.appendChild(img);
    if (funzione && funzione.pos) {
      var p = funzione.pos;
      var segno = document.createElement("span");
      segno.className = "evidenzia-tasto";
      segno.setAttribute("aria-hidden", "true");
      segno.style.left = (p.x - p.w / 2) + "%";
      segno.style.top = (p.y - p.h / 2) + "%";
      segno.style.width = p.w + "%";
      segno.style.height = p.h + "%";
      figura.appendChild(segno);
    }
    return figura;
  }

  function tuttiITasti() {
    return DATI.FUNZIONI.concat(DATI.CONTROLLI || []).slice().sort(function (a, b) {
      return a.pos.y === b.pos.y ? a.pos.x - b.pos.x : a.pos.y - b.pos.y;
    });
  }

  function creaRitaglioTasto(tasto) {
    var ritaglio = el("span", "foto-tasto-reale");
    // Foto 895×1758, ritaglio largo 110 px, ingrandimento 5×.
    // Il calcolo centra esattamente la zona reale senza includere il tasto vicino.
    var inBasso = tasto.pos.y > 70;
    var altezza = Math.round(tasto.pos.h * (inBasso ? 9.2 : 7.8));
    var altezzaFoto = 110 * 5 * 1758 / 895;
    var centroY = tasto.pos.y + (inBasso ? 1.2 : -0.8);
    var posizioneY = ((centroY / 100 * altezzaFoto - altezza / 2) /
      (altezzaFoto - altezza)) * 100;
    ritaglio.style.height = altezza + "px";
    ritaglio.style.backgroundPosition = (tasto.pos.x * 1.25 - 12.5) + "% " + posizioneY + "%";
    ritaglio.setAttribute("aria-hidden", "true");
    return ritaglio;
  }

  function creaPannelloInterattivo(onScelta) {
    var figura = creaFotoPannello(null, "Pannello reale interattivo del forno", true);
    figura.className += " pannello-interattivo";
    figura.removeAttribute("role");
    figura.removeAttribute("aria-label");
    tuttiITasti().forEach(function (tasto) {
      var p = tasto.pos;
      var b = bottone("", "tasto-foto", function () { onScelta(tasto, b); },
        "Tasto " + tasto.inglese + ": " + tasto.italiano);
      b.setAttribute("data-tasto-id", tasto.id);
      b.style.left = (p.x - p.w / 2) + "%";
      b.style.top = (p.y - p.h / 2) + "%";
      b.style.width = p.w + "%";
      b.style.height = p.h + "%";
      figura.appendChild(b);
    });
    return figura;
  }

  /* ---------------- costruzione schermate ---------------- */

  var radice = document.getElementById("app");
  var pila = [];           // pila delle schermate per "Indietro"
  var schermataAttuale = null;

  function el(tag, className, testo) {
    var n = document.createElement(tag);
    if (className) n.className = className;
    if (testo !== undefined && testo !== null) n.textContent = testo;
    return n;
  }

  function bottone(testo, className, onTap, ariaLabel) {
    var b = el("button", className, testo);
    b.type = "button";
    if (ariaLabel) b.setAttribute("aria-label", ariaLabel);
    b.addEventListener("click", onTap);
    return b;
  }

  function vai(schermata) {
    if (schermataAttuale) pila.push(schermataAttuale);
    mostra(schermata);
    try { history.pushState({ forno: pila.length }, "", ""); } catch (e) {}
  }

  function indietro() {
    if (pila.length) {
      mostra(pila.pop());
    } else {
      mostra({ tipo: "home" });
    }
  }

  window.addEventListener("popstate", function () { zitto(); indietro(); });

  function tornaAllInizio() {
    pila = [];
    scordaRipresa();
    mostra({ tipo: "home" });
    try { history.pushState({ forno: 0 }, "", ""); } catch (e) {}
  }

  /* ---------------- memoria dell'ultimo passaggio ---------------- */

  function ricordaRipresa(flusso, indice) {
    var dati = { idFlusso: flusso.id, ricettaId: flusso.ricettaId || null,
                 persone: flusso.persone || 1, indice: indice, quando: Date.now() };
    try { localStorage.setItem(CHIAVE_RIPRESA, JSON.stringify(dati)); } catch (e) {}
  }
  function scordaRipresa() {
    try { localStorage.removeItem(CHIAVE_RIPRESA); } catch (e) {}
  }
  function leggiRipresa() {
    try {
      var d = JSON.parse(localStorage.getItem(CHIAVE_RIPRESA) || "null");
      if (!d) return null;
      if (Date.now() - d.quando > RIPRESA_MAX_MIN * 60 * 1000) { scordaRipresa(); return null; }
      return d;
    } catch (e) { return null; }
  }

  function flussoDaRipresa(d) {
    if (d.ricettaId) {
      var r = trovaRicetta(d.ricettaId);
      return r ? percorsoRicetta(r, d.persone) : null;
    }
    if (d.idFlusso === "scalda-piatto") return percorsoScaldaPiatto();
    if (d.idFlusso === "scalda-tazza") return percorsoScaldaTazza();
    if (d.idFlusso === "ferma-tutto") return percorsoFermaTutto();
    if (d.idFlusso === "sicurezza") return percorsoSicurezza();
    return null;
  }

  function trovaRicetta(id) {
    for (var i = 0; i < DATI.RICETTE.length; i++) {
      if (DATI.RICETTE[i].id === id) return DATI.RICETTE[i];
    }
    return null;
  }

  function trovaFunzione(id) {
    var tasti = tuttiITasti();
    for (var i = 0; i < tasti.length; i++) {
      if (tasti[i].id === id) return tasti[i];
    }
    return null;
  }

  /* ---------------- disegno delle schermate ---------------- */

  function mostra(schermata) {
    schermataAttuale = schermata;
    zitto();
    radice.textContent = "";
    var daLeggere = "";

    /* --- barra sopra --- */
    var sopra = el("div", "barra-sopra");
    var mostraEsci = schermata.tipo !== "home";
    var schermataGuida = ["conosci-forno", "pannello-interattivo", "funzioni-forno",
      "funzione-forno", "display-forno"].indexOf(schermata.tipo) >= 0;
    var mostraFerma = schermata.tipo !== "home" &&
                      !(schermata.flusso && schermata.flusso.id === "ferma-tutto");

    if (mostraEsci) {
      sopra.appendChild(bottone(schermataGuida ? "INIZIO" : "Esci", "btn btn-esci", function () {
        if (schermataGuida) tornaAllInizio();
        else vai({ tipo: "conferma-esci" });
      }, schermataGuida ? "Torna subito alla prima schermata" : "Esci e torna all'inizio"));
    } else {
      sopra.appendChild(el("span"));
    }

    var titolo = el("div", "titolo-app", "Forno");
    titolo.id = "titolo-app";
    collegaPressioneLunga(titolo);
    sopra.appendChild(titolo);

    if (mostraFerma) {
      sopra.appendChild(bottone("FERMA TUTTO", "btn btn-ferma", function () {
        avviaFlusso(percorsoFermaTutto());
      }, "Ferma subito il forno"));
    } else {
      sopra.appendChild(el("span"));
    }
    radice.appendChild(sopra);

    /* --- contenuto --- */
    var mezzo = el("main", "contenuto");
    mezzo.id = "contenuto";
    radice.appendChild(mezzo);

    /* --- barra sotto --- */
    var sotto = el("div", "barra-sotto");
    radice.appendChild(sotto);

    if (schermata.tipo === "home") {
      daLeggere = disegnaHome(mezzo, sotto);
    } else if (schermata.tipo === "scelta-scalda") {
      daLeggere = disegnaSceltaScalda(mezzo, sotto);
    } else if (schermata.tipo === "ricette") {
      daLeggere = disegnaRicette(mezzo, sotto, schermata.pagina || 0);
    } else if (schermata.tipo === "conosci-forno") {
      daLeggere = disegnaPannelloInterattivo(mezzo, sotto);
    } else if (schermata.tipo === "funzioni-forno") {
      daLeggere = disegnaFunzioniForno(mezzo, sotto, schermata.pagina || 0);
    } else if (schermata.tipo === "funzione-forno") {
      daLeggere = disegnaFunzioneForno(mezzo, sotto, schermata.funzione, schermata.pagina || 0);
    } else if (schermata.tipo === "pannello-interattivo") {
      daLeggere = disegnaPannelloInterattivo(mezzo, sotto, schermata.pagina || 0);
    } else if (schermata.tipo === "display-forno") {
      daLeggere = disegnaDisplayForno(mezzo, sotto, schermata.pagina || 0);
    } else if (schermata.tipo === "persone") {
      daLeggere = disegnaPersone(mezzo, sotto, schermata.ricetta);
    } else if (schermata.tipo === "passo") {
      daLeggere = disegnaPasso(mezzo, sotto, schermata);
    } else if (schermata.tipo === "fine") {
      daLeggere = disegnaFine(mezzo, sotto, schermata);
    } else if (schermata.tipo === "conferma-esci") {
      daLeggere = disegnaConfermaEsci(mezzo, sotto);
    } else if (schermata.tipo === "ripresa") {
      daLeggere = disegnaRipresa(mezzo, sotto, schermata.dati);
    } else if (schermata.tipo === "admin") {
      mezzo.className += " contenuto-admin";
      disegnaAdmin(mezzo, sotto);
    }

    mezzo.scrollTop = 0;
    if (cfg.voce.letturaAutomatica && daLeggere && schermata.tipo !== "admin") {
      parla(daLeggere);
    }
  }

  function bottoneAscolta(testo) {
    return bottone("Ascolta", "btn btn-ascolta", function () { parla(testo); },
                   "Leggi ad alta voce questa schermata");
  }

  /* --- prima schermata --- */

  function disegnaHome(mezzo, sotto) {
    mezzo.appendChild(el("p", "saluto", "Cosa vuoi fare?"));
    var menu = el("div", "menu menu-principale");
    menu.setAttribute("role", "group");
    menu.setAttribute("aria-label", "Azioni quotidiane");

    if (cfg.mostra.scaldaPiatto || cfg.mostra.scaldaTazza) {
      menu.appendChild(bottone("Scalda qualcosa", "voce-menu", function () {
        vai({ tipo: "scelta-scalda" });
      }));
    }
    if (cfg.mostra.ricette) {
      menu.appendChild(bottone("Ricette", "voce-menu", function () {
        vai({ tipo: "ricette" });
      }));
    }
    mezzo.appendChild(menu);

    var sicurezza = el("div", "menu menu-sicurezza");
    sicurezza.setAttribute("role", "group");
    sicurezza.setAttribute("aria-label", "Arresto e sicurezza");
    sicurezza.appendChild(bottone("FERMA TUTTO", "voce-menu voce-ferma", function () {
      avviaFlusso(percorsoFermaTutto());
    }, "Ferma subito il forno"));
    sicurezza.appendChild(bottone("Consigli di sicurezza", "voce-menu", function () {
      avviaFlusso(percorsoSicurezza());
    }));
    if (cfg.mostra.conosciForno !== false) {
      sicurezza.appendChild(bottone("Guida al forno", "voce-menu", function () {
        vai({ tipo: "pannello-interattivo" });
      }));
    }
    mezzo.appendChild(sicurezza);

    var testo = "Cosa vuoi fare? Puoi scegliere: scalda qualcosa, oppure ricette. Qui sotto trovi Ferma tutto, i consigli di sicurezza e la Guida al forno.";
    sotto.appendChild(bottoneAscolta(testo));
    return null; // la prima schermata non si legge da sola: partirebbe a ogni apertura
  }

  function disegnaSceltaScalda(mezzo, sotto) {
    mezzo.appendChild(el("h1", "titolo-passo", "Cosa vuoi scaldare?"));
    var menu = el("div", "menu");
    if (cfg.mostra.scaldaPiatto) {
      menu.appendChild(bottone("Scalda un piatto", "voce-menu", function () {
        avviaFlusso(percorsoScaldaPiatto());
      }));
    }
    if (cfg.mostra.scaldaTazza) {
      menu.appendChild(bottone("Scalda una tazza", "voce-menu", function () {
        avviaFlusso(percorsoScaldaTazza());
      }));
    }
    mezzo.appendChild(menu);
    var testo = "Cosa vuoi scaldare? Tocca: scalda un piatto, oppure scalda una tazza.";
    sotto.appendChild(bottone("Indietro", "btn btn-indietro", function () { zitto(); indietro(); }));
    sotto.appendChild(bottoneAscolta(testo));
    return testo;
  }

  /* --- guida al pannello reale --- */

  function disegnaConosciForno(mezzo, sotto) {
    mezzo.className += " contenuto-conosci";
    mezzo.appendChild(el("h1", "titolo-passo", "Conosci il forno"));
    mezzo.appendChild(el("p", "introduzione-forno",
      "Scegli una cosa alla volta. Puoi anche toccare direttamente i tasti nella foto."));
    var menu = el("div", "menu");
    menu.appendChild(bottone("Tocca il pannello", "voce-menu", function () {
      vai({ tipo: "pannello-interattivo" });
    }));
    menu.appendChild(bottone("Capire i tasti", "voce-menu", function () {
      vai({ tipo: "funzioni-forno", pagina: 0 });
    }));
    menu.appendChild(bottone("Capire il display", "voce-menu", function () {
      vai({ tipo: "display-forno", pagina: 0 });
    }));
    mezzo.appendChild(menu);
    var testo = "Conosci il forno. Scegli: tocca il pannello, capire i tasti, oppure capire il display.";
    sotto.appendChild(bottone("Indietro", "btn btn-indietro", function () { zitto(); indietro(); }));
    sotto.appendChild(bottoneAscolta(testo));
    return testo;
  }

  function aggiungiPaginazione(contenitore, pagina, totalePagine, creaSchermata) {
    if (totalePagine <= 1) return;
    var nav = el("div", "paginazione");
    if (pagina > 0) {
      nav.appendChild(bottone("Precedenti", "btn-pagina", function () {
        mostra(creaSchermata(pagina - 1));
      }));
    } else {
      nav.appendChild(el("span"));
    }
    nav.appendChild(el("span", "numero-pagina", "Pagina " + (pagina + 1) + " di " + totalePagine));
    if (pagina < totalePagine - 1) {
      nav.appendChild(bottone("Altre", "btn-pagina", function () {
        mostra(creaSchermata(pagina + 1));
      }));
    } else {
      nav.appendChild(el("span"));
    }
    contenitore.appendChild(nav);
  }

  function disegnaFunzioniForno(mezzo, sotto, pagina) {
    mezzo.className += " contenuto-funzioni";
    var perPagina = 3;
    var tasti = tuttiITasti();
    var totalePagine = Math.ceil(tasti.length / perPagina);
    if (pagina >= totalePagine) pagina = totalePagine - 1;
    mezzo.appendChild(el("h1", "titolo-passo", "Cosa significano i tasti"));
    mezzo.appendChild(el("p", "introduzione-forno",
      "Tocca la parola che vedi sul forno. Sotto trovi già il significato in italiano."));
    var griglia = el("div", "griglia-funzioni");
    tasti.slice(pagina * perPagina, pagina * perPagina + perPagina).forEach(function (f) {
      var b = el("button", "carta-funzione");
      b.type = "button";
      b.appendChild(el("span", "nome-inglese", f.inglese));
      b.appendChild(el("span", "traduzione", f.italiano));
      b.addEventListener("click", function () {
        vai({ tipo: "funzione-forno", funzione: f, pagina: 0 });
      });
      griglia.appendChild(b);
    });
    mezzo.appendChild(griglia);
    aggiungiPaginazione(mezzo, pagina, totalePagine, function (p) {
      return { tipo: "funzioni-forno", pagina: p };
    });
    var testo = "Questi sono i tasti del forno. Tocca una parola per sapere che cosa fa e quando usarla.";
    sotto.appendChild(bottone("Indietro", "btn btn-indietro", function () { zitto(); indietro(); }));
    sotto.appendChild(bottoneAscolta(testo));
    return testo;
  }

  function aggiungiSpiegazione(contenitore, titolo, testo) {
    var scheda = el("section", "scheda-spiegazione");
    scheda.appendChild(el("h2", "etichetta-spiegazione", titolo));
    scheda.appendChild(el("p", "testo-spiegazione", testo));
    contenitore.appendChild(scheda);
  }

  function disegnaFunzioneForno(mezzo, sotto, funzione, pagina) {
    if (!funzione) { indietro(); return ""; }
    mezzo.className += " schermata-funzione";
    var pagine = [
      ["Che cosa fa", funzione.cosa],
      ["Quando usarlo", funzione.ricette + " Ti serve: " + funzione.serve.toLowerCase()],
      ["Tempo e attenzione", funzione.tempo + " " + funzione.attenzione]
    ];
    if (pagina >= pagine.length) pagina = pagine.length - 1;
    mezzo.appendChild(el("p", "parola-sul-forno", "Sul forno c'è scritto"));
    mezzo.appendChild(el("h1", "titolo-passo", funzione.inglese));
    mezzo.appendChild(el("p", "traduzione-grande", "In italiano: " + funzione.italiano));
    if (pagina === 0) {
      var rigaFoto = el("div", "dettaglio-funzione-con-foto");
      rigaFoto.appendChild(creaFotoPannello(funzione,
        "Il pannello reale del forno: il tasto " + funzione.inglese + " è cerchiato in rosso", true));
      aggiungiSpiegazione(rigaFoto, pagine[pagina][0], pagine[pagina][1]);
      mezzo.appendChild(rigaFoto);
    } else {
      aggiungiSpiegazione(mezzo, pagine[pagina][0], pagine[pagina][1]);
    }
    aggiungiPaginazione(mezzo, pagina, pagine.length, function (p) {
      return { tipo: "funzione-forno", funzione: funzione, pagina: p };
    });
    var testo = funzione.inglese + ". In italiano: " + funzione.italiano + ". " +
      pagine[pagina][0] + ": " + pagine[pagina][1];
    sotto.appendChild(bottone("Indietro", "btn btn-indietro", function () { zitto(); indietro(); }));
    sotto.appendChild(bottoneAscolta(testo));
    return testo;
  }

  function disegnaPannelloInterattivo(mezzo, sotto, pagina) {
    var perPagina = 4;
    var tasti = tuttiITasti();
    var totalePagine = Math.ceil(tasti.length / perPagina);
    if (pagina >= totalePagine) pagina = totalePagine - 1;
    mezzo.className += " contenuto-pannello-interattivo";
    mezzo.appendChild(el("p", "numero-passo", "Tasti " + (pagina * perPagina + 1) + "–" +
      Math.min((pagina + 1) * perPagina, tasti.length) + " di " + tasti.length));
    mezzo.appendChild(el("h1", "titolo-passo", "Premi un tasto grande"));
    var risultato = el("section", "risposta-pannello");
    var etichetta = el("p", "risposta-etichetta", "Il forno è in attesa");
    var display = el("p", "display-simulato", ":");
    var spiegazione = el("p", "risposta-spiegazione", "La spiegazione apparirà qui, subito dopo il tasto scelto.");
    risultato.appendChild(etichetta);
    risultato.appendChild(el("p", "etichetta-display-simulato", "Sul forno vedrai:"));
    risultato.appendChild(display);
    risultato.appendChild(spiegazione);
    var testoCorrente = "Il forno è in attesa. Tocca una scritta sulla foto.";
    risultato.appendChild(bottone("Ascolta", "btn-ascolta btn-ascolta-compatto", function () {
      parla(testoCorrente);
    }, "Leggi ad alta voce la spiegazione del tasto"));
    var tornaAiGrandi = bottone("Scegli un altro tasto", "btn-altro-tasto", function () {
      if (grandi && grandi.scrollIntoView) grandi.scrollIntoView({ block: "nearest" });
    });
    tornaAiGrandi.hidden = true;
    risultato.appendChild(tornaAiGrandi);
    function mostraTasto(tasto, bottoneTasto) {
      var m = DATI.MESSAGGI_TASTI[tasto.id];
      if (!m) return;
      var attivi = pannello.querySelectorAll(".tasto-foto-selezionato");
      for (var i = 0; i < attivi.length; i++) attivi[i].classList.remove("tasto-foto-selezionato");
      bottoneTasto.classList.add("tasto-foto-selezionato");
      etichetta.textContent = tasto.inglese + " — " + tasto.italiano;
      display.textContent = m.display;
      spiegazione.textContent = tasto.cosa + " Sul display: " + m.spiega;
      testoCorrente = tasto.inglese + ". " + tasto.italiano + ". " + tasto.cosa + " Sul display: " + m.spiega;
      tornaAiGrandi.hidden = false;
      if (risultato.scrollIntoView) risultato.scrollIntoView({ block: "nearest" });
    }
    var pannello = creaPannelloInterattivo(mostraTasto);
    pannello.querySelector("img").alt = "Pannello reale del forno con tasti toccabili";
    mezzo.appendChild(el("p", "invito-tasti-grandi", "Scegli un tasto grande:"));
    var grandi = el("div", "griglia-tasti-grandi");
    tasti.slice(pagina * perPagina, pagina * perPagina + perPagina).forEach(function (tasto) {
      var grande = bottone("", "tasto-grande", function () {
        mostraTasto(tasto, pannello.querySelector('[data-tasto-id="' + tasto.id + '"]'));
      }, "Spiega il tasto " + tasto.inglese);
      grande.setAttribute("data-tasto-grande", tasto.id);
      grande.appendChild(creaRitaglioTasto(tasto));
      grandi.appendChild(grande);
    });
    mezzo.appendChild(grandi);
    mezzo.appendChild(risultato);
    aggiungiPaginazione(mezzo, pagina, totalePagine, function (p) {
      return { tipo: "pannello-interattivo", pagina: p };
    });
    mezzo.appendChild(el("p", "invito-foto", "Oppure tocca il tasto sulla foto:"));
    var layout = el("div", "layout-pannello-interattivo");
    layout.appendChild(pannello);
    mezzo.appendChild(layout);
    sotto.appendChild(bottone("Indietro", "btn btn-indietro", function () { zitto(); indietro(); }));
    sotto.appendChild(bottone("Fatto, avanti", "btn btn-avanti", function () {
      zitto();
      vai({ tipo: "display-forno", pagina: 0 });
    }, "Ho finito con i tasti, mostrami il display"));
    return testoCorrente;
  }

  function disegnaDisplayForno(mezzo, sotto, pagina) {
    if (pagina >= DATI.DISPLAY.length) pagina = DATI.DISPLAY.length - 1;
    var voce = DATI.DISPLAY[pagina];
    mezzo.appendChild(el("p", "numero-passo", "Messaggio " + (pagina + 1) + " di " + DATI.DISPLAY.length));
    mezzo.appendChild(el("h1", "titolo-passo", "Sul display"));
    var lista = el("div", "lista-display");
    var scheda = el("section", "voce-display");
    scheda.appendChild(el("h2", "parola-inglese", voce.inglese));
    scheda.appendChild(el("p", "parola-italiana", voce.italiano));
    scheda.appendChild(el("p", "spiegazione-display", voce.spiega));
    lista.appendChild(scheda);
    mezzo.appendChild(lista);
    var testo = voce.inglese + " significa " + voce.italiano + ". " + voce.spiega;
    mezzo.appendChild(bottoneAscolta(testo));
    sotto.appendChild(bottone("Torna ai tasti", "btn btn-indietro", function () {
      zitto(); mostra({ tipo: "pannello-interattivo", pagina: 0 });
    }));
    if (pagina < DATI.DISPLAY.length - 1) {
      sotto.appendChild(bottone("Fatto, avanti", "btn btn-avanti", function () {
        zitto(); mostra({ tipo: "display-forno", pagina: pagina + 1 });
      }));
    } else {
      sotto.appendChild(bottone("Fine", "btn btn-avanti", function () { tornaAllInizio(); }));
    }
    return testo;
  }

  /* --- elenco ricette --- */

  function disegnaRicette(mezzo, sotto, pagina) {
    var perPagina = 3;
    mezzo.appendChild(el("p", "saluto", "Scegli una ricetta"));
    var griglia = el("div", "griglia-ricette");
    var attive = DATI.RICETTE.filter(function (r) { return cfg.ricetteAttive[r.id] !== false; });
    var totalePagine = Math.max(1, Math.ceil(attive.length / perPagina));
    if (pagina >= totalePagine) pagina = totalePagine - 1;
    attive.slice(pagina * perPagina, pagina * perPagina + perPagina).forEach(function (r) {
      var b = el("button", "carta-ricetta");
      b.type = "button";
      b.appendChild(el("span", "nome", r.nome));
      b.appendChild(el("span", "dettagli", r.tipo + " · " + r.difficolta + " · circa " + r.tempoMin + " minuti"));
      b.addEventListener("click", function () { vai({ tipo: "persone", ricetta: r }); });
      griglia.appendChild(b);
    });
    if (!attive.length) {
      mezzo.appendChild(el("p", "istruzione", "Nessuna ricetta attiva. Chiedi a chi ti aiuta con l'app."));
    }
    mezzo.appendChild(griglia);
    aggiungiPaginazione(mezzo, pagina, totalePagine, function (p) {
      return { tipo: "ricette", pagina: p };
    });
    var testo = "Scegli una ricetta toccando il suo riquadro.";
    sotto.appendChild(bottone("Indietro", "btn btn-indietro", function () { zitto(); indietro(); }));
    sotto.appendChild(bottoneAscolta(testo));
    return testo;
  }

  /* --- scelta persone --- */

  function disegnaPersone(mezzo, sotto, ricetta) {
    mezzo.appendChild(el("p", "numero-passo", ricetta.nome));
    mezzo.appendChild(el("h1", "titolo-passo", "Per quante persone?"));
    var menu = el("div", "menu");
    menu.appendChild(bottone("Per una persona", "voce-menu", function () {
      avviaFlusso(percorsoRicetta(ricetta, 1));
    }));
    menu.appendChild(bottone("Per due persone", "voce-menu", function () {
      avviaFlusso(percorsoRicetta(ricetta, 2));
    }));
    mezzo.appendChild(menu);
    var testo = ricetta.nome + ". Per quante persone vuoi cucinare? Tocca: per una persona, oppure per due persone.";
    sotto.appendChild(bottone("Indietro", "btn btn-indietro", function () { zitto(); indietro(); }));
    sotto.appendChild(bottoneAscolta(testo));
    return testo;
  }

  /* --- avvio e passi di un percorso --- */

  function avviaFlusso(flusso, indice) {
    vai({ tipo: "passo", flusso: flusso, indice: indice || 0 });
  }

  function indiceDiPasso(flusso, id) {
    for (var i = 0; i < flusso.passi.length; i++) {
      if (flusso.passi[i].id === id) return i;
    }
    return -1;
  }

  function prossimoPasso(flusso, indice) {
    var passo = flusso.passi[indice];
    var prossimo = null;
    if (passo.vai) {
      var j = indiceDiPasso(flusso, passo.vai);
      if (j >= 0) prossimo = j;
    } else if (indice + 1 < flusso.passi.length) {
      prossimo = indice + 1;
    }
    if (prossimo === null) {
      vai({ tipo: "fine", flusso: flusso });
      return;
    }
    var p = flusso.passi[prossimo];
    if (p.fineTitolo) {
      vai({ tipo: "fine", flusso: flusso, titolo: p.fineTitolo, testo: p.fineTesto });
    } else {
      vai({ tipo: "passo", flusso: flusso, indice: prossimo });
    }
  }

  function disegnaPasso(mezzo, sotto, schermata) {
    var flusso = schermata.flusso, indice = schermata.indice;
    var passo = flusso.passi[indice];
    var totale = flusso.passi.filter(function (p) { return !p.fineTitolo; }).length;
    var numero = flusso.passi.slice(0, indice + 1).filter(function (p) { return !p.fineTitolo; }).length;

    ricordaRipresa(flusso, indice);

    mezzo.appendChild(el("p", "numero-passo", "Passaggio " + numero + " di " + totale));
    mezzo.appendChild(el("h1", "titolo-passo", passo.t));

    var fig = creaFigura(passo.img);
    if (fig) mezzo.appendChild(fig);

    mezzo.appendChild(el("p", "istruzione", passo.i));

    if (passo.elenco) {
      var ul = el("ul", "elenco");
      passo.elenco.forEach(function (voce) { ul.appendChild(el("li", null, voce)); });
      mezzo.appendChild(ul);
    }

    if (passo.avviso) {
      var avv = el("p", "avviso", passo.avviso);
      avv.setAttribute("role", "note");
      mezzo.appendChild(avv);
    }

    var daLeggere = "Passaggio " + numero + " di " + totale + ". " + passo.t + ". " + passo.i +
      (passo.elenco ? " " + passo.elenco.join(". ") + "." : "") +
      (passo.avviso ? " Attenzione: " + passo.avviso : "");

    mezzo.appendChild(bottoneAscolta(daLeggere));

    if (passo.scelta) {
      var menu = el("div", "menu");
      passo.scelta.forEach(function (s) {
        menu.appendChild(bottone(s.testo, "voce-menu", function () {
          var j = indiceDiPasso(flusso, s.vai);
          if (j < 0) { vai({ tipo: "fine", flusso: flusso }); return; }
          var p = flusso.passi[j];
          if (p.fineTitolo) vai({ tipo: "fine", flusso: flusso, titolo: p.fineTitolo, testo: p.fineTesto });
          else vai({ tipo: "passo", flusso: flusso, indice: j });
        }));
      });
      mezzo.appendChild(menu);
      sotto.appendChild(bottone("Indietro", "btn btn-indietro", function () { zitto(); indietro(); }));
    } else {
      sotto.appendChild(bottone("Indietro", "btn btn-indietro", function () { zitto(); indietro(); }));
      sotto.appendChild(bottone("Fatto, avanti", "btn btn-avanti", function () {
        zitto();
        prossimoPasso(flusso, indice);
      }, "Ho fatto questo passaggio, vai avanti"));
    }
    return daLeggere;
  }

  /* --- schermata finale --- */

  function disegnaFine(mezzo, sotto, schermata) {
    scordaRipresa();
    var titolo = schermata.titolo || (schermata.flusso.fine && schermata.flusso.fine.titolo) || "Hai finito";
    var testo = schermata.testo || (schermata.flusso.fine && schermata.flusso.fine.testo) || "";
    mezzo.appendChild(el("h1", "fine-titolo", titolo));
    var fig = creaFigura("fatto");
    if (fig) mezzo.appendChild(fig);
    if (testo) mezzo.appendChild(el("p", "istruzione", testo));

    if (schermata.flusso.id === "ferma-tutto" && cfg.aiuto.telefono) {
      var tel = document.createElement("a");
      tel.href = "tel:" + cfg.aiuto.telefono;
      tel.className = "btn btn-avanti";
      tel.style.textDecoration = "none";
      tel.style.marginTop = "18px";
      tel.textContent = "Chiama " + (cfg.aiuto.nome || "aiuto");
      mezzo.appendChild(tel);
    }

    var daLeggere = titolo + ". " + testo;
    mezzo.appendChild(bottoneAscolta(daLeggere));
    sotto.appendChild(bottone("Torna all'inizio", "btn btn-avanti", function () { tornaAllInizio(); }));
    return daLeggere;
  }

  /* --- conferma uscita --- */

  function disegnaConfermaEsci(mezzo, sotto) {
    mezzo.appendChild(el("h1", "titolo-passo", "Vuoi uscire?"));
    mezzo.appendChild(el("p", "istruzione", "Se esci, torni alla prima schermata. Nessun problema: potrai ricominciare."));
    var menu = el("div", "menu");
    menu.appendChild(bottone("No, torno a quello che stavo facendo", "voce-menu", function () {
      zitto(); indietro();
    }));
    menu.appendChild(bottone("Sì, esco", "voce-menu", function () { tornaAllInizio(); }));
    mezzo.appendChild(menu);
    var testo = "Vuoi uscire? Tocca: no, torno a quello che stavo facendo, oppure: sì, esco.";
    sotto.appendChild(bottoneAscolta(testo));
    return testo;
  }

  /* --- ripresa dopo una pausa --- */

  function disegnaRipresa(mezzo, sotto, dati) {
    var flusso = flussoDaRipresa(dati);
    if (!flusso) { tornaAllInizio(); return null; }
    mezzo.appendChild(el("h1", "titolo-passo", "Bentornato"));
    mezzo.appendChild(el("p", "istruzione",
      "Stavi facendo: " + flusso.titolo + ". Vuoi continuare da dove eri rimasto?"));
    var menu = el("div", "menu");
    menu.appendChild(bottone("Sì, continuo", "voce-menu", function () {
      pila = [{ tipo: "home" }];
      mostra({ tipo: "passo", flusso: flusso, indice: Math.min(dati.indice, flusso.passi.length - 1) });
    }));
    menu.appendChild(bottone("No, ricomincio dall'inizio", "voce-menu", function () { tornaAllInizio(); }));
    mezzo.appendChild(menu);
    var testo = "Bentornato. Stavi facendo: " + flusso.titolo + ". Vuoi continuare da dove eri rimasto?";
    sotto.appendChild(bottoneAscolta(testo));
    return testo;
  }

  /* ---------------- pannello amministratore ---------------- */

  function collegaPressioneLunga(nodo) {
    var timer = null;
    function inizia(e) {
      timer = setTimeout(function () { timer = null; vai({ tipo: "admin" }); }, 3000);
    }
    function annulla() { if (timer) { clearTimeout(timer); timer = null; } }
    nodo.addEventListener("touchstart", inizia, { passive: true });
    nodo.addEventListener("mousedown", inizia);
    ["touchend", "touchcancel", "touchmove", "mouseup", "mouseleave"].forEach(function (ev) {
      nodo.addEventListener(ev, annulla, { passive: true });
    });
    nodo.addEventListener("contextmenu", function (e) { e.preventDefault(); });
  }

  var prossimoIdAdmin = 0;
  function rigaAdmin(genitore, etichetta, controllo) {
    var r = el("div", "riga");
    var lab = el("label", null, etichetta);
    if (!controllo.id) controllo.id = "admin-controllo-" + (++prossimoIdAdmin);
    lab.htmlFor = controllo.id;
    r.appendChild(lab);
    r.appendChild(controllo);
    genitore.appendChild(r);
    return r;
  }

  function numeroInput(valore, min, max, passo, onCambia) {
    var i = document.createElement("input");
    i.type = "number"; i.min = min; i.max = max; i.step = passo; i.value = valore;
    i.addEventListener("change", function () {
      var v = Number(i.value);
      if (isNaN(v) || v < min) v = min;
      if (v > max) v = max;
      i.value = v;
      onCambia(v);
    });
    return i;
  }

  function spunta(valore, onCambia) {
    var i = document.createElement("input");
    i.type = "checkbox"; i.checked = !!valore;
    i.addEventListener("change", function () { onCambia(i.checked); });
    return i;
  }

  function disegnaAdmin(mezzo, sotto) {
    zitto();
    var box = el("div", "admin");
    mezzo.appendChild(box);
    box.appendChild(el("h1", "titolo-passo", "Pannello per chi assiste"));
    box.appendChild(el("p", "nota",
      "Questa parte non compare durante l'uso normale. Le modifiche valgono solo su questo iPad."));

    /* --- forno --- */
    var h = el("h2", null, "Il forno e il tasto " + cfg.jetStart.etichetta);
    box.appendChild(h);
    if (!cfg.jetStart.verificato) {
      box.appendChild(el("p", "nota non-verificato",
        "Comportamento di " + cfg.jetStart.etichetta + " NON ancora verificato sul forno reale: l'app mostra i tempi come indicativi."));
    }
    rigaAdmin(box, "Secondi aggiunti da ogni pressione di " + cfg.jetStart.etichetta,
      numeroInput(cfg.jetStart.secondiPerPressione, 5, 120, 5, function (v) { cfg.jetStart.secondiPerPressione = v; salvaConfig(); }));
    rigaAdmin(box, "Comportamento verificato sul forno reale",
      spunta(cfg.jetStart.verificato, function (v) { cfg.jetStart.verificato = v; salvaConfig(); }));
    rigaAdmin(box, "Scalda un piatto: secondi totali",
      numeroInput(cfg.tempi.scaldaPiatto, 30, 600, 30, function (v) { cfg.tempi.scaldaPiatto = v; salvaConfig(); }));
    rigaAdmin(box, "Scalda una tazza: secondi totali",
      numeroInput(cfg.tempi.scaldaTazza, 30, 300, 30, function (v) { cfg.tempi.scaldaTazza = v; salvaConfig(); }));

    /* --- voce --- */
    box.appendChild(el("h2", null, "La voce"));
    var slider = document.createElement("input");
    slider.type = "range"; slider.min = "0.5"; slider.max = "1.4"; slider.step = "0.1";
    slider.value = cfg.voce.velocita;
    slider.setAttribute("aria-label", "Velocità della voce");
    slider.addEventListener("change", function () {
      cfg.voce.velocita = Number(slider.value); salvaConfig();
      parla("La voce ora parla così.");
    });
    rigaAdmin(box, "Velocità della voce", slider);
    rigaAdmin(box, "Leggi da sola ogni schermata",
      spunta(cfg.voce.letturaAutomatica, function (v) { cfg.voce.letturaAutomatica = v; salvaConfig(); }));
    box.appendChild(bottone("Prova la voce", "btn", function () {
      parla("Ciao. Questa è la voce che legge le istruzioni del forno.");
    }));

    /* --- funzioni mostrate --- */
    box.appendChild(el("h2", null, "Cosa compare nella prima schermata"));
    rigaAdmin(box, "Scalda un piatto", spunta(cfg.mostra.scaldaPiatto, function (v) { cfg.mostra.scaldaPiatto = v; salvaConfig(); }));
    rigaAdmin(box, "Scalda una tazza", spunta(cfg.mostra.scaldaTazza, function (v) { cfg.mostra.scaldaTazza = v; salvaConfig(); }));
    rigaAdmin(box, "Ricette", spunta(cfg.mostra.ricette, function (v) { cfg.mostra.ricette = v; salvaConfig(); }));
    rigaAdmin(box, "Guida al forno", spunta(cfg.mostra.conosciForno !== false, function (v) { cfg.mostra.conosciForno = v; salvaConfig(); }));
    box.appendChild(el("p", "nota", "Ferma tutto e i consigli di sicurezza compaiono sempre."));

    /* --- immagini --- */
    box.appendChild(el("h2", null, "Immagini"));
    rigaAdmin(box, "Usa le fotografie reali dello sportello",
      spunta(cfg.fotografie, function (v) { cfg.fotografie = v; salvaConfig(); }));
    box.appendChild(el("p", "nota",
      "La foto reale del pannello è già presente e viene sempre usata. Se le foto dello sportello mancano, appare il disegno."));

    /* --- ricette --- */
    box.appendChild(el("h2", null, "Ricette attive"));
    DATI.RICETTE.forEach(function (r) {
      rigaAdmin(box, r.nome, spunta(cfg.ricetteAttive[r.id] !== false, function (v) {
        cfg.ricetteAttive[r.id] = v; salvaConfig();
      }));
    });

    /* --- aiuto --- */
    box.appendChild(el("h2", null, "Persona da chiamare in caso di problemi"));
    var nome = document.createElement("input");
    nome.type = "text"; nome.value = cfg.aiuto.nome; nome.style.fontSize = "22px";
    nome.style.padding = "8px"; nome.setAttribute("aria-label", "Nome della persona da chiamare");
    nome.addEventListener("change", function () { cfg.aiuto.nome = nome.value.trim(); salvaConfig(); });
    rigaAdmin(box, "Nome", nome);
    var tel = document.createElement("input");
    tel.type = "tel"; tel.value = cfg.aiuto.telefono; tel.style.fontSize = "22px";
    tel.style.padding = "8px"; tel.setAttribute("aria-label", "Numero di telefono");
    tel.addEventListener("change", function () { cfg.aiuto.telefono = tel.value.replace(/[^\d+]/g, ""); salvaConfig(); });
    rigaAdmin(box, "Telefono", tel);

    /* --- esporta / importa --- */
    box.appendChild(el("h2", null, "Copia delle impostazioni"));
    var area = document.createElement("textarea");
    area.setAttribute("aria-label", "Impostazioni in formato testo");
    box.appendChild(area);
    box.appendChild(bottone("Esporta qui sopra", "btn", function () {
      area.value = JSON.stringify(cfg, null, 2);
      area.focus(); area.select();
    }));
    box.appendChild(bottone("Importa da qui sopra", "btn", function () {
      try {
        var nuovo = JSON.parse(area.value);
        cfg = unisci(DATI.CONFIG, nuovo);
        salvaConfig();
        area.value = "Fatto: impostazioni importate.";
      } catch (e) {
        area.value = "Testo non valido: incolla qui le impostazioni esportate e riprova.";
      }
    }));
    box.appendChild(bottone("Riporta tutto come all'inizio", "btn", function () {
      cfg = copiaProfonda(DATI.CONFIG);
      try { localStorage.removeItem(CHIAVE_CONFIG); } catch (e) {}
      scordaRipresa();
      mostra({ tipo: "admin" });
    }));

    sotto.appendChild(bottone("Chiudi e torna all'app", "btn btn-avanti", function () { tornaAllInizio(); }));
  }

  /* ---------------- avvio ---------------- */

  function avvio() {
    var ripresa = leggiRipresa();
    try { history.replaceState({ forno: 0 }, "", ""); } catch (e) {}
    if (ripresa && flussoDaRipresa(ripresa)) {
      mostra({ tipo: "ripresa", dati: ripresa });
    } else {
      mostra({ tipo: "home" });
    }
  }

  avvio();

  // esposto solo per i test automatici
  window.__forno_test = {
    percorsoScaldaPiatto: percorsoScaldaPiatto,
    percorsoScaldaTazza: percorsoScaldaTazza,
    percorsoFermaTutto: percorsoFermaTutto,
    percorsoSicurezza: percorsoSicurezza,
    percorsoRicetta: percorsoRicetta,
    leggiConfig: function () { return cfg; },
    scriviConfig: function (c) { cfg = c; },
    mostra: mostra,
    vaiHome: tornaAllInizio
  };
})();
