# il volto

il logo è un pittogramma del volto di alessandro: due lenti, una linea orizzontale che fa da ponte, un naso a “l”, palpebre ad arco con pupille, un sorriso. nel sito è sempre bianco su nero e sembra vivo.

## la geometria (`src/components/volto/geometria.ts`)

il file originale (`sorgenti/Logo.svg`) ha le forme espanse (riempimenti), che non si possono disegnare né animare. per questo il volto è stato ricostruito **a tratti**: ogni parte è una linea con il suo spessore, nelle stesse coordinate dell’originale (247.41 × 176.88, con un po’ di spazio sotto per il sorriso: viewbox 247.41 × 180).

| parte | come è fatta |
|---|---|
| lenti | due ellissi (`LENTE`); la destra è lo specchio della sinistra rispetto all’asse centrale (`ASSE`) |
| ponte | linea orizzontale tra le lenti (`PONTE`) |
| naso | linea verticale che gira a destra in basso, a “l” (`NASO`) |
| pupille | un anello ellittico (`PUPILLA`), ritagliato dentro la lente e sotto la palpebra |
| palpebre | un arco tra due punti fissi della lente; la funzione `palpebra(apertura)` lo calcola |
| sorriso | un arco (`SORRISO`) e una versione più ampia (`SORRISO_AMPIO`) per il morph |

spessori: occhi 13.6, naso e ponte 15.3, sorriso 12.1 (`SPESSORE`).

**apertura delle palpebre** (`APERTURA`): da 0 (chiusa, arco verso il basso) a 1 (spalancata). valori usati: `dorme` 0, `sorride` 0.42, `naturale` 0.5 (come il logo), `sveglio` 1. lo stato sveglio è volutamente contenuto: aprendo di più la palpebra toccherebbe la lente.

`sottoPalpebra(apertura)` è la zona sotto la palpebra: la pupilla si vede solo lì, quindi più la palpebra sale, più pupilla si vede.

`svgStatico()` restituisce il volto come file svg completo (per favicon e immagine og).

## il componente `<Volto />` (`src/components/volto/Volto.tsx`)

un solo componente svg, inserito nella pagina (non come immagine), riusato ovunque: preloader, header, firma sopra la foto, contatti, laboratorio.

### props

| prop | cosa fa |
|---|---|
| `stato` | `dorme`, `naturale`, `sveglio`, `occhiolino`, `sorride`. se manca, segue l’umore globale (dorme / naturale) |
| `guarda` | un punto dello schermo `{ x, y }` o un elemento da guardare; se manca segue il cursore (o l’ultimo tocco) |
| `disegno` | quanto è disegnato, da 0 a 1 |
| `dimensione` | larghezza (es. `"26vmin"` o un numero in pixel) |
| `etichetta` | se c’è, il volto è un’immagine con `role="img"` e quella descrizione; se manca è decorativo (`aria-hidden`) |
| `interattivo` | clic o tap → occhiolino (predefinito: sì) |
| `filtro` | id di un filtro svg (l’header lo usa per il tratto “a matita”) |

con un `ref` si ottengono dei comandi diretti: `disegna(p)`, `battito()`, `occhiolino()`, `sorridi()` e l’elemento `svg`. il preloader, il chi sono e i contatti disegnano il volto così, senza passare da react a ogni fotogramma.

### come si anima

tutto dentro l’svg è animato da gsap:

- **stati**: al cambio di stato le palpebre vanno all’apertura giusta (1,2s per addormentarsi, 0,35s per il resto); con `occhiolino` si chiude solo l’occhio destro; con `sorride` il sorriso passa a `SORRISO_AMPIO` con morphsvg.
- **battito**: le palpebre si chiudono e si riaprono in pochi centesimi di secondo. parte da solo a intervalli casuali tra 3 e 7 secondi (`movimento.volto.battitoMin/Max`). non succede se il volto dorme o sta facendo l’occhiolino.
- **occhiolino**: occhio destro chiuso per un istante; non succede se dorme.
- **sorriso** (`sorridi()`): sorriso ampio per circa un secondo, poi torna normale.
- **disegno**: i tratti si disegnano con drawsvg in quest’ordine: lenti, ponte, naso, palpebre, pupille, sorriso. a disegno completo le linee tornano normali, così le palpebre possono cambiare forma.
- **clic o tap** sul volto (se `interattivo`): occhiolino.

