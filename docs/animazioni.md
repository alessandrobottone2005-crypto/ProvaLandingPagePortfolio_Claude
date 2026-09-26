# animazioni

cosa si muove, dove sta il codice e quali numeri si possono regolare. tutti i tempi e le lunghezze di scroll regolabili sono in `src/config/movimento.ts` (ultima sezione di questa pagina).

## header: “dal segno al volume”

file: `src/sections/Header/Header.tsx`, `Tavola.tsx`, `misure.ts`.

- sezione bloccata (pin) per **400vh** su desktop e tablet, **300vh** su telefono (`movimento.header`), con scrub 1 (desktop) o 0,6 (telefono).
- **una sola timeline** gsap, in unità da 0 a 100 come la percentuale di scroll, con quattro etichette: `illustrazione` 0, `branding` 25, `3d` 50, `web design` 75.
- stato iniziale: il nome (`h1`, “alessandro” in alto, “bottone” in basso) e il volto al centro (`max(26vmin, 11rem)`). l’invito a scorrere è una linea verticale che pulsa in fondo e il volto che ogni tanto guarda in basso (ogni 5,2s, solo se la pagina è in cima).
- **`Tavola.tsx`** è l’svg decorativo che sta sopra il volto, nelle sue stesse coordinate: filtro “matita”, schizzi, griglia, campioni di colore, finestra del browser, copertina.
- **`misure.ts`**: `FINESTRA` (la finestra del browser) e `CARTA` (la card 4:5 in cui si trasforma), più l’id del filtro matita. `CARTA` la usano anche le card del portfolio.

| fase | cosa succede |
|---|---|
| 01 illustrazione (0–25) | le lettere del nome salgono via; il filtro `feTurbulence` + `feDisplacementMap` cresce e i tratti diventano “a mano libera” (il rumore cambia a scatti ogni 120ms per sembrare una matita); le linee di schizzo si disegnano con drawsvg |
| 02 branding (25–50) | il tremolio torna a zero; gli schizzi svaniscono; si disegna la griglia di costruzione (cerchi guida, assi, quote senza numeri) e compare l’area di rispetto tratteggiata; il volto si sposta (a sinistra su desktop, in su su telefono) e accanto compare il nome come logotipo; entrano i tre cerchi della palette |
| 03 3d (50–75) | griglia, campioni e logotipo svaniscono; il volto torna al centro; il canvas 3d appare e il volto svg si dissolve; la camera ruota fino a -35°, la luce scorre, il modello si inclina verso il cursore |
| 04 web design (75–100) | il modello arretra (scala 0,6) e ruota a -12°; si disegna la finestra del browser (barra, colonne, un pulsante) e un puntatore arriva e clicca il pulsante; il contenuto della finestra svanisce e la cornice si stringe fino alla card (`CARTA`); il 3d svanisce e compare la copertina del primo progetto; il bordo passa da bianco a grigio (bianco al 31,5% = `#4d4b4a`) |

- in basso a sinistra l’etichetta della fase (`01 illustrazione` … `04 web design`) cambia con `TestoCheRotola`; in basso a destra quattro trattini si riempiono, uno per fase. etichetta e trattini compaiono solo durante le fasi e spariscono alla fine.
- il canvas 3d lavora solo quando l’header è attivo e oltre il 45% dello scroll.
- tornando indietro tutto si riavvolge (è una timeline con scrub).
- alla fine resta solo la card: da qui continua il portfolio (vedi [architettura](architettura.md), “come si collegano le sezioni”).

## portfolio

file: `src/sections/Portfolio/`. `Portfolio.tsx` sceglie il modo: **anello** da 768px, **pila** sotto i 768px, **griglia** con movimento ridotto.

