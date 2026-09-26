# il pannello del progetto

si apre sopra la pagina quando si clicca una card. file: `src/pannello/`.

## la rotta modale

- indirizzo: `/progetti/<slug>` (`src/router.tsx`). il pannello si scarica solo alla prima apertura (`React.lazy`).
- la home **resta sempre montata sotto**: aprendo e chiudendo non si ricarica niente e si torna esattamente dove si era.
- cliccando una card (`useApriProgetto()` in `src/sections/Portfolio/carta.ts`) il sito naviga a `/progetti/<slug>` passando nello stato:
  - `sfondo`: l’indirizzo della pagina sotto (la “background location”)
  - `origine`: il rettangolo della copertina cliccata sullo schermo, per il volo
- chiusura: se c’è `sfondo` (aperto dal sito) si torna indietro nella cronologia; se manca (link diretto o refresh) si va a `/`.
- **slug inesistente** → redirect a `/`.
- **link diretto**: le rotte si montano solo a preloader finito; poi la home scorre fino al portfolio con l’anello già formato e il pannello si apre (senza volo della copertina).

## apertura

in `Pannello.tsx` e `transizioni.ts` (tutto con gsap):

1. `fermaScroll()`: lenis fermo e `html.scroll-fermo`, la pagina sotto non scorre.
2. **la pagina sotto arretra** (`arretraPagina()`): `main` scala a 0,96 (`movimento.pannello.scalaPagina`). se al centro dello schermo c’è una sezione bloccata (pin), lo spostamento viene compensato perché resti ferma dov’è.
3. il **velo** nero (70%) entra in dissolvenza.
4. il **foglio**: su telefono sale dal basso a schermo intero; da 768px entra dal basso con una dissolvenza, con un margine attorno (bordo grigio, raggio 16px).
5. la **copertina vola** (`volaCopertina()`, solo se si arriva da una card): un clone dell’immagine va dal rettangolo della card a quello della testata del pannello in 0,9s. il clone ha già la misura finale e si animano solo `transform` e `clip-path` (niente immagini deformate). all’arrivo il clone sparisce e appare l’immagine vera.
6. titolo, descrizione, meta e blocchi entrano sfalsati.

con movimento ridotto: velo e foglio compaiono con una dissolvenza di 0,2s, niente arretramento né volo.

## struttura del pannello

1. pulsante **chiudi** (x + testo che rotola, magnetico) fisso in alto a destra
2. copertina (4:5 su telefono, 16:9 da 768px)
3. **titolo** (titolo del dialog), **descrizione**, riga **meta**: `discipline · anno · cliente`
4. i **blocchi**, nell’ordine di `progetto.json`
5. anteprima del **progetto successivo** (dopo l’ultimo si torna al primo): cliccandola il pannello resta aperto, torna in cima e il nuovo contenuto entra in dissolvenza. l’indirizzo cambia con `replace`, quindi chiudendo si torna comunque alla home

su telefono in cima al foglio c’è una piccola maniglia decorativa.

## chiusura

- pulsante “chiudi”
- `esc`
- clic fuori dal foglio (sul velo il cursore mostra “chiudi”)
- tasto indietro del browser
- su telefono: trascinando il foglio verso il basso quando è in cima. si chiude oltre 120px (`movimento.pannello.trascinaPerChiudere`) o con un gesto rapido; altrimenti torna su. dentro pdf, 3d e video il trascinamento non chiude (`data-no-trascina`)

animazione: il velo svanisce, la pagina torna a scala 1, il foglio esce (in giù su telefono, in dissolvenza da 768px) in 0,45s (`movimento.pannello.uscita`). alla fine `riprendiScroll()` riavvia lenis. anche con il tasto indietro (che smonta il pannello di colpo) la pagina torna al suo posto con un’animazione.

## scroll e focus

