# animazioni

cosa si muove, dove sta il codice e quali numeri si possono regolare. tutti i tempi e le lunghezze di scroll regolabili sono in `src/config/movimento.ts` (ultima sezione di questa pagina).

## header e logo continuo

file: `src/sections/Header/Header.tsx`, `Tavola.tsx`, `src/components/volto/LogoContinuo.tsx`, `Volto3D.tsx`, `percorso.ts`.

- header bloccato per 400vh desktop/tablet, 300vh telefono. una timeline in unità 0–100: illustrazione 0, branding 25, 3d 50, web 75.
- volto interamente visibile, largo `min(86vw, 104svh)`. nome e cognome restano sui bordi fino al 92% dell’header, poi si riducono in due righe fisse in alto a destra, cliccabili per tornare all’inizio; etichette grandi, senza numeri, nessun trattino di avanzamento.
- illustrazione: filtro matita e schizzi; branding: griglia di costruzione e campioni, piccolo arretramento del volto; 3d: SVG e modello animabile si sovrappongono e si dissolvono, poi rotazione fino a -35°; web: finestra disegnata e puntatore, il volto arretra e raggiunge la misura del logo centrale della spirale. la finestra svanisce, il volto resta.
- il Canvas globale continua attraverso tutte le sezioni. `percorso.ts` legge gli ancoraggi DOM e i numeri delle timeline: nessun rimontaggio tra header, portfolio, biografia e contatti. tutto si riavvolge tornando su.

## portfolio: spirale → griglia

file: `src/sections/Portfolio/Spirale.tsx` (id ScrollTrigger `portfolio-anello` conservato per i moduli che lo leggono), `Portfolio.tsx`, `CardCopertina.tsx`, `Griglia.tsx`.

- spirale elicoidale con cornici solide smussate, copertine incassate e retro scuro; le venti card passano davanti e dietro al logo. camera diagonale con orbita parziale, presente anche su telefono. dettagli in [ambiente 3d](ambiente-3d.md).
- copertine sempre a colori, usando una sola immagine con `srcset`. niente didascalie o aperture nella scena 3d.
- scroll: 70vh di apertura, 50vh per ogni progetto dopo il primo, 30vh di pausa e 200vh per mostrare l’elica in campo lungo, raddrizzare le card e raggiungere le posizioni misurate dalla griglia reale.
- durante il passaggio alla griglia il logo si rimpicciolisce e si sposta a sinistra. desktop/tablet hanno spazio laterale riservato; sul telefono il logo piccolo sta in alto.
- a griglia completa scroll normale per tutte le righe. tornando su la trasformazione si riavvolge e la card aperta si richiude. il refresh delle misure non altera lo stato aperto.
- frecce ← → per ruotare la scena; “tieni premuto” e aggancio soltanto con mouse/penna, senza aggancio automatico sul telefono. La vecchia pila mobile è stata rimossa: la home usa un unico percorso spirale → griglia.

### griglia e card informative (`Griglia.tsx`, `CardProgetto.tsx`, `portfolio.css`)

- **3 colonne da 1024px**, **2 da 768px**, **1 sotto i 768px**; nessun titolo o didascalia fuori dalle card. anche sul telefono la spirale termina nella griglia a una colonna.
- a riposo le card mostrano solo la copertina. il clic espande il pannello nero sotto l’immagine: titolo, discipline, anno, descrizione, “esplora” e “chiudi”. tutti i testi informativi sono bianchi; i bottoni mantengono gli stati figma già usati nei contatti.
- una sola card aperta alla volta. l’espansione aumenta l’altezza della riga e sposta le successive; a fine animazione si aggiornano le misure di lenis e scrolltrigger.
- “esplora” apre il pannello esistente, con il volo della copertina. “chiudi”, un altro clic sulla copertina o esc richiudono le informazioni. il pulsante della copertina espone `aria-expanded` e `aria-controls`; i controlli chiusi o non ancora disponibili sono esclusi dalla tastiera.
- `CardCopertina.tsx` è l’aspetto comune all’anello e alla griglia; i dati e le immagini provengono dai file dei progetti. misure, raggi e spaziature di figma si adattano alla larghezza della card; i testi hanno una misura minima leggibile.

## chi sono (`src/sections/ChiSono/ChiSono.tsx`)

- foto e firma rimosse; resta il testo biografico invariato, con il logo 3d a sinistra. su mobile il logo è più piccolo per lasciare spazio al testo.
- SplitText accende ogni parola da opacità 0,315 a 1, in sequenza, durante 150vh di scroll. poi 100vh accompagnano il logo verso il centro e la misura dei contatti; il testo si dissolve.
- il pin si usa soltanto se il testo entra nello schermo (meno dell’86% dell’altezza, schermo alto più di 500px). altrimenti testo in flusso normale e uscita del logo guidata dall’ultimo tratto di scroll della sezione.
- `autoSplit` riallinea le parole dopo i cambi di font/layout. copie `sr-only` per lettura accessibile, parole animate `aria-hidden`.

## contatti (`src/sections/Contatti/Contatti.tsx`)