pezzi comuni:
- `carta.ts`: misura della card calcolata dalla card finale dell’header (stessa misura e posizione), testo accessibile dei link, `useApriProgetto()` che apre il pannello passando il rettangolo della copertina (con ctrl/cmd/clic centrale il link si comporta da link normale).
- `Copertina.tsx`: due immagini sovrapposte (sotto in scala di grigi, sopra a colori) e un velo nero. per passare dal grigio al colore e per scurire si anima solo l’opacità. usa la copertina piccola (`-card.webp`, 900px) con `srcset` verso quella grande.

### anello (`Anello.tsx`, desktop e tablet)

- le card sono elementi html su un anello 3d in css: prospettiva 1400px, ogni card `rotateY(angolo) translateZ(raggio)`. il raggio si calcola da numero e larghezza delle card, così non si sovrappongono (funziona con qualsiasi numero di progetti).
- sezione bloccata; lunghezza di scroll = **70vh** di disposizione + **50vh per ogni progetto dopo il primo** + **30vh** di coda (`movimento.portfolio`).
  - disposizione: le card si allargano attorno alla prima, formando l’anello; entrano le informazioni sotto
  - rotazione: l’anello gira di una card ogni 50vh
  - coda: un po’ di scroll fermo prima di sbloccare la sezione
- la card frontale è a colori; le altre passano al grigio e si scuriscono con l’angolo; quelle di spalle spariscono.
- sotto l’anello: titolo, contatore `03 / 10`, discipline e anno della card frontale, con `TestoCheRotola`.
- **aggancio**: quando lo scroll si ferma durante la rotazione, l’anello si porta sulla card più vicina (0,6s).
- **tieni premuto** (solo mouse e penna): dopo 0,25s l’anello gira veloce (4 card al secondo); al rilascio si aggancia e il clic non apre il progetto. il cursore mostra “tieni premuto” finché il mouse non esce dall’anello la prima volta.
- **velocità**: le card si inclinano (skew, max 5°) in base alla velocità dello scroll e tornano dritte quando ci si ferma.
- **hover sulla card frontale** (motion, su un elemento interno): inclinazione 3d che segue il cursore (± 6°), copertina che si ingrandisce a 1,04, cursore “apri”. premuto: scala 0,97.
- **clic su una card laterale**: la porta davanti invece di aprirla.
- **tastiera**: frecce ← → ruotano; tab su una card la porta davanti; invio apre.

### pila (`Pila.tsx`, telefono)

- card impilate: ognuna si ferma al centro dello schermo (sticky) e la successiva ci scorre sopra.
- mentre la nuova arriva: la nuova passa a colori, quella sotto torna grigia, si rimpicciolisce a 0,9 e si scurisce (velo al 60%) (`pilaScala`, `pilaScuro`).
- ingresso: nei primi 45vh (`pilaIngresso`) la prima card cresce dalla misura della card finale dell’header a quella della pila, e compare la didascalia.
- tap per aprire; premuto: scala 0,98.

### griglia (`Griglia.tsx`, movimento ridotto)

- due colonne, nessun pin né scrub, tutte le card a colori.
- stati solo con dissolvenze: passaggio e focus → copertina più tenue; premuto → ancora di più.

## chi sono (`src/sections/ChiSono/ChiSono.tsx`)

- **pin**: da 768px di larghezza e 560px di altezza la sezione resta bloccata per **150vh** (`movimento.chiSono.pin`) mentre il testo si accende. sotto queste misure niente pin: il testo si accende mentre attraversa lo schermo.
- **accensione**: splittext divide il testo in parole; ogni parola passa da opacità 0,315 (bianco al 31,5% sul nero = il grigio `#4d4b4a`) a 1, con scrub. su desktop, a testo acceso, c’è un attimo di pausa prima che la sezione riparta.
- **foto**: entra quando arriva all’80% dello schermo, con una maschera `clip-path` che si apre dal basso e uno zoom da 1,15 a 1. tornando su si richiude.
- **firma** (`src/config/foto.ts`): quando la foto è entrata, i tratti del volto si disegnano sopra il viso (1,2s), restano per `foto.pausa` (0,8s) e si cancellano. al passaggio del mouse si ridisegnano e restano finché il mouse è sopra; su touch un tocco la ripete; tornando alla sezione dal basso si ripete. posizione (`x`, `y` = punto a metà tra le lenti), `scala`, `colore` e `firma: false` per disattivarla sono in `foto.ts`.
- il testo per gli screen reader è una copia nascosta; le parole animate sono `aria-hidden`.