## umore globale (`src/components/volto/VoltoContext.tsx`)

`VoltoProvider` (in `main.tsx`) vale per tutti i volti del sito:

- **sonno**: dopo 8 secondi senza input (`movimento.volto.sonnoDopo`; input = movimento del mouse, tocco, tasti, rotella, scroll) l’umore diventa `dorme`.
- **risveglio**: al primo input torna `naturale` e, dopo 0,4s, tutti i volti sbattono le palpebre.
- **scheda non attiva**: il titolo diventa `zzz… torna qui` (`sito.titoloAssente`), la favicon passa a `/volto/favicon-dorme.svg` e i volti dormono. tornando sulla scheda: titolo e favicon di prima, risveglio con battito.
- **azioni per tutti**: `azione('battito' | 'occhiolino' | 'sorriso')` fa compiere l’azione a tutti i volti montati.

un volto con `stato` esplicito ignora l’umore globale (per esempio il preloader, o i contatti prima di essere disegnati).

## lo sguardo (`src/components/volto/sguardo.ts`)

un solo ascoltatore globale, condiviso da tutti i volti, tiene: l’ultimo punto del mouse o dell’ultimo tocco, se la pagina sta scorrendo, se l’ultimo input è stato un tocco.

in `Volto.tsx` le pupille si spostano verso il bersaglio con inerzia (0,6s), al massimo del 20% del raggio della lente (`SGUARDO_MAX` in `geometria.ts`). regole:

- se dorme: pupille al centro
- su touch, mentre si scorre (e senza un `guarda`): guardano in basso
- se c’è `guarda`: guardano quel punto o quell’elemento
- altrimenti: il cursore o l’ultimo tocco
- con movimento ridotto le pupille restano ferme

dove si usa `guarda`: nell’header il volto ogni tanto guarda in basso (invito a scorrere); nei contatti guarda il pulsante sotto il mouse o con il focus.

## il volto 3d

- **file**: `public/volto/volto.glb` (circa 92 kb), ottenuto dal file fornito `sorgenti/Logo.glb` compresso con meshopt. è una sola mesh.
- **`src/components/volto/Volto3D.tsx`**: un `<Canvas>` a tutto schermo dietro l’header. camera prospettica con campo visivo di 18°. a ogni fotogramma legge la posizione e la misura in pixel del volto svg dell’header e ci sovrappone il modello, alla stessa misura. il modello nel file è ruotato di qualche grado: il codice lo raddrizza e mette il fronte sul piano dell’svg. materiale bianco opaco (`#c9c5c0`, roughness 0.55).
- gsap non tocca la scena: scrive quattro numeri in `Controllo3D` (`rotazione`, `scala`, `luce`, `inclinazione`) e la scena li legge. la luce direzionale scorre da sinistra a destra; il modello si inclina verso il cursore con inerzia.
- `frameloop` è `always` solo quando l’header è attivo e oltre il 45% dello scroll, altrimenti `never` (il canvas non lavora). dpr massimo 1,5 su telefono, 2 su desktop.
- se il 3d non si carica (rete, webgl assente), l’header continua a funzionare senza (`Senza3D` in `Header.tsx`).
- **`src/components/volto/tre.ts`**: pezzi condivisi con il blocco `modello3d` del pannello, scritti con three puro:
  - `useModello(url)` carica un `.glb` compresso con meshopt
  - `precarica(url)` lo scarica in anticipo (lo usa il preloader tramite `precaricaModello()`)
  - `<Luci />`: luce “da studio” fatta di tre pannelli luminosi fotografati una volta in una mappa a cubo, senza immagini hdr scaricate da internet
- il codice di three e `Volto3D` si scaricano a parte, durante il preloader.

## favicon

`npm run genera-favicon` (`scripts/genera-favicon.mjs`) usa `svgStatico()` di `geometria.ts` per creare, in `public/volto/`:

- `favicon.svg`: volto sveglio su fondo nero
- `favicon-dorme.svg`: volto con gli occhi chiusi (usata quando la scheda non è attiva)
- `apple-touch-icon.png`: 180 px, per safari e ios

se cambi la geometria del volto, rilancia questo comando (e `npm run genera-og`).
