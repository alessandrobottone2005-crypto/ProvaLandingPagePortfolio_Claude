# progetti

per aggiungere un progetto basta creare una cartella: il sito la trova da solo. guida pratica passo passo: [come aggiungere un progetto](come-aggiungere-un-progetto.md). qui c’è come funziona dietro.

## la cartella

```
src/content/progetti/
  nome-progetto/           ← il nome della cartella diventa l’indirizzo /progetti/nome-progetto
    progetto.json
    copertina.webp
    copertina-card.webp    ← creata da npm run prepara-progetti (900px, per le card)
    …altri file dei blocchi (webp, pdf, glb, mp4)
    _originali/            ← creata da npm run prepara-progetti: gli originali, non finiscono nel sito
```

- il nome della cartella può avere solo lettere minuscole, numeri e trattini (es. `mio-progetto`)
- le cartelle che iniziano con `_` o `.` vengono ignorate
- niente sottocartelle per i file: tutto nella cartella del progetto

## `progetto.json`

schema in `src/lib/schema.ts` (zod). non sono ammessi campi diversi da questi.

| campo | obbligatorio | cosa è |
|---|---|---|
| `titolo` | sì | testo, non vuoto |
| `descrizione` | sì | testo breve, non vuoto |
| `discipline` | sì | almeno una tra `branding`, `illustrazione`, `3d`, `web design` |
| `anno` | sì | numero intero tra 2000 e 2100 |
| `cliente` | no | testo |
| `ordine` | no | numero: più basso = prima |
| `pubblicato` | no | `true` (predefinito) o `false` per nasconderlo senza cancellarlo |
| `copertina` | sì | nome del file della copertina (proporzione 4:5) |
| `blocchi` | no | elenco dei blocchi del pannello, nell’ordine in cui compaiono (predefinito: nessuno) |

### i blocchi

| `tipo` | campi | note |
|---|---|---|
| `pdf` | `file` | pdf sfogliabile come un libro |
| `immagini` | `file` (un nome o un elenco), `layout` | `layout`: `piena` (predefinito, una sotto l’altra) o `griglia` (due colonne da tablet in su) |
| `modello3d` | `file` | un `.glb` |
| `video` | `file` **oppure** `url` (uno solo dei due), `poster`, `autoplay` | `url`: link vimeo o youtube. `autoplay` (predefinito `false`): muto e in loop, solo per clip brevi |
| `testo` | `testo` | una riga vuota separa i paragrafi |

i blocchi si possono ripetere e combinare. come si comportano nel pannello: [pannello](pannello.md).

**ordine dei progetti**: prima quelli con `ordine` (dal numero più basso), poi quelli senza, dal più recente per `anno` (a parità di anno, in ordine alfabetico di cartella).

## come il sito legge i progetti

`src/lib/progetti.ts`:

1. con `import.meta.glob` di vite legge tutti i `src/content/progetti/*/progetto.json` e tutti i file `webp, avif, jpg, jpeg, png, gif, pdf, glb, gltf, mp4, webm` delle cartelle, come indirizzi (`?url`). i file dentro `_originali/` non vengono presi.
2. completa i valori predefiniti (`pubblicato`, `blocchi`, `layout`, `autoplay`) senza zod, così zod non si scarica nel sito: i valori condivisi stanno in `src/lib/dati.ts` (`DISCIPLINE`, `SLUG_VALIDO`, `fileUsati`).
3. salta i progetti non pubblicati; trasforma ogni nome di file in un indirizzo; se esiste `<copertina>-card.webp` la usa per le card (`copertinaCard`).
4. ordina e restituisce `progetti`. funzioni in più: `trovaProgetto(slug)` e `progettoSuccessivo(slug)` (dopo l’ultimo si torna al primo).

in sviluppo, se un `progetto.json` non va, l’errore compare anche nella console del browser.

## i controlli

`scripts/valida-progetti.ts` controlla ogni cartella:
- nome della cartella valido
- `progetto.json` presente e scritto correttamente
- campi conformi allo schema (errori tradotti in frasi italiane da `spiegaErrori`)
- per i progetti pubblicati, che tutti i file citati esistano. i progetti con `pubblicato: false` possono essere incompleti

dove gira:
- **`npm run build`**: il plugin `controlla-progetti` in `vite.config.ts` ferma la build con l’elenco dei problemi, es. `progetto "nome-progetto": manca il file "manuale.pdf"`
- **`npm run dev`**: stesso controllo all’avvio e a ogni file aggiunto, cambiato o tolto in `src/content/progetti/`; gli errori compaiono nel terminale
- **`npm run prepara-progetti`**: alla fine del lavoro

## gli script

### `npm run nuovo-progetto` (`scripts/nuovo-progetto.mjs`)

chiede nel terminale: titolo, indirizzo (proposto dal titolo), breve descrizione, discipline (per numero), anno (proposto l’anno in corso), cliente (facoltativo). le risposte diventano minuscole. crea `src/content/progetti/<indirizzo>/progetto.json` con `pubblicato: false`, `copertina: "copertina.webp"` e nessun blocco. non accetta un indirizzo già usato.

### `npm run prepara-progetti` (`scripts/prepara-progetti.mjs`)

per ogni progetto:
- **immagini** (`jpg, jpeg, png, avif, tif, tiff, webp`): l’originale va in `_originali/`, al suo posto c’è un `.webp` con lato massimo 2400px (qualità 82). se l’estensione cambia, `progetto.json` viene aggiornato da solo. un file già presente in `_originali/` non viene rifatto
- **copertina per le card**: crea `<copertina>-card.webp` largo 900px (la ricrea se la copertina è più recente)
- **modelli `.glb`**: l’originale va in `_originali/`, la versione compressa (meshopt, texture in webp, con `gltf-transform`) prende il suo posto
- **avvisi**: pdf sopra 15mb, video sopra 25mb, file `.mov`/`.m4v` da esportare in mp4 (h.264)
- alla fine esegue il controllo completo e dice quanti progetti ci sono e quanti sono pubblicati; se ci sono problemi esce con errore

## i progetti segnaposto

In `src/content/progetti/` ci sono venti progetti provvisori, `segnaposto-01` … `segnaposto-20`: titoli e testi segnaposto, copertine numerate. Si possono sostituire, rimuovere o nascondere con `pubblicato: false`. Il numero di card viene ricavato dai progetti pubblicati: non serve modificare il codice della spirale o della griglia. Il preloader include la copertina del primo progetto.

Titolo, discipline, anno e descrizione alimentano sia le informazioni della card espansa sia il pannello. Le copertine vengono usate a colori, anche nella scena 3d. [Interazioni](animazioni.md).

## contenuti pubblici

`pubblicato: false` è una scelta editoriale, non un controllo di accesso. I file importati o caricati sul sito possono essere raggiungibili tramite URL; non inserire contenuti riservati confidando che una card nascosta li protegga. `_originali/` è esclusa dagli import del runtime e dall’upload CLI configurato in `.vercelignore`, ma può restare nel repository GitHub. Il pannello opaco protegge la fedeltà visiva delle immagini, non rende privati i file.