## contatti (`src/sections/Contatti/Contatti.tsx`)

- **entrata** (quando la sezione arriva al 55% dello schermo): il volto (`max(36vmin, 9rem)`) si disegna in 1,6s con gli occhi chiusi, poi si sveglia e sbatte le palpebre; i tre pulsanti salgono sfalsati. tornando su tutto si riavvolge (a velocità doppia).
- **sguardo**: il volto segue il cursore; con il mouse (o il focus da tastiera) su un pulsante, guarda quel pulsante.
- **pulsanti a pillola** (min 56px di altezza; in riga da 768px, in colonna a tutta larghezza sotto):
  - al passaggio un cerchio bianco si allarga dal punto da cui entra il cursore (`clip-path`) ed esce dal punto da cui esce; il testo nero è una seconda copia ritagliata dal riempimento
  - il testo rotola (`RotolaAlPassaggio`); il pulsante è attratto dal cursore fino a 12px (`Magnetico`)
  - freccia ↗ per i link esterni (instagram, behance: nuova scheda)
  - su touch: il riempimento entra dal punto toccato e sparisce dopo 0,45s; il testo rotola una volta quando il pulsante entra in vista
- **email**: un clic copia l’indirizzo (`src/lib/appunti.ts`, con una soluzione di riserva per i browser senza api degli appunti). l’etichetta diventa “copiata” con la spunta per 2s, il volto fa l’occhiolino e sorride, gli screen reader sentono “indirizzo email copiato”. se la copia non riesce si apre il programma di posta (`mailto:`). al passaggio del mouse o con il focus compare un piccolo suggerimento con l’indirizzo (fatto con motion).

## cursore (`src/components/cursore/Cursore.tsx`)

- esiste solo con il mouse (`(hover: hover) and (pointer: fine)`) e senza movimento ridotto; nasconde il cursore di sistema.
- gsap sposta il contenitore con leggera inerzia (`quickTo`, 0,18s); motion cambia la forma dentro.

| dove | forma |
|---|---|
| ovunque | punto bianco da 10px |
| link, pulsanti, elementi con focus | anello da 44px |
| elementi con `data-cursore="…"` | cerchio pieno da 96px con la parola in nero |
| pressione | si contrae a 0,8 |

parole usate: `apri` (card frontale dell’anello), `tieni premuto` (anello, al primo passaggio), `chiudi` (fuori dal pannello), `sfoglia` (pdf), `ruota` (3d), `play` / `pausa` (video).

la forma si ricalcola anche senza muovere il mouse: dopo uno scroll (anche dentro il pannello), a ogni cambio di focus e a ogni cambio di indirizzo (apertura e chiusura del pannello).

## micro-interazioni riusabili

| componente | cosa fa | dove si usa |
|---|---|---|
| `src/components/testo/RotolaAlPassaggio.tsx` | testo di link e pulsanti che “rotola”: le lettere salgono e una copia arriva dal basso. si attiva da solo con passaggio del mouse o focus da tastiera sul link/pulsante che lo contiene (su touch al tocco), oppure con la prop `attivo` | pulsanti dei contatti, “chiudi” del pannello |
| `src/components/testo/TestoCheRotola.tsx` | quando il testo cambia, le lettere vecchie salgono e le nuove arrivano dal basso | etichette dell’header, info sotto l’anello |
| `src/components/testo/NomePesoVariabile.tsx` | le lettere vicine al cursore diventano più pesanti (asse `wght` di outfit da 300 a 600, in base alla distanza); su touch nel punto toccato | nome dell’header (nel logotipo della fase branding il peso resta 300) |
| `src/components/interazioni/Magnetico.tsx` | involucro attratto dal cursore (max 12px, `movimento.magnetismo.pulsanti`; 4–6px per i controlli piccoli). solo con il mouse | pulsanti dei contatti, del pannello e dei blocchi |
| `src/components/effetti/Grana.tsx` + `.grana` in `globals.css` | rumore leggerissimo (opacità 4%) su tutto il sito; animato solo con mouse e senza movimento ridotto, fermo su touch | ovunque |

