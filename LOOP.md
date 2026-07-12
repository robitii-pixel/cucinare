# Il loop di sviluppo (protocollo del panel)

Processo iterativo che valuta l'app da 21 prospettive professionali (product, UX, visual Apple,
chef stellato vegetale, chef domestico, dietista sportivo, nutrizionista preventiva, psicologo,
behaviour design, formazione, chef docente, organizzazione domestica, ospitalità, food styling,
ergonomia cognitiva, accessibilità, ingegnere, QA, data analyst, Roberto, Gigi). Non è un panel
di 21 persone reali: è una griglia di valutazione usata per non trascurare punti di vista diversi.

Ogni iterazione: valutazione per prospettiva → voti 0–10 → criticità → massimo 5 interventi
ad alto impatto → approvazione del proprietario → implementazione reale nella sorgente personale
→ generazione della build pubblica → confronto con la versione precedente → **zero regressioni
ammesse** (le suite QA sono il guardiano).

Il loop lavora su una sola sorgente: `la-nostra-cucina.html`. `index.html` non si modifica mai
a mano, ma viene rigenerato da `build.py`. Ogni ciclo deve verificare sia l'esperienza personale
sia quella pubblica, distinguendo problemi condivisi e differenze intenzionali. La build pubblica
non deve contenere dati personali.

La revisione dei testi segue `docs/content-style-guide.md`. Formule e contenuti medici,
nutrizionali, legali, di privacy e sicurezza non vengono modificati automaticamente.

Criteri di arresto: nessuna criticità, media >9.5, miglioramenti marginali (<2%) per due cicli.

**Stato: 13+ iterazioni completate** (Home, coach, curriculum 26 tappe, modalità cucina vocale,
dispensa con obiettivo del pasto, generatore settimanale, icone SVG, cassetti mobile, abbinamento
piatto↔tecnica...). Punteggio stimato ~9.4. Fase attuale: **loop di campo** — le iterazioni
nascono dalle segnalazioni d'uso reale del proprietario, che valgono più di ogni analisi a
tavolino. Regola d'oro appresa: implementare poco e verificato batte implementare tanto e cieco.