- mentre il pannello è aperto lenis è fermo; il contenuto del pannello scorre con lo scroll nativo (`data-lenis-prevent`, `overscroll-contain`).
- il pannello usa il dialog di radix (via `src/components/ui/dialog.tsx`): focus intrappolato dentro, `aria-modal="true"`, titolo e descrizione collegati al dialog.
- alla chiusura il focus torna alla card dell’ultimo progetto visto (o, se non si trova, a quella del primo aperto), senza far scorrere la pagina.

## i blocchi

`src/pannello/Blocchi.tsx` mostra i blocchi in ordine. ogni tipo è un file a parte in `src/pannello/blocchi/`, caricato con `React.lazy` solo quando serve: mentre si scarica c’è un riquadro d’attesa della stessa forma (la pagina non salta). se un blocco si rompe, il resto del pannello continua a funzionare.

### pdf (`Pdf.tsx`)

- **react-pdf** disegna le pagine (worker di pdf.js configurato per vite, senza strato di testo né annotazioni); **page-flip** le fa girare come un libro. `react-pageflip` non supporta react 19, quindi page-flip è usato direttamente: il codice crea i nodi delle pagine e ci disegna dentro con dei portali react.
- **doppia pagina** quando lo spazio è largo almeno 700px, altrimenti una pagina (su telefono si gira con uno swipe). la prima pagina è la copertina. altezza massima: 72% dello schermo.
- pagine disegnate man mano: solo quelle entro 3 da quella aperta; una volta disegnate restano.
- controlli: pagina precedente, contatore `3 / 24` (annunciato agli screen reader), pagina successiva, schermo intero (su safari ios, che non lo permette, il libro occupa tutta la finestra). pulsanti magnetici (6px).
- giro di pagina 0,8s (`movimento.pannello.giroPagina`); con movimento ridotto niente animazione né ombre.
- cursore “sfoglia”. se il pdf non si apre, il blocco non viene mostrato (avviso nella console).

### modello3d (`Modello3D.tsx`)

- un `<Canvas>` dedicato che nasce la prima volta che il blocco si avvicina allo schermo (200px prima) e si mette in pausa quando esce.
- il modello (`.glb` compresso con meshopt, caricato con `useModello` di `src/components/volto/tre.ts`) viene centrato e scalato per stare sempre nell’inquadratura.
- `OrbitControls` di drei: rotazione con inerzia, rotazione automatica finché non lo si tocca, zoom limitato (distanza 2,6–7), niente spostamento laterale.
- luci “da studio” (`<Luci />`), luce ambiente leggera e ombra di contatto (`ContactShadows`).
- barra di caricamento sottile al centro; pulsante per ripristinare la vista (e riattivare la rotazione automatica).
- dpr massimo 1,5 su telefono. cursore “ruota”. con movimento ridotto niente inerzia né rotazione automatica.

### video (`Video.tsx`)

- **file mp4** (con `poster` facoltativo): controlli personalizzati play/pausa, barra di avanzamento (trascinabile; da tastiera frecce ±5s, `home`, `end`; `role="slider"`), audio sì/no, schermo intero (su safari ios passa al lettore di sistema). clic sul video = play/pausa. cursore “play” / “pausa”.
- **`autoplay: true`**: parte muto e in loop solo quando è in vista, si ferma quando esce. l’audio non parte mai da solo.
- **link vimeo o youtube** (`url`): all’inizio c’è solo il poster (se c’è) e un pulsante play; il lettore esterno (youtube-nocookie, vimeo con `dnt=1`) si carica solo al clic. un link non riconosciuto non mostra niente (avviso nella console).

### immagini (`Immagini.tsx`)

- `piena`: una sotto l’altra; `griglia`: due colonne da 768px.
- ogni immagine entra quando arriva in vista con una maschera che si apre dal basso (`clip-path`) e un leggero zoom indietro (motion); nella griglia la seconda colonna parte un attimo dopo. con movimento ridotto: dissolvenza.
- `loading="lazy"`; testo alternativo `immagine <n> di <titolo>`.

### testo (`Testo.tsx`)

paragrafi; una riga vuota nel testo li separa.
