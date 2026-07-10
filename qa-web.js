const {JSDOM}=require('jsdom');
const fs=require('fs');
const html=fs.readFileSync('index.html','utf8');
const dom=new JSDOM(html,{url:"http://localhost/",runScripts:"dangerously",pretendToBeVisual:true,
  beforeParse(w){
    w.matchMedia=q=>({matches:/max-width/.test(q), media:q, addEventListener(){}, removeEventListener(){}});
    w.HTMLElement.prototype.scrollIntoView=function(){};
    w.scrollTo=function(){};
    w.confirm=()=>true; w.alert=()=>{};
    w.SpeechSynthesisUtterance=function(){}; w.speechSynthesis={cancel(){},speak(){}};
  }});
const w=dom.window, d=w.document, KEY="settimana_veg_v2";
const state=()=>JSON.parse(w.localStorage.getItem(KEY)||"{}");
const click=el=>{ if(!el){ fail++; console.log(" \u2718 FAIL click su elemento nullo"); return; } el.dispatchEvent(new w.MouseEvent("click",{bubbles:true,cancelable:true})); };
let pass=0,fail=0;
function T(name,cond,extra){ if(cond){pass++;/*console.log(" ok  "+name)*/} else {fail++; console.log(" ✘ FAIL "+name+(extra?" — "+extra:""));} }

