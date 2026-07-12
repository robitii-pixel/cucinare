# Guida editoriale — La nostra cucina

## Voce dell’app

“La nostra cucina” parla come una persona competente, calma e presente. La voce è chiara, adulta, accogliente, concreta e rispettosa. Non deve sembrare né un robot né un amico eccessivamente confidenziale.

## Principi di scrittura

- Preferire frasi che una persona direbbe davvero.
- Dire subito cosa è successo o cosa può fare la persona.
- Usare frasi complete quando aiutano; titoli, etichette e pulsanti possono essere brevi.
- Evitare gergo tecnico, frammenti assemblati ed entusiasmo artificiale.
- Non giudicare scelte, risultati, cibo, peso o difficoltà.
- Riconoscere le difficoltà e proporre un passo concreto, senza colpevolizzare.

## Pulsanti e azioni

I pulsanti descrivono chiaramente l’azione con verbi concreti, per esempio “Salva”, “Aggiungi alla lista”, “Segna come fatto”, “Cambia ricetta”, “Torna al piano” e “Riprova”. Evitare etichette vaghe come “OK”, “Procedi”, “Gestisci” o “Esegui”. Usare “Annulla” per annullare un’azione e “Chiudi” per chiudere una finestra senza modificare dati.

## Conferme, errori e stati vuoti

- Le conferme sono brevi e specifiche: “Ricetta aggiunta al piano”, “Lista della spesa aggiornata”, “Modifica salvata”.
- Gli errori spiegano cosa non è stato possibile fare e, quando possibile, cosa fare dopo.
- Non mostrare nell’interfaccia ordinaria codici, variabili o dettagli interni.
- Gli stati vuoti spiegano cosa manca e indicano il passo successivo quando è utile.
- Evitare formule generiche come “Operazione completata con successo” e “Nessun dato”.

## Coach

Il coach si rivolge alla persona con il “tu”, propone un passo concreto, non impartisce ordini, non formula diagnosi, non promette risultati e non trasforma stime in certezze. Non usa premi, colpe o punizioni.

## Testi protetti

Non modificare automaticamente formule nutrizionali, valori, quantità, unità di misura, avvertenze mediche, note sulle stime, indicazioni relative alla salute o testi che possono influenzare decisioni cliniche o alimentari. Deve restare chiaro che i valori nutrizionali sono stime indicative. Non inventare benefici, rischi, controindicazioni o raccomandazioni.

Non modificare automaticamente testi relativi a privacy, consenso, trattamento o condivisione dei dati, codice famiglia, accesso, sicurezza, cancellazione, esportazione o sincronizzazione. Le possibili revisioni vanno presentate separatamente e approvate prima dell’applicazione.

## Coerenza terminologica

Lo stesso elemento ha sempre lo stesso nome. Termini preferiti: “piano”, “lista della spesa”, “dispensa”, “ricetta”, “pasto”, “allenamento”, “obiettivo”, “versione personale”, “versione pubblica”, “codice famiglia” e “sincronizzazione”. Non alternare termini diversi per indicare la stessa funzione.

## Forma e punteggiatura

- Usare italiano corrente e frasi brevi, ma non telegrafiche.
- Usare la maiuscola solo all’inizio della frase e nei nomi propri.
- Evitare punti esclamativi, puntini di sospensione decorativi e abbreviazioni non necessarie.
- Non usare emoji, simboli o codici al posto di parole comprensibili.
- Mantenere testi leggibili e utilizzabili su telefono.

## Versione personale e pubblica

I testi condivisi provengono dalla stessa sorgente. Una stringa può differire soltanto quando contiene dati personali, cita Roberto o Gigi, descrive una funzione disponibile in una sola versione o richiede un diverso livello di privacy. La versione pubblica non deve contenere nomi, date, pesi o altre informazioni personali.

## Centralizzazione delle stringhe

Centralizzare una stringa quando appare più volte con lo stesso significato, deve essere identica nelle due versioni, rappresenta un messaggio condiviso o la duplicazione può causare incoerenze. Non centralizzare singole etichette usate una sola volta, frammenti che rendono le frasi difficili da leggere, stringhe tecniche non visibili o contenuti dinamici con significati diversi. La struttura deve restare semplice e interna al file HTML sorgente.

## Controllo delle modifiche

Per ogni testo verificare che il significato funzionale non sia cambiato, il tono rispetti la guida, pulsanti e azioni restino chiari, valori e indicazioni mediche non siano alterati, il testo funzioni nelle due build, la versione pubblica non contenga dati personali e non siano state introdotte emoji o difficoltà d’uso su telefono.

## Esempi

- “Elemento rimosso correttamente” → “Elemento rimosso”.
- “Nessuna ricetta presente” → “Non ci sono ancora ricette”.
- “Inserire il valore richiesto” → “Inserisci un valore”.
- “Sei sicuro di voler procedere con l’eliminazione?” → “Vuoi eliminare questa voce?”.
- “Errore durante il salvataggio” → “Non siamo riusciti a salvare la modifica. Riprova”.

Gli esempi vanno adattati al contesto e non applicati meccanicamente.