altre regole:
- stati “premuto” con `active:scale-…` sui pulsanti e sulle card.
- focus da tastiera: anello bianco 2px con distanza 4px, che entra stringendosi in 0,3s (`globals.css`).

## cosa controlla `src/config/movimento.ts`

| gruppo | valori |
|---|---|
| `ease` | curve: `entrata` (`expo.out`), `transizione` (`power3.inOut`) |
| `durata` | `micro` 0,25s · `standard` 0,7s · `grande` 1,4s · `ridotta` 0,2s (movimento ridotto) |
| `scrub` | `desktop` 1 · `mobile` 0,6 |
| `lenis` | `lerp` 0,1 (più basso = più morbido e lento) |
| `preloader` | `minimo` 1,6s · `massimo` 6s · `breve` 0,8s (seconda visita nella stessa sessione) |
| `header` | `pinDesktop` 400 · `pinMobile` 300 (vh) |
| `portfolio` | `perProgetto` 50vh · `disposizione` 70vh · `coda` 30vh · `prospettiva` 1400px · `spazioCard` 0,35 · `aggancio` 0,6s · `tieniPremutoDopo` 0,25s · `tieniPremutoVelocita` 4 card/s · `inclinazioneHover` 6° · `inclinazioneVelocita` 5° · `pilaScala` 0,9 · `pilaScuro` 0,6 · `pilaIngresso` 45vh |
| `chiSono` | `pin` 150 (vh) |
| `volto` | `battitoMin` 3s · `battitoMax` 7s · `sonnoDopo` 8s · `sguardoMax` 0,2 (attenzione: oggi non è letto dal codice, lo spostamento delle pupille è fissato in `geometria.ts`) |
| `pannello` | `volo` 0,9s · `entrata` 0,7s · `uscita` 0,45s · `scalaPagina` 0,96 · `velo` 0,7 (oggi non letto: l’opacità del velo è fissata in `Pannello.tsx`, stesso valore) · `trascinaPerChiudere` 120px · `giroPagina` 0,8s |
| `magnetismo` | `pulsanti` 12px |

nello stesso file:
- `media`: i breakpoint (telefono < 768px, tablet 768–1023px, desktop ≥ 1024px, anello ≥ 768px, pin del chi sono, mouse, movimento ridotto)
- `volto`: dimensione del volto nel preloader (`max(30vmin, 12rem)`) e nell’header (`max(26vmin, 11rem)`)

## movimento ridotto

con `prefers-reduced-motion: reduce`:

- niente lenis (scroll nativo), niente pin né scrub
- header: nome e volto fermi, niente tavola né 3d, niente etichette delle fasi
- portfolio: griglia a due colonne
- chi sono: testo tutto bianco da subito; la foto non ha la maschera; la firma compare e scompare con una dissolvenza
- contatti: volto già disegnato e sveglio, pulsanti che entrano con una dissolvenza; riempimento dei pulsanti in dissolvenza invece del cerchio
- volto: niente battiti, pupille ferme, cambi di stato istantanei
- testi che rotolano: diventano dissolvenze
- cursore di sistema (il cursore personalizzato non c’è), grana ferma, magnetismo spento
- preloader e pannello: solo dissolvenze di 0,2s
- css (`globals.css`): tutte le transizioni e animazioni css annullate, tranne le dissolvenze (`transition-opacity`, 0,2s)