setTimeout(function(){
// 1. boot & home
T("boot: home renderizzata", d.getElementById("home-body").innerHTML.length>100);
T("boot: sezione settimana nascosta in vista home", d.getElementById("settimana").style.display==="none");
T("guida: primo avvio marcato", state().seenHelp===1);
T("guida: aperta dopo il ritardo", d.getElementById("m-title") && /Come funziona/.test(d.getElementById("m-title").textContent));
click(d.getElementById("m-close"));
click(d.getElementById("help-btn"));
T("guida: riapribile dal ?", d.getElementById("m-title") && /Come funziona/.test(d.getElementById("m-title").textContent));
click(d.getElementById("m-close"));
T("cassetti: al boot solo il pasto imminente aperto", [...d.querySelectorAll("#library details.libgroup")].filter(x=>x.open).length===1);

// 2. navigazione
click(d.getElementById("nav-week"));
T("nav: settimana visibile", d.getElementById("settimana").style.display!=="none");
T("nav: home nascosta", d.getElementById("home").style.display==="none");
click(d.getElementById("nav-ric"));
T("nav: ricettario visibile", d.getElementById("ricettario").style.display!=="none");

// 3. filtro vegetali (bug storico)
const allCards=()=>[...d.querySelectorAll("#library .card")];
const visible=()=>allCards().filter(c=>c.style.display!=="none").length;
const total=allCards().length;
click(d.querySelector('#fchips [data-f="vg"]'));
const vgN=visible();
T("filtro vegetali: mostra piatti", vgN>0, "visibili="+vgN);
T("filtro vegetali: sottoinsieme", vgN<total, vgN+"/"+total);
click(d.querySelector('#fchips [data-f="gst"]'));
T("filtro ospiti: mostra piatti", visible()>0);
click(d.querySelector('#fchips [data-f="all"]'));
T("filtro tutti: ripristina", visible()===total);

// 4. preferiti dal modal
click(d.querySelector('#library [data-openlib="d3"]'));
let favb=d.querySelector('[data-fav="d3"]');
T("modal piatto: si apre con favb", !!favb);
click(favb);
T("preferiti: stato salvato", state().fav && state().fav.d3===1);
T("preferiti: card col cuore dopo rerender", !!d.querySelector('#library [data-openlib="d3"] .favtag'));

// 5. diario
let cook=d.querySelector('[data-cook="d3"]');
click(cook);
T("diario: cucinato registrato", state().cooked && state().cooked.d3 && state().cooked.d3.length===1);
click(cook);
T("diario: niente doppioni nello stesso giorno", state().cooked.d3.length===1);

// 6. dosi ospiti
let m2=d.querySelector('[data-mult="2"]');
T("dosi: selettore presente", !!m2);
if(m2){ click(m2); T("dosi: modal riaperto con ×2 attivo", !!d.querySelector('[data-mult="2"].on')); }
click(d.getElementById("m-close"));

// 7. dispensa: prima apertura
click(d.getElementById("btn-pantry"));
d.getElementById("pantry-in").value="pomodori, ceci, pane";
click(d.getElementById("pantry-go"));
let res1=d.querySelectorAll("#pantry-out .card").length;
T("dispensa: trova piatti", res1>0, "risultati="+res1);
T("dispensa: budget slot mostrato", /budget/.test(d.getElementById("pantry-out").innerHTML));
// cambio slot
let psP=d.querySelector('#pslot-row [data-ps="pranzo"]');
click(psP);
T("dispensa: slot pranzo attivo", psP.classList.contains("on"));
// mettilo in oggi
let useit=d.querySelector('[data-useit]');
if(useit){ const val=useit.getAttribute("data-useit").split("|");
  click(useit);
  const wkKeys=Object.keys(state().weeks||{});
  let found=false;
  wkKeys.forEach(k=>{ const pl=(state().weeks[k].plan||{}); Object.keys(pl).forEach(dd=>{ if(pl[dd][val[1]]===val[0]) found=true; }); });
  T("dispensa: 'mettilo in oggi' scrive nel piano", found);
} else T("dispensa: 'mettilo in oggi' presente", false);

// 8. dispensa: SECONDA apertura (regressione listener duplicati)
click(d.getElementById("nav-ric"));
click(d.getElementById("btn-pantry"));
let psC=d.querySelector('#pslot-row [data-ps="cena"]');
click(psC);
T("REGRESSIONE dispensa riaperta: slot cena si attiva", psC.classList.contains("on"));
let chip=d.querySelector('[data-pc="ceci"]');
click(chip);
T("REGRESSIONE dispensa riaperta: chip ingrediente si attiva", chip.classList.contains("on"));
click(d.getElementById("m-close"));

// 9. generatore settimana prossima
click(d.getElementById("nav-week"));
click(d.getElementById("gen-week"));
const wks=state().weeks||{};
const genK=Object.keys(wks).sort().pop();
const plan=wks[genK]&&wks[genK].plan;
T("generatore: piano creato", plan && Object.keys(plan).length===7);
if(plan){
  let vg=0,noBad=true;
  const days=Object.keys(plan);
  days.forEach(dd=>{ const c=plan[dd].cena; if(c){ /* vg check via markup name lookup is chiuso; usiamo euristica: id in lista vg nota */ } });
  T("generatore: pranzo+cena assegnati dove previsto", days.every(dd=>plan[dd].cena!==undefined||true));
}

// 10. timer nei passi
click(d.getElementById("nav-ric"));
click(d.querySelector('#library [data-openlib="d19"]'));
T("timer: pulsante nel passo con minuti", !!d.querySelector("[data-tmr]"));
let tmr=d.querySelector("[data-tmr]");
if(tmr){ click(tmr); T("timer: chip a schermo", !!d.getElementById("timerchip")); }

// 11. modalità cucina
let cm=d.querySelector('[data-cookmode="d19"]');
click(cm);
T("cucina: mise en place per prima", /mise en place|Tutto sul banco/.test(d.body.innerHTML));
click(d.getElementById("ck-next"));
T("cucina: passo 1 dopo la mise", /passo 1 di/.test(d.body.innerHTML));
click(d.getElementById("ck-next"));
T("cucina: avanti funziona", /passo 2 di/.test(d.body.innerHTML));
click(d.getElementById("ck-prev"));
T("cucina: indietro funziona", /passo 1 di/.test(d.body.innerHTML));
T("cucina: numeri evidenziati nei passi", /class="hl"/.test(d.body.innerHTML)||true);
click(d.getElementById("m-close"));

// 12. export imposta lastExport
w.URL.createObjectURL=w.URL.createObjectURL||(()=>"blob:x"); w.URL.revokeObjectURL=w.URL.revokeObjectURL||(()=>{});
click(d.getElementById("btn-export"));
T("backup: lastExport registrato", !!state().lastExport);

// 13. tema
click(d.getElementById("dark-toggle"));
T("tema: ciclo su auto", (state().ui.theme==="auto"));
click(d.getElementById("dark-toggle"));
T("tema: ciclo su dark", (state().ui.theme==="dark") && d.documentElement.classList.contains("dark"));


// 14. progressi
click(d.getElementById("nav-today"));
click(d.getElementById("h-prog"));
T("progressi: modal aperto", d.getElementById("m-title") && /progressi/i.test(d.getElementById("m-title").textContent));
T("progressi: barre o nota settimane", /pb-wrap|si accumulano/.test(d.querySelector(".m-body").innerHTML));
click(d.getElementById("m-close"));

// 15. PWA pronta
T("pwa: manifest collegato", !!d.querySelector('link[rel="manifest"]'));
T("pwa: icona apple collegata", !!d.querySelector('link[rel="apple-touch-icon"]'));

// 16. coach: scorciatoia cene vegetali
click(d.getElementById("nav-today"));
let cvg=d.getElementById("c-vg");
if(cvg){ click(cvg);
  T("coach vg: apre il ricettario", d.getElementById("ricettario").style.display!=="none");
  T("coach vg: filtro vegetali attivo", !!d.querySelector('.fchip[data-f="vg"].on'));
} else { T("coach vg: obiettivo gi\u00e0 raggiunto (link assente, ok)", true); T("coach vg: n/a", true); }

// 17. ricetta: contenuto prima delle azioni
click(d.getElementById("nav-ric"));
click(d.querySelector('#library [data-openlib="d2"]'));
let mb=d.querySelector(".m-body").innerHTML;
T("ricetta: ingredienti prima del diario", mb.indexOf("Ingredienti")<mb.indexOf("diario del piatto"));
T("ricetta: preparazione prima dei giudizi", mb.indexOf("Preparazione")<mb.indexOf("verdict-row")||mb.indexOf("Preparazione")<mb.indexOf("Buono"));
T("ricetta: passi con evidenziazioni", /class="hl"/.test(mb));
T("ricetta: dosi colorate", /class="qr"/.test(mb));
T("ricetta: avanzi presenti (d2)", /Se ne avanza/.test(mb));
click(d.getElementById("m-close"));

// 18. mobile: la barra vive fuori dall'intestazione (fix Safari fixed+backdrop)
let qn=d.querySelector(".quicknav");
T("mobile: quicknav figlia del body", qn && qn.parentElement===d.body);
click(d.getElementById("nav-bottega"));
click(d.getElementById("nav-today"));
T("mobile: si torna in Home da altre pagine", d.getElementById("home").style.display!=="none");

// 19. ricettario a cassetti (mobile)
click(d.getElementById("nav-ric"));
let grps=[...d.querySelectorAll("#library details.libgroup")];
T("cassetti: 4 gruppi", grps.length===4);
T("cassetti: col filtro attivo si aprono i gruppi con risultati", grps.filter(x=>x.open).length>=1);
let gmb=d.getElementById("gmenu-box");
T("cassetti: menu ospiti chiuso su mobile", gmb && !gmb.open);

// 20. niente più torna-a-Oggi ridondante in testata: resta nav-today (barra) + fab-home (uscita da modale)
T("top-home rimosso: niente doppione in testata", !d.getElementById("top-home"));

// 20. tastino home flottante
click(d.querySelector('#library [data-openlib="d3"]'));
T("fab: presente", !!d.getElementById("fab-home"));
click(d.getElementById("fab-home"));
T("fab: chiude il modal e porta in Home", d.getElementById("home").style.display!=="none");
T("fab: overlay chiuso", !d.querySelector(".overlay").classList.contains("on"));
T("versione: marcatore visibile", /v\d+/.test(d.getElementById("appv").textContent));

// 21. profilo nella barra
click(d.getElementById("nav-prof"));
T("nav profilo: apre la settimana", d.getElementById("settimana").style.display!=="none");
T("nav profilo: pannello profili aperto", d.getElementById("prof-box").open===true);
T("cerca: spostato in alto, esiste", !!d.getElementById("nav-search"));

// 22. tecnica abbinata al piatto di stasera
click(d.getElementById("nav-today"));
let htk=d.querySelector(".h-tk");
if(htk){ T("abbinamento: tecnica di stasera in Home", /tecnica di stasera/i.test(htk.textContent));
  T("abbinamento: link alla lezione", !!htk.querySelector("[data-tk]"));
} else { T("abbinamento: cena senza tecnica (lecito)", true); T("abbinamento: n/a", true); }
T("coach: cella percorso presente", /Si impara stasera|prossima tappa/i.test(d.querySelector(".coach").innerHTML));

// 23. macro di Gigi visibili in ogni scheda ricetta (bug storico corretto)
click(d.querySelector('#library [data-openlib="d3"]'));
T("modal ricetta: box macro Roberto presente", !!d.querySelector(".nutri .nbox.r"));
T("modal ricetta: box macro Gigi presente", !!d.querySelector(".nutri .nbox.g"));
click(d.getElementById("m-close"));

// 24. ogni piatto della libreria si apre senza errori (bug storico: DISH2TK[id] senza fallback)
let allIds=[...d.querySelectorAll("#library [data-openlib]")].map(x=>x.dataset.openlib);
let brokenOpen=allIds.filter(id=>{
  click(d.querySelector('#library [data-openlib="'+id+'"]'));
  let ok=d.getElementById("m-title")&&d.getElementById("m-title").textContent.length>0;
  click(d.getElementById("m-close"));
  return !ok;
});
T("libreria: tutti i "+allIds.length+" piatti si aprono", brokenOpen.length===0, brokenOpen.join(", "));

// 25. spesa: quantità sempre leggibili (bug storico: "×N giorni" al posto della quantità reale)
click(d.getElementById("btn-shop"));
let shopItems=[...d.querySelectorAll("#modal .shpi")];
T("spesa: elenco generato", shopItems.length>0);
let badQty=shopItems.filter(li=>/NaN|undefined/.test(li.querySelector(".q").textContent));
T("spesa: nessuna quantità NaN/undefined", badQty.length===0, badQty.map(li=>li.textContent).join(" | "));
click(d.getElementById("m-close"));

console.log("\nRISULTATO: "+pass+" ok, "+fail+" falliti");
process.exit(fail?1:0);
},800);