- **entrata**: il logo 3d arriva dalla biografia, grande al centro; resta fermo in posizione e scala, continuando espressioni, sonno e sguardo. i pulsanti e il copyright sottostante salgono sfalsati quando i contatti arrivano al 65% dello schermo. l’anno del copyright si aggiorna automaticamente.
- **sguardo**: il volto segue il cursore; con il mouse (o il focus da tastiera) su un pulsante, guarda quel pulsante.
- **pulsanti**: il `Bottone` di figma in misura big (`src/components/bottoni/`), solo testo; in riga da 768px, in colonna a tutta larghezza sotto:
  - a riposo pieno bianco con testo nero; al passaggio un cerchio nero si allarga dal punto da cui entra il cursore (`clip-path`) ed esce dal punto da cui esce, con il testo bianco come seconda copia ritagliata, e sotto si accende il bagliore bianco (`shadow-bagliore`, solo opacità); premendo compare un bordo bianco
  - il testo rotola (`RotolaAlPassaggio`); il pulsante è attratto dal cursore fino a 12px (`Magnetico`)
  - su touch: il nero entra dal punto toccato e sparisce dopo 0,45s; il testo rotola una volta quando il pulsante entra in vista
  - `BottoneIcona` (cerchio 40/48/56px) e `Icona` (svg di figma) sono pronti ma per ora si vedono solo in `/laboratorio`
- **email**: un clic copia l’indirizzo (`src/lib/appunti.ts`, con una soluzione di riserva per i browser senza api degli appunti). l’etichetta diventa “copiata” per 2s, il volto fa l’occhiolino e sorride, gli screen reader sentono “indirizzo email copiato”. se la copia non riesce si apre il programma di posta (`mailto:`). al passaggio del mouse o con il focus compare un piccolo suggerimento con l’indirizzo (fatto con motion).

## cursore (`src/components/cursore/Cursore.tsx`)

- esiste solo con il mouse (`(hover: hover) and (pointer: fine)`) e senza movimento ridotto; nasconde il cursore di sistema.
- gsap sposta il contenitore con leggera inerzia (`quickTo`, 0,18s); motion cambia la forma dentro.

| dove | forma |
|---|---|
| ovunque | punto bianco da 10px |
| link, pulsanti, elementi con focus | anello da 44px |
| elementi con `data-cursore="…"` | cerchio pieno da 96px con la parola in nero |
| pressione | si contrae a 0,8 |

parole usate: `info` / `chiudi` (copertina delle card in griglia), `tieni premuto` (spirale, al primo passaggio), `chiudi` (fuori dal pannello), `sfoglia` (pdf), `ruota` (3d), `play` / `pausa` (video).

la forma si ricalcola anche senza muovere il mouse: dopo uno scroll (anche dentro il pannello), a ogni cambio di focus e a ogni cambio di indirizzo (apertura e chiusura del pannello).

## micro-interazioni riusabili

| componente | cosa fa | dove si usa |
|---|---|---|
| `src/components/testo/RotolaAlPassaggio.tsx` | testo di link e pulsanti che “rotola”: le lettere salgono e una copia arriva dal basso. si attiva da solo con passaggio del mouse o focus da tastiera sul link/pulsante che lo contiene (su touch al tocco), oppure con la prop `attivo` | pulsanti dei contatti, “chiudi” del pannello |
| `src/components/testo/TestoCheRotola.tsx` | quando il testo cambia, le lettere vecchie salgono e le nuove arrivano dal basso | etichette dell’header |
| `src/components/testo/NomePesoVariabile.tsx` | le lettere vicine al cursore diventano più pesanti (asse `wght` di outfit da 300 a 600, in base alla distanza); su touch nel punto toccato | nome dell’header  |
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
| `portfolio` | `perProgetto` 50vh · `disposizione` 70vh · `coda` 30vh · `versoGriglia` 200vh · `prospettiva` 1400px · `aggancio` 0,6s · `tieniPremutoDopo` 0,25s · `tieniPremutoVelocita` 4 card/s · `inclinazioneVelocita` 5° |
| `portfolio.spirale3d` | `campoVisivo` 42° · `orbitaDa/A` −24°/+22° · `elevazione` 10° · `profondita` 0,52 · `passo` 0,82 · ritiro/distensione finali da 0 a 0,3 e da 0,3 a 0,88 |
| `chiSono` | `pin` 150 · `versoContatti` 100 (vh) |
| `volto` | `battitoMin` 3s · `battitoMax` 7s · `sonnoDopo` 8s |
| `pannello` | `volo` 0,9s · `entrata` 0,7s · `uscita` 0,45s · `scalaPagina` 0,96 · `velo` 0,7 · `trascinaPerChiudere` 120px · `giroPagina` 0,8s |
| `magnetismo` | `pulsanti` 12px |

nello stesso file:
- `media`: i breakpoint (telefono < 768px, tablet 768–1023px, desktop ≥ 1024px, mouse, movimento ridotto)
- `volto`: dimensione del volto nel preloader (`max(30vmin, 12rem)`) e nell’header (`min(86vw, 104svh)`)

## movimento ridotto

con `prefers-reduced-motion: reduce`:

- niente lenis (scroll nativo), niente pin né scrub
- header: nome e volto fermi, niente tavola né 3d, niente etichette delle fasi; all’uscita dell’header il nome passa direttamente al formato piccolo fisso
- portfolio: griglia a 3/2/1 colonne, subito interattiva, senza anello
- chi sono: testo tutto bianco da subito e volto SVG statico, senza foto né firma
- contatti: volto già disegnato e sveglio, pulsanti che entrano con una dissolvenza; riempimento nero dei pulsanti in dissolvenza invece del cerchio
- volto: niente battiti, pupille ferme, cambi di stato istantanei; la preferenza aggiorna questi comportamenti anche a sito aperto
- testi che rotolano: diventano dissolvenze
- cursore di sistema (il cursore personalizzato non c’è), grana ferma, magnetismo spento
- preloader e pannello: solo dissolvenze di 0,2s
- css (`globals.css`): tutte le transizioni e animazioni css annullate, tranne le dissolvenze (`transition-opacity`, 0,2s)
