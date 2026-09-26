# portfolio di alessandro bottone

sito portfolio one-page, nero, raccontato dallo scroll. il protagonista è il volto (il logo), che guarda, sbatte le palpebre, si addormenta e si sveglia.

il percorso è uno solo, dall’alto in basso:

**preloader → header → portfolio → chi sono → contatti**

- **preloader**: il volto si disegna mentre il sito si carica, con un contatore `000 → 100`; poi si sveglia e vola nell’header
- **header**: il nome e il volto; scorrendo si attraversano quattro fasi (illustrazione, branding, 3d, web design) e alla fine resta una card
- **portfolio**: i progetti su un anello 3d (desktop e tablet) o in una pila di card (telefono); clic su una card → si apre il pannello del progetto
- **chi sono**: la foto e il testo, che si “accende” parola per parola
- **contatti**: il volto e tre pulsanti (instagram, behance, email)

niente navbar, niente footer. brief completo e decisioni prese: `CLAUDE.md`.

---

## cosa serve

- **node.js lts** (da nodejs.org). per controllare: `node -v` nel terminale
- per `npm run genera-og`: il font outfit installato sul computer (`Outfit-VariableFont_wght.ttf`)

## come si avvia

nel terminale, dentro la cartella del sito:

```
npm install
npm run dev
```

poi apri http://localhost:5173 nel browser. `npm install` serve solo la prima volta (o quando cambiano le dipendenze).
per fermare il sito: `ctrl + c` nel terminale.

in sviluppo esiste anche la pagina http://localhost:5173/laboratorio, per provare stati e animazioni del volto e del cursore. nel sito pubblicato non c’è.

## i comandi

| comando | cosa fa |
|---|---|
| `npm run dev` | avvia il sito in locale (http://localhost:5173) e si aggiorna da solo quando salvi un file. controlla anche i progetti e scrive nel terminale se qualcosa non va |
| `npm run build` | prepara il sito da pubblicare nella cartella `dist/`. prima controlla il codice e tutti i progetti: se manca un file o un campo si ferma con un messaggio in italiano |
| `npm run preview` | mostra in locale il sito preparato da `npm run build`, così com’è pubblicato |
| `npm run lint` | controlla il codice in cerca di errori comuni (oxlint) |
| `npm run nuovo-progetto` | fa qualche domanda (titolo, indirizzo, descrizione, discipline, anno, cliente) e crea la cartella del progetto con un `progetto.json` di partenza |
| `npm run prepara-progetti` | ottimizza i file dei progetti (immagini in webp, copertina piccola per le card, modelli 3d compressi), avvisa se pdf o video sono troppo pesanti e controlla che non manchi niente |
| `npm run foto-palette -- <file>` | converte una foto in bianco e nero con i colori del sito (nero → `#141414`, bianco → `#c9c5c0`). l’originale non viene toccato |
| `npm run genera-favicon` | ricrea le favicon del volto (sveglio e addormentato) e l’icona per iphone in `public/volto/` |
| `npm run genera-og` | ricrea `public/og.png`, l’immagine che compare quando il sito viene condiviso |

## dove cambio cosa

| voglio cambiare… | dove |
|---|---|
| testi fissi, link di instagram e behance, email, testo del chi sono, titolo della scheda, etichette | `src/config/sito.ts` |
| durate delle animazioni, lunghezze di scroll (header, anello, chi sono), velocità di lenis, tempi del volto (battiti, sonno) | `src/config/movimento.ts` |
| posizione, scala, colore e durata della “firma” sopra la foto, o disattivarla | `src/config/foto.ts` |
| la foto del chi sono | nuova foto in `src/assets/foto/`, poi `npm run foto-palette -- src/assets/foto/<file>`, poi cambia l’import in cima a `src/sections/ChiSono/ChiSono.tsx` e regola `src/config/foto.ts` |
| i progetti | una cartella per progetto in `src/content/progetti/` → guida [come aggiungere un progetto](docs/come-aggiungere-un-progetto.md) |
| descrizione e anteprima per i social | `index.html` (stesso testo di `sito.descrizione`) e `npm run genera-og` |

i testi vanno scritti sempre in minuscolo, con l’apostrofo tipografico (’).

## come si pubblica

- il codice sta su github: https://github.com/alessandrobottone2005-crypto/ProvaLandingPagePortfolio_Claude
- il repository è collegato a vercel: ogni push sul ramo `main` pubblica il sito da solo su https://provalandingpageportfolio-claude.vercel.app (collegamento in fase di configurazione)
- `vercel.json` rimanda ogni indirizzo a `index.html`, così anche `/progetti/<nome>` funziona dopo un refresh

dettagli e checklist: [pubblicazione](docs/pubblicazione.md).

## documentazione

| file | di cosa parla |
|---|---|
| [docs/come-aggiungere-un-progetto.md](docs/come-aggiungere-un-progetto.md) | guida passo passo, senza codice, per aggiungere un progetto |
| [docs/architettura.md](docs/architettura.md) | librerie, cartelle, come parte il sito, preloader, scroll |
| [docs/volto.md](docs/volto.md) | il volto: geometria, stati, comportamenti, 3d, favicon |
| [docs/animazioni.md](docs/animazioni.md) | header, anello, chi sono, contatti, cursore, micro-interazioni, `movimento.ts` |
| [docs/progetti.md](docs/progetti.md) | come sono fatti i progetti, `progetto.json`, controlli e script |
| [docs/pannello.md](docs/pannello.md) | il pannello del progetto e i cinque tipi di blocco |
| [docs/accessibilita-prestazioni.md](docs/accessibilita-prestazioni.md) | movimento ridotto, tastiera, contrasto, peso e velocità |
| [docs/pubblicazione.md](docs/pubblicazione.md) | github, vercel, anteprima social, cosa non va su github, checklist |
