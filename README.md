# SicuLingo - Quiz di vocabolario siciliano

SicuLingo è un quiz interattivo dedicato al vocabolario siciliano. L'app presenta parole siciliane con possibili significati, registra le risposte e mostra il risultato al termine del quiz.

## Tecnologie

- Vue 3
- Vite
- Firebase Authentication con accesso Google
- Cloud Firestore
- Vue Router

## Funzionamento

Le domande vengono caricate dai dati locali dell'app e presentate in ordine casuale. Per ogni parola è possibile scegliere una risposta e visualizzare il feedback con la spiegazione disponibile. Al completamento del quiz vengono calcolate le risposte corrette, errate e il totale.

Per accedere al quiz è necessario effettuare il login con Google. Ogni risultato completato viene salvato nella collection Firestore `quizzes` e associato all'UID dell'utente autenticato. La schermata Storico recupera da Firestore esclusivamente i risultati dell'utente attualmente collegato.

## Avvio locale

Sono necessari Node.js e npm.

```bash
npm install
npm run dev
```

Vite avvia il server di sviluppo locale e mostra nel terminale l'indirizzo da aprire nel browser.

Per creare una build di produzione:

```bash
npm run build
```
