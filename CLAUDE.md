# CLAUDE.md — portfolio di alessandro bottone

> Brief di progetto per Claude Code. Leggilo tutto prima di scrivere codice e rileggi la sezione pertinente all'inizio di ogni fase. Quando qualcosa non è chiaro, chiedi invece di indovinare.

---

## 0. come lavorare con me

- Lavora per fasi (sezione 14). Alla fine di ogni fase fermati, avvia `npm run dev`, dimmi cosa guardare e aspetta il mio ok prima di proseguire.
- Priorità in caso di conflitto: le mie istruzioni in chat > questo file > suggerimenti di UI/UX Pro Max e 21st.dev > impostazioni predefinite delle librerie.
- Rispondimi in italiano e spiegami le cose tecniche in modo semplice: sono un designer, non uno sviluppatore.
- Non installare software di sistema (Node, Python, Git): se manca qualcosa, dimmi come installarlo.
- Non fare `git push` né deploy senza chiedermelo.
- Quando prendiamo una decisione nuova, aggiungila in fondo a questo file, nella sezione "decisioni prese".

---

## 1. il progetto

Landing page portfolio one-page, immersiva, raccontata dallo scroll (scrollytelling).
Chi sono: Alessandro Bottone, 21 anni, designer di Napoli, 7 anni di studio e pratica. Discipline: branding, illustrazione, 3D, web design.

Percorso unico, dall'alto in basso: **preloader → header → portfolio → chi sono → contatti**. Nient'altro.

- nessuna navbar, nessun footer
- solo italiano (`<html lang="it">`)
- desktop e mobile curati allo stesso livello
- sfondo sempre nero
- protagonista del sito: il mio logo, che è un pittogramma del mio volto (sezione 5)

**Riferimenti** (per il livello e alcune idee, non da copiare):
- pxpush.com: etichette e contatori in stile editoriale, ritmo tipografico, l'interazione "tieni premuto per scorrere veloce"
- k95.it: progetti disposti ad anello, testi dei link che "rotolano" al passaggio del mouse, contatore dei lavori

---

## 2. regole non negoziabili

1. **Palette**: solo `#141414` (nero), `#4D4B4A` (grigio), `#C9C5C0` (bianco) e loro trasparenze. Nessun altro colore nell'interfaccia. Uniche eccezioni: le immagini dei progetti e le sfumature prodotte dalla luce sul 3D. Sfondo sempre nero.
2. **Font**: solo Outfit (versione variabile, pesi 100–900). Nessun altro font, nemmeno per numeri o dettagli.
3. **Mai maiuscole visibili**: tutti i testi si scrivono in minuscolo nel codice e in più c'è `text-transform: lowercase` globale come rete di sicurezza. Vale per tutto: `<title>`, etichette, messaggi, alt, aria-label, codici esadecimali (`#c9c5c0`), nomi propri e sigle ("iuad").
4. **Tutto animato, niente di rotto**: ogni elemento entra, reagisce o si muove, ma a 60fps e senza scatti. Si animano solo `transform`, `opacity`, `clip-path` e filtri leggeri.
5. **Lo scroll resta dell'utente**: si può sempre scorrere avanti e indietro, tutto si riavvolge; lo scroll non si blocca mai (unica eccezione: i pochi secondi del preloader) e niente scroll automatici non richiesti. Le sezioni "bloccate" (pin) restano ferme a schermo mentre si scorre, ma lo scroll continua.
6. **Testi forniti = testi pubblicati**: non riscrivere, accorciare o "migliorare" il testo del chi sono né quelli dei progetti.
7. **Niente elementi extra**: nessuna sezione, titolo o testo oltre a quelli descritti qui. Nel dubbio, chiedi.
8. **Accessibile e leggero**: rispetta `prefers-reduced-motion`, tastiera, contrasto e peso delle pagine (sezioni 4, 11 e 12).

---

## 3. stack e ruoli

Usa le ultime versioni stabili e, prima di configurare, controlla la documentazione aggiornata (Tailwind v4 con `@tailwindcss/vite`, React Router in modalità libreria, Motion con import da `motion/react`, pacchetto `lenis`).

| tecnologia | a cosa serve qui |
|---|---|
| React + TypeScript (strict) + Vite | base del progetto |
| Tailwind CSS v4 | stile, solo tramite i token della sezione 4 |
| shadcn/ui | basi accessibili (Dialog per il pannello, Tooltip), sempre ristilizzate |
| Lucide React | icone dell'interfaccia (X, ArrowUpRight, Copy, Check, Play, Pause, Volume2, VolumeX, Maximize2, RotateCcw, ChevronLeft/Right) |
| Motion | micro-interazioni e stati (hover, tap, magnetismo, cursore, entrata/uscita del pannello) |
| GSAP + ScrollTrigger, SplitText, DrawSVG, MorphSVG, Flip, `@gsap/react` | tutto ciò che è guidato dallo scroll, disegno e morph del logo, testi spezzati |
| Lenis | scroll fluido |
| React Three Fiber + drei + three | volto 3D nell'header e visualizzatore 3D nei progetti |
| React Router | `/` e `/progetti/:slug` come rotta modale |
| UI/UX Pro Max | revisione di design e controllo anti-pattern |
| 21st.dev (21st MCP) | ricerca di componenti di partenza |

Tutti i plugin GSAP elencati sono gratuiti e inclusi nel pacchetto `gsap`.

**Dipendenze extra ammesse**: `@fontsource-variable/outfit`, `zod`, `react-pdf`, `react-pageflip` (se dà problemi con React 19, usa direttamente `page-flip` in un wrapper), `simple-icons`; per gli script: `sharp`, `@gltf-transform/cli`. Per qualsiasi altra dipendenza chiedimi.

### chi anima cosa (regola d'oro)

- **GSAP** comanda tutto ciò che dipende dalla posizione di scroll (pin, scrub, timeline delle fasi), il disegno e il morph dei tracciati, lo split dei testi e le transizioni Flip.
- **Motion** comanda stati e micro-interazioni.
- **Mai** GSAP e Motion sulla stessa proprietà dello stesso elemento. Se un elemento è guidato dallo scroll, la micro-interazione va su un wrapper interno.
- **Lenis**: una sola istanza, sincronizzata con il ticker di GSAP:

```ts
const lenis = new Lenis({ lerp: 0.1, smoothWheel: true, syncTouch: false })
lenis.on('scroll', ScrollTrigger.update)
gsap.ticker.add((time) => lenis.raf(time * 1000))
gsap.ticker.lagSmoothing(0)
```

- Usa `gsap.matchMedia()` per separare desktop, mobile e movimento ridotto; `useGSAP` per la pulizia; `ScrollTrigger.config({ ignoreMobileResize: true })`; `ScrollTrigger.refresh()` dopo il caricamento di font e immagini.

### strumenti di design

- **UI/UX Pro Max**: usalo per la revisione (gerarchie, spaziature, anti-pattern, checklist prima della consegna). Se propone palette, font o maiuscole diversi, ignoralo: valgono le sezioni 2 e 4.
- **21st.dev**: usalo per cercare componenti di partenza (bottoni magnetici, testi che rotolano, cursori, ecc.). Ogni componente importato va ripulito: palette, Outfit, minuscole, animazioni secondo la regola d'oro. Niente componenti lasciati "così come sono".

---

## 4. design system

### colori

```css
@theme {
  --color-nero: #141414;
  --color-grigio: #4D4B4A;
  --color-bianco: #C9C5C0;
  --font-sans: "Outfit Variable", sans-serif;
}
```

Mappa le variabili di shadcn su questi tre: `background` = nero, `foreground` = bianco, `muted`/`border`/`input` = grigio, `primary` = bianco, `primary-foreground` = nero, `ring` = bianco. Elimina ogni altro colore del tema.

Uso:
- testo da leggere: sempre bianco su nero (contrasto ≈ 10,7:1)
- grigio su nero ha contrasto ≈ 2:1: solo bordi, linee, superfici, dettagli decorativi, testo gigante decorativo o stati di passaggio (le parole non ancora "accese" del chi sono)
- selezione del testo: sfondo bianco, testo nero
- focus da tastiera: anello bianco 2px con offset 4px
- grana: rumore leggerissimo su tutto il sito (opacità 3–5%), animato su desktop, statico su mobile

### tipografia

- Outfit Variable in locale con `@fontsource-variable/outfit`, precaricato, `font-display: swap`
- scala fluida di partenza (da rifinire a vista):

| ruolo | dimensione | peso | interlinea | spaziatura |
|---|---|---|---|---|
| nome nell'header | `clamp(3.5rem, 15vw, 16rem)` | 300 | 0.85 | -0.04em |
| titolo progetto | `clamp(2rem, 6vw, 5.5rem)` | 300 | 0.95 | -0.03em |
| testo chi sono | `clamp(1.25rem, 2.6vw, 2.5rem)` | 300 | 1.3 | -0.01em |
| testo corrente | `clamp(1rem, 1.1vw, 1.125rem)` | 400 | 1.55 | 0 |
| etichette e contatori | `0.8125rem` | 400 | 1.2 | 0.02em, cifre tabellari |

- apostrofi tipografici (’)
- il peso variabile di Outfit è materia per le micro-interazioni (sezione 8)

### movimento

- ingressi: `expo.out` (≈ `cubic-bezier(0.16, 1, 0.3, 1)`); transizioni: `power3.inOut`
- durate: micro 0,2–0,35s · standard 0,6–0,8s · grandi 1,2–1,6s
- scrub: `1` su desktop, `0.6` su mobile
- tutte le lunghezze di scroll e le durate stanno in `src/config/movimento.ts`, così posso regolarle da solo

### forme

- bordi grigi da 1px; raggio 999px per i pulsanti, 16px per card e pannello (richiama le forme tonde del logo)
- icone Lucide con tratto 1.5

---

## 5. il protagonista: il volto

### cos'è

Il mio logo è un pittogramma del mio volto: due lenti circolari (occhiali) attraversate da una linea orizzontale che sporge ai lati come stanghette, palpebre ad arco semichiuse con pupille a mezzaluna, un naso verticale a forma di "l" che fa da ponte tra le lenti, un sorriso ad arco. Tratto monolineare spesso. Nel sito è sempre bianco su nero. Immagine di riferimento: `src/assets/volto/riferimento.png` (il logo originale, nero su bianco).
Deve sembrare vivo: guarda, sbatte le palpebre, si addormenta, si sveglia, fa l'occhiolino.

### file che fornirò

- `src/assets/volto/volto.svg`: tracciati **a tratto (stroke), non espansi**, con ogni parte separata e un id: `lente-sx`, `lente-dx`, `palpebra-sx`, `palpebra-dx`, `pupilla-sx`, `pupilla-dx`, `naso`, `sorriso` (adatta i nomi al file reale). L'SVG va inserito inline come componente React, non come `<img>`. Se trovi tracciati espansi o parti unite, dimmelo e spiegami come riesportarlo.
- `public/volto/volto.glb`: modello 3D con vista frontale allineata al disegno 2D e parti separate con nomi simili (`lente_sx`, `pupilla_sx`, …). Se ho un altro formato lo esporto in .glb da Blender.
- Finché non arrivano, crea un segnaposto geometrico (cerchi e archi) chiaramente marcato come provvisorio, così il lavoro non si blocca.

### componente `<Volto />`

Un solo componente SVG riusato ovunque, con un context React per l'umore globale.

- pupille = cerchi ritagliati (clipPath) dentro la lente e sotto la palpebra: più la palpebra sale, più si vede la pupilla
- stati: `dorme` (palpebre chiuse), `naturale` (come il logo), `sveglio` (palpebre alte), `occhiolino`, `sorride` (sorriso più ampio, con MorphSVG)
- comportamenti:
  - le pupille seguono il cursore (spostamento massimo ≈ 20% del raggio, con inerzia); su mobile seguono l'ultimo tocco e guardano in basso mentre si scorre
  - battito di palpebre a intervalli casuali (3–7s)
  - dopo 8s senza input si addormenta; al primo movimento si sveglia con un battito
  - clic o tap sul volto: occhiolino
  - quando la scheda del browser non è attiva: titolo "zzz… torna qui" e favicon con gli occhi chiusi; al ritorno tutto si ripristina con un battito
- props: `stato`, `guarda` (punto o elemento), `disegno` (da 0 a 1, per disegnare i tratti con DrawSVG), `dimensione`

### dove compare

preloader (si disegna e si sveglia) → header (quattro fasi) → chi sono (si disegna sopra la mia foto) → contatti (guarda i pulsanti, fa l'occhiolino) → favicon e titolo della scheda.

---

## 6. storyboard dello scroll

### 6.1 preloader

- schermo nero; al centro il volto si disegna tratto dopo tratto in proporzione al caricamento reale, con gli occhi chiusi
- in basso a destra un contatore `000 → 100` (cifre tabellari, peso 200)
- avanzamento reale: font (`document.fonts.ready`), `volto.glb`, immagini dell'header, codice di three; durata minima 1,6s, massima 6s (poi si prosegue comunque)
- a 100: battito di palpebre e passaggio da `dorme` a `naturale` ("il sito si sveglia"); il contatore esce; il volto vola nella sua posizione nell'header (stesso elemento o Flip); le lettere del nome salgono una a una
- scroll bloccato durante il preloader; se ricarico nella stessa sessione, versione breve (≈ 0,8s)

### 6.2 header: "dal segno al volume"

Sezione bloccata (pin) per 400vh su desktop e 300vh su mobile, guidata da un'unica timeline GSAP con etichette. Racconta le mie quattro discipline attraverso il volto.

**Stato iniziale**: solo il volto al centro (≈ 26vmin) e il mio nome come `h1`. Proposta di composizione: "alessandro" in alto a sinistra, "bottone" in basso a destra, il volto tra i due (su mobile: nome sopra, volto, cognome sotto). Nessun altro testo. L'invito a scorrere è senza parole: il volto ogni tanto guarda in basso e una sottile linea verticale pulsa in fondo allo schermo.

| scroll | fase | cosa succede | etichetta |
|---|---|---|---|
| 0–25% | illustrazione | il nome esce (lettere verso l'alto); i tratti del volto diventano "a mano libera" (feTurbulence + feDisplacementMap che cresce); compaiono linee di costruzione a matita disegnate con DrawSVG, come una pagina di sketchbook | `01 illustrazione` |
| 25–50% | branding | il tremolio si azzera e il segno torna netto; gli schizzi diventano una griglia di costruzione rigorosa (cerchi guida, quote grafiche senza numeri, area di rispetto); compaiono i tre campioni della palette (tre cerchi pieni, senza testo) e il nome torna composto accanto al volto come logotipo: una pagina di manuale d'identità | `02 branding` |
| 50–75% | 3d | la griglia svanisce; il volto SVG si dissolve nel modello 3D perfettamente sovrapposto (vista frontale), poi la camera ruota di ≈ 35° e una luce scorre sulla superficie rivelando il volume; il modello si inclina verso il cursore | `03 3d` |
| 75–100% | web design | la camera arretra; attorno al modello si disegna il wireframe di una finestra del browser (barra, griglia a colonne, un pulsante, un puntatore che clicca); alla fine la finestra si restringe fino alla misura di una card | `04 web design` |

- l'etichetta sta in basso a sinistra, piccola, e cambia con un testo che rotola; in basso a destra quattro trattini si riempiono con l'avanzamento
- le etichette sono l'unico testo oltre al nome e compaiono solo durante le fasi
- tornando indietro, tutto si riavvolge perfettamente

**Note tecniche**
- un solo `<Canvas>` fisso a tutto schermo dietro l'header, in pausa (`frameloop` su `demand` o `never`) quando l'header non è visibile
- per far coincidere SVG e 3D: camera prospettica con campo visivo stretto (≈ 15–20°) in vista frontale e scala calcolata dal viewport di `useThree`, così la sagoma del modello ha la stessa misura in pixel dell'SVG
- materiale del modello: bianco opaco (`MeshStandardMaterial`, roughness ≈ 0,55); luci con `Environment` + `Lightformer` di drei, senza HDRI scaricate da internet
- mobile: DPR massimo 1,5, niente ombre, modello compresso

### 6.3 passaggio header → portfolio

La finestra della fase "web design" diventa la card frontale dell'anello: il volto 3D si dissolve dentro la finestra mentre compare la copertina del primo progetto, poi le altre card si dispongono attorno formando l'anello. Nessuno stacco netto.

### 6.4 portfolio: l'anello

Ispirato agli anelli di k95 e alle lenti rotonde del volto.

**Desktop e tablet (≥ 768px)**
- le card stanno su un anello 3D fatto in CSS (`perspective` ≈ 1400px; ogni card `rotateY(i·360°/n) translateZ(r)`, con `r` calcolato da numero e larghezza delle card), così restano elementi DOM accessibili
- sezione bloccata; lo scroll fa ruotare l'anello (lunghezza ≈ n × 50vh, regolabile); a fine scroll si aggancia alla card più vicina
- la card frontale è a colori; le altre sono in scala di grigi e si scuriscono in base all'angolo; quelle di spalle sono nascoste
- sotto l'anello: contatore `03 / 10`, titolo, discipline e anno della card frontale, che cambiano con testo che rotola
- hover sulla card frontale: inclinazione 3D che segue il cursore (± 6°), copertina che si ingrandisce appena, cursore "apri"
- tenendo premuto sull'anello gira veloce; al rilascio si aggancia (come "hold to skim" di pxpush)
- le card si inclinano leggermente in base alla velocità dello scroll
- tastiera: frecce ← → per ruotare, Invio per aprire
- funziona con qualsiasi numero di progetti: raggio e lunghezza si ricalcolano da soli

**Mobile (< 768px)**
- niente anello: card impilate; ogni card si ferma in alto (sticky) e la successiva ci scorre sopra, mentre quella sotto si rimpicciolisce e si scurisce
- la card al centro dello schermo è a colori, le altre in grigio; tap per aprire

**Card**: copertina 4:5, titolo, discipline, anno. Raggio 16px, bordo grigio.

### 6.5 il pannello del progetto

- si apre sopra la pagina con indirizzo `/progetti/<slug>` (rotta modale di React Router con "background location"): la home resta montata sotto, quindi chiudendo torno esattamente dove ero
- apertura: la copertina si espande dalla posizione della card fino alla testata del pannello (clone assoluto animato da rettangolo a rettangolo; non usare `layoutId` attraverso il contenitore trasformato in 3D); la pagina sotto si scurisce e arretra leggermente (scala 0,96)
- desktop: pannello quasi a tutto schermo con un margine attorno; mobile: foglio a schermo intero che sale dal basso
- chiusura: pulsante "chiudi" con icona X, Esc, clic fuori, tasto indietro del browser, trascinamento verso il basso su mobile
- mentre è aperto: `lenis.stop()` e scroll interno nativo con `data-lenis-prevent`; alla chiusura `lenis.start()`
- basato sul Dialog di shadcn (Radix): focus intrappolato, `aria-modal`, focus restituito alla card alla chiusura
- link diretto a `/progetti/<slug>`: dopo il preloader la home si posiziona sul portfolio e il pannello si apre; slug inesistente → home
- struttura: titolo → breve descrizione → riga meta (discipline · anno · cliente) → blocchi nell'ordine del file → in fondo l'anteprima del progetto successivo, che si apre al clic

**Blocchi** (caricati solo all'apertura del pannello, con `React.lazy`)

| tipo | uso | comportamento |
|---|---|---|
| `pdf` | branding, manuali | sfogliabile come un libro: `react-pdf` disegna le pagine (worker di pdf.js configurato per Vite), `react-pageflip` gira le pagine; doppia pagina su desktop, singola con swipe su mobile; frecce, contatore "3 / 24", schermo intero; pagine caricate man mano; cursore "sfoglia" |
| `modello3d` | progetti 3d | `<Canvas>` dedicato montato solo quando visibile; `useGLTF`, `OrbitControls` con inerzia, rotazione automatica finché non lo tocco, zoom limitato, niente spostamento laterale; luci con `Lightformer`; ombra di contatto leggera; barra di caricamento; pulsante per ripristinare la vista; cursore "ruota" |
| `video` | animazioni, reel | file mp4 (H.264) con poster e controlli personalizzati (play/pausa, barra, audio, schermo intero) oppure link Vimeo/YouTube (youtube-nocookie) caricato solo al clic; opzione `autoplay` (muto e in loop) per clip brevi; mai audio automatico; cursore "play"/"pausa" |
| `immagini` | tutti | una o più immagini, `layout` `"piena"` o `"griglia"`, entrano con una rivelazione a maschera |
| `testo` | processo, note | paragrafi |

### 6.6 chi sono

Solo la mia foto e questo testo, riportato esattamente, in tre paragrafi:

> sono alessandro bottone, graphic e brand designer con un percorso di 7 anni di esperienza maturata tra studio e attività sul campo. attualmente frequento il corso di design della comunicazione alla iuad per affinare ulteriormente la mia metodologia progettuale.
>
> nell’ultimo anno ho scelto di ampliare i miei orizzonti creativi esplorando attivamente l’illustrazione e nuove contaminazioni visive, integrando la precisione strategica del branding con la forza espressiva del disegno.
>
> il mio obiettivo è tradurre i valori e la visione dei clienti in sistemi d’identità solidi, maturi e dal forte impatto contemporaneo.

- nessun titolo visibile (un `h2` "chi sono" solo per gli screen reader)
- desktop: foto a sinistra (≈ 5/12), testo a destra; sezione bloccata per ≈ 150vh mentre il testo si "accende"
- mobile: foto sopra (4:5), testo sotto
- il testo si accende parola per parola con lo scroll, da grigio a bianco (SplitText + scrub); con movimento ridotto è tutto bianco da subito
- foto: la fornisco a colori e va convertita in bianco e nero **mappato sulla palette** (nero puro → `#141414`, bianco puro → `#C9C5C0`), così i bordi si fondono con lo sfondo. Conversione una tantum con lo script `foto-palette` (`sharp`), originale conservato
- entrata della foto: rivelazione con `clip-path` dal basso e leggero zoom indietro (1,15 → 1)
- firma: quando la foto è entrata, i tratti del volto si disegnano sopra il mio viso (gli occhiali sui miei occhi), restano un istante e si cancellano; riappaiono al passaggio del mouse. Posizione e scala in `src/config/foto.ts`, con un'opzione per disattivare l'effetto

### 6.7 contatti

Solo il volto e tre pulsanti. Niente titoli, niente footer: la pagina finisce qui.

- all'entrata il volto (SVG, ≈ 36vmin) si disegna e si sveglia; segue il cursore e, al passaggio su un pulsante, lo guarda
- tre pulsanti (in riga su desktop, in colonna a tutta larghezza su mobile, altezza minima 56px):
  - `instagram` → https://www.instagram.com/ale.bottone.designer/ (nuova scheda)
  - `behance` → https://www.behance.net/alessanbottone1 (nuova scheda)
  - `email` → copia `alessandrobottone2005@gmail.com` negli appunti con un clic
- stile: pillola con bordo grigio; al passaggio del mouse un riempimento bianco entra dal lato da cui arriva il cursore, il testo diventa nero e rotola, il pulsante è attratto dal cursore (massimo 12px); freccia ↗ per i link esterni
- email copiata: l'etichetta diventa "copiata" con icona di spunta per 2s, il volto fa l'occhiolino e sorride, annuncio `aria-live` "indirizzo email copiato"; soluzione di riserva se l'API degli appunti non è disponibile; al passaggio del mouse un piccolo tooltip mostra l'indirizzo
- icone: Instagram e Behance da `simple-icons` (Lucide non ha Behance), ricolorate con la palette; il resto da Lucide

---

## 7. cursore personalizzato

Solo su dispositivi con mouse (`(hover: hover) and (pointer: fine)`); su touch non esiste.

- base: punto bianco da 10px con leggera inerzia (`gsap.quickTo`)
- link e pulsanti: diventa un anello da 44px
- card frontale: cerchio pieno da 96px con scritto "apri" in nero (una lente)
- aree con significato: `sfoglia` (pdf), `ruota` (3d), `play`/`pausa` (video), `chiudi` (fuori dal pannello), `tieni premuto` (anello, solo al primo passaggio)
- pressione: si contrae a 0,8
- implementazione: attributi `data-cursore="apri"` letti da un unico componente globale
- il focus da tastiera resta sempre visibile

---

## 8. micro-interazioni (checklist)

Ogni elemento interattivo ha tre stati animati: riposo, hover/focus, premuto.

- testi di link e pulsanti che "rotolano" (le lettere salgono e vengono sostituite da una copia), come k95
- nome nell'header: le lettere vicine al cursore diventano più pesanti (asse `wght` di Outfit da 300 a ≈ 600, in base alla distanza)
- pulsanti magnetici
- card: inclinazione, passaggio al colore, reazione alla velocità dello scroll
- volto: sguardo, battiti, sonno, occhiolino, sorriso
- titolo e favicon della scheda quando esco
- entrate sfalsate per ogni gruppo di elementi
- focus da tastiera animato
- grana animata

---

## 9. progetti che si aggiungono da soli

Obiettivo: per aggiungere un progetto basta creare una cartella con i file dentro. Nessun codice da toccare.

### struttura

```
src/content/progetti/
  nome-progetto/          ← il nome della cartella diventa l'indirizzo /progetti/nome-progetto
    progetto.json
    copertina.webp
    …altri file usati nei blocchi (pdf, glb, mp4, webp)
```

### progetto.json

```json
{
  "titolo": "nome del progetto",
  "descrizione": "breve descrizione, due o tre righe al massimo.",
  "discipline": ["branding"],
  "anno": 2026,
  "cliente": "nome del cliente",
  "ordine": 1,
  "pubblicato": true,
  "copertina": "copertina.webp",
  "blocchi": [
    { "tipo": "pdf", "file": "manuale.pdf" },
    { "tipo": "immagini", "file": ["01.webp", "02.webp"], "layout": "griglia" },
    { "tipo": "modello3d", "file": "modello.glb" },
    { "tipo": "video", "file": "reel.mp4", "poster": "poster.webp", "autoplay": false },
    { "tipo": "video", "url": "https://vimeo.com/000000000" },
    { "tipo": "testo", "testo": "paragrafo sul processo." }
  ]
}
```

- `discipline`: uno o più tra `branding`, `illustrazione`, `3d`, `web design`
- `ordine` (facoltativo): numero più basso = prima; senza ordine, i progetti più recenti per `anno` vengono prima
- `pubblicato: false` nasconde il progetto senza cancellarlo
- `cliente` è facoltativo
- i blocchi sono tutti facoltativi e si possono ripetere e combinare

### come funziona nel codice

- `src/lib/progetti.ts` legge tutte le cartelle con `import.meta.glob` (i json, e i file come URL con `?url`), valida con uno schema `zod`, trasforma i nomi dei file in URL, filtra e ordina
- se manca un file o un campo, la build si ferma con un messaggio chiaro in italiano, per esempio `progetto "nome-progetto": manca il file "manuale.pdf"`
- aggiungi `glb`/`gltf` agli `assetsInclude` di Vite se serve

### script

- `npm run nuovo-progetto`: mi fa qualche domanda nel terminale (titolo, discipline, anno, cliente) e crea la cartella con un `progetto.json` di partenza
- `npm run prepara-progetti`: controlla tutti i progetti e ottimizza i file (immagini → webp, lato massimo 2400px, più una versione piccola per la card; `.glb` compressi con `gltf-transform`; avvisi se un pdf supera 15MB o un video 25MB)
- `npm run build` esegue sempre la validazione

### pubblicazione automatica

Repository GitHub collegato a Vercel: ogni push sul ramo principale pubblica il sito da solo. Serve un `vercel.json` che rimandi tutte le rotte a `index.html`, altrimenti `/progetti/<slug>` non funziona dopo un refresh.

### quando ti chiedo "aggiungi un progetto"

1. chiedimi ciò che manca (titolo, descrizione, discipline, anno, cliente, file)
2. crea la cartella e copia i file
3. lancia `npm run prepara-progetti`
4. scrivi `progetto.json`
5. lancia `npm run build` e mostrami il risultato in locale
6. proponimi il commit "aggiunto progetto: <titolo>" e chiedimi prima di fare push

All'inizio crea 10 progetti segnaposto (copertine grigie numerate, testi provvisori) che sostituirò con quelli veri.

---

## 10. responsive

- breakpoint: mobile < 768px, tablet 768–1023px, desktop ≥ 1024px
- unità `svh`/`dvh` al posto di `100vh`; margini laterali minimi di 16px su mobile; rispetta le safe area di iOS
- su touch ogni effetto hover ha un equivalente (quando l'elemento è in vista o al tocco)
- Lenis solo per rotella e trackpad; su touch scroll nativo (`syncTouch: false`)
- prova su Safari iOS e Chrome Android reali, oltre che negli strumenti del browser

---

## 11. prestazioni

- obiettivo: 60fps su un portatile medio, nessuno scatto evidente su un telefono di fascia media di tre anni fa
- codice diviso in parti caricate quando servono: three/R3F (precaricato durante il preloader), pannello e blocchi (pdf, pageflip, visualizzatore 3D)
- `volto.glb` sotto 1MB; immagini webp/avif con `srcset`; `loading="lazy"` fuori dall'header
- canvas in pausa quando non sono visibili; DPR limitato
- `will-change` solo durante le animazioni
- verifica con Lighthouse (mobile) e con il pannello Performance di Chrome, e riportami i numeri

---

## 12. accessibilità

- `prefers-reduced-motion`: niente pin né scrub, niente Lenis, niente grana animata; solo dissolvenze brevi (≤ 200ms); l'anello diventa una griglia a due colonne; il volto non sbatte le palpebre; cursore normale del sistema
- struttura: `main` con quattro `section` etichettate; `h1` = nome; un `h2` nascosto per ogni sezione
- tutto usabile da tastiera, focus sempre visibile
- pannello: `role="dialog"`, `aria-modal`, focus intrappolato e restituito
- il volto decorativo ha `aria-hidden`; nell'header `role="img"` con `aria-label="logo di alessandro bottone"`
- testi alternativi descrittivi e in minuscolo
- aree toccabili di almeno 48px

---

## 13. struttura delle cartelle

```
.
├─ CLAUDE.md
├─ vercel.json
├─ docs/
│  └─ come-aggiungere-un-progetto.md
├─ sorgenti/            (logo originale: Logo.svg, Logo.glb — non pubblicati)
├─ scripts/
│  ├─ nuovo-progetto.mjs
│  ├─ prepara-progetti.mjs
│  ├─ valida-progetti.ts
│  ├─ foto-palette.mjs
│  ├─ genera-favicon.mjs
│  └─ genera-og.mjs
├─ public/
│  ├─ volto/            (volto.glb, favicon sveglia e addormentata, apple-touch-icon)
│  ├─ og.png
│  └─ robots.txt
└─ src/
   ├─ main.tsx, App.tsx, router.tsx
   ├─ config/           (sito.ts, movimento.ts, foto.ts)
   ├─ styles/globals.css
   ├─ lib/              (progetti.ts, schema.ts, dati.ts, gsap.ts, scroll.ts, caricamento.ts, appunti.ts, utils.ts)
   ├─ types/            (page-flip.d.ts)
   ├─ components/
   │  ├─ volto/         (Volto.tsx, VoltoContext.tsx, Volto3D.tsx, geometria.ts, sguardo.ts, tre.ts)
   │  ├─ cursore/       (Cursore.tsx)
   │  ├─ preloader/     (Preloader.tsx, AvvioContext.tsx)
   │  ├─ testo/         (TestoCheRotola.tsx, RotolaAlPassaggio.tsx, NomePesoVariabile.tsx)
   │  ├─ effetti/       (Grana.tsx)
   │  ├─ interazioni/   (Magnetico.tsx)
   │  └─ ui/            (componenti shadcn: dialog, button)
   ├─ sections/
   │  ├─ Header/        (Header.tsx, Tavola.tsx, misure.ts)
   │  ├─ Portfolio/     (Portfolio.tsx, Anello.tsx, Pila.tsx, Griglia.tsx, Copertina.tsx, carta.ts)
   │  ├─ ChiSono/
   │  └─ Contatti/
   ├─ pannello/         (Pannello.tsx, Blocchi.tsx, transizioni.ts)
   │  └─ blocchi/       (Pdf.tsx, Modello3D.tsx, Video.tsx, Immagini.tsx, Testo.tsx)
   ├─ laboratorio/      (Laboratorio.tsx, solo in sviluppo)
   ├─ assets/foto/      (originale e versione palette)
   └─ content/progetti/<slug>/
```

`src/config/sito.ts` contiene link, email e testo del chi sono: un'unica fonte per tutti i testi fissi.

---

## 14. piano di lavoro

Fermati alla fine di ogni fase e aspetta il mio ok.

- **fase 0 — ambiente**: verifica Node LTS, Git, Python 3 (serve a UI/UX Pro Max), la skill UI/UX Pro Max e il 21st MCP. Se manca qualcosa, dimmelo e indicami i comandi della sezione 17.
- **fase 1 — fondamenta**: progetto Vite React TS, Tailwind v4, shadcn con i token, Outfit, regola delle minuscole, Lenis + GSAP sincronizzati, router con rotta modale, caricamento dei progetti con schema e 10 segnaposto, script, `vercel.json`. Risultato: pagina nera che scorre, con le sezioni vuote.
- **fase 2 — volto e cursore**: `<Volto />` con tutti gli stati e i comportamenti, cursore personalizzato, più una pagina `/laboratorio` (solo in sviluppo) per provare stati e animazioni.
- **fase 3 — preloader e header**: le quattro fasi, il 3D e il passaggio al portfolio.
- **fase 4 — portfolio e pannello**: anello, pila su mobile, pannello e i cinque tipi di blocco.
- **fase 5 — chi sono e contatti**, con la conversione della foto.
- **fase 6 — rifinitura**: passata completa di micro-interazioni, responsive, movimento ridotto, prestazioni e accessibilità; revisione con UI/UX Pro Max.
- **fase 7 — pubblicazione**: GitHub + Vercel insieme a me; favicon, `og.png` (volto e nome su nero), meta description in minuscolo; guida `docs/come-aggiungere-un-progetto.md` scritta in modo semplice.

---

## 15. checklist finale

- [ ] nessuna maiuscola visibile in tutto il sito
- [ ] solo i tre colori nell'interfaccia; sfondo sempre nero
- [ ] solo Outfit
- [ ] niente navbar, niente footer, nessun testo extra
- [ ] scroll fluido avanti e indietro; le fasi dell'header si riavvolgono
- [ ] aprendo e chiudendo un progetto 10 volte torno sempre allo stesso punto
- [ ] il link diretto a un progetto funziona, anche dopo un refresh su Vercel
- [ ] aggiungendo una cartella, il progetto compare nel sito senza toccare codice
- [ ] pdf sfogliabile, 3D ruotabile e video funzionanti su desktop e mobile
- [ ] l'email si copia con feedback visivo e annuncio per screen reader
- [ ] tutto funziona con movimento ridotto e da tastiera
- [ ] 60fps su desktop, nessuno scatto evidente su mobile
- [ ] provato su Safari iOS e Chrome Android

---

## 16. materiali che fornirò

- `riferimento.png`: il logo attuale (già pronto)
- `volto.svg`: tratti non espansi, parti separate e nominate
- `volto.glb`: parti separate, vista frontale allineata all'SVG
- la mia foto a colori ad alta risoluzione
- per ogni progetto: titolo, breve descrizione, discipline, anno, cliente (se c'è), copertina e file dei blocchi

---

## 17. installazione degli strumenti (la faccio io)

- Node.js LTS (nodejs.org), Git, Python 3 (python.org)
- UI/UX Pro Max, dentro Claude Code:
  ```
  /plugin marketplace add nextlevelbuilder/ui-ux-pro-max-skill
  /plugin install ui-ux-pro-max@ui-ux-pro-max-skill
  ```
- 21st MCP: chiave gratuita su 21st.dev/mcp, poi nel terminale:
  ```
  npx @21st-dev/cli@latest init --client claude
  ```
  La chiave non va mai scritta nel codice né caricata su GitHub (`.env` sempre in `.gitignore`).

---

## decisioni prese

- 2026-09-26 — versioni: vite 8, react 19, react router 8 (modalità libreria con `BrowserRouter`), tailwind 4.3, gsap 3.15, motion 13, lenis 1.3, typescript 6 (strict).
- 2026-09-26 — shadcn inizializzato con base radix e preset "nova"; ha portato le sue dipendenze (`radix-ui`, `class-variance-authority`, `cn`, `tw-animate-css`, `shadcn`). Il font geist del preset è stato rimosso.
- 2026-09-26 — rotta modale: la home resta sempre montata; il pannello è una rotta separata che legge `state.sfondo` per decidere se chiudere tornando indietro (aperto dal sito) o andando a `/` (link diretto).
- 2026-09-26 — validazione progetti condivisa tra sito, script e build (`src/lib/schema.ts` + `scripts/valida-progetti.ts`); i progetti con `pubblicato: false` possono essere incompleti.
- 2026-09-26 — `prepara-progetti` sposta gli originali in `<progetto>/_originali/` (non finiscono nel sito) e crea `<copertina>-card.webp` (900px) per le card; i `.glb` sono compressi con meshopt.
- 2026-09-26 — in sviluppo le sezioni vuote mostrano un’etichetta grigia "provvisorio · …", che sparisce da sola nel sito pubblicato.
- 2026-09-26 — il logo fornito (`public/volto/Logo.svg`) ha forme espanse: il volto è stato ricostruito a tratti in `src/components/volto/geometria.ts`, misurando le forme originali (coincide quasi del tutto; semplificate solo le piccole tacche in basso sulle lenti). La pupilla è un anello ellittico ritagliato sotto la palpebra; la palpebra è un arco con "apertura" da 0 (chiusa, arco verso il basso) a 1 (sveglio). Lo stato "sveglio" è volutamente contenuto: aprendo di più la palpebra si scontra con la lente.
- 2026-09-26 — le favicon (sveglia e addormentata) si generano dalla stessa geometria con `npm run genera-favicon`.
- 2026-09-26 — con movimento ridotto il volto non sbatte le palpebre e le pupille restano ferme; i cambi di stato sono istantanei.
- 2026-09-26 — modello 3d: il file fornito (`public/Logo.glb`, una sola mesh unita, ruotata di ≈ 2°) è compresso con meshopt in `public/volto/volto.glb` (92 kB); il codice lo raddrizza e lo allinea in pixel al volto svg leggendone la posizione a ogni fotogramma.
- 2026-09-26 — header: timeline in unità 0–100 (etichette illustrazione 0, branding 25, 3d 50, web design 75). Nella fase branding il volto si sposta per far posto al logotipo (a destra su desktop, sotto su mobile). La finestra del browser si restringe a una card 4:5 larga ≈ 224/247 del volto, con la copertina del primo progetto: nella fase 4 l’anello partirà da questa misura.
- 2026-09-26 — preloader: contatore grande (peso 200) in basso a destra; il volto del preloader è un po’ più grande (30vmin) e si rimpicciolisce volando su quello dell’header (26vmin, minimo 11rem su mobile).
- 2026-09-26 — fasi 4 e 5 svolte da un team di agenti in autonomia (su richiesta di alessandro), senza commit né push.
- 2026-09-26 — portfolio: la sezione si sovrappone all’ultima schermata dell’header (margine `-100svh`) e resta invisibile finché lo scroll non ci arriva, così la card finale dell’header diventa la card frontale; misura della card derivata da `CARTA` e `volto.header` (`src/sections/Portfolio/comune.tsx`).
- 2026-09-26 — anello: sulla card solo la copertina; titolo, discipline e anno sotto l’anello (e nel testo del link). Scroll in tre tratti: disposizione 70vh, 50vh per progetto, coda 30vh (`movimento.portfolio`). Aggancio e “tieni premuto” gestiti via lenis; “tieni premuto” solo con mouse e penna. Un clic su una card laterale la porta davanti invece di aprirla.
- 2026-09-26 — grigio → colore delle card con due immagini sovrapposte e un velo nero, animando solo l’opacità.
- 2026-09-26 — mobile: pila di card sticky al centro; la prima cresce dalla misura della card dell’header.
- 2026-09-26 — pannello: pdf sfogliabile con `page-flip` (react-pageflip non supporta react 19) in un wrapper nostro, react-pdf disegna le pagine ±3 da quella aperta, senza strato di testo. Dipendenze aggiunte: `react-pdf`, `page-flip`.
- 2026-09-26 — pannello: la pagina sotto arretra con transform su `main` (compensato se al centro c’è una sezione bloccata); la copertina vola con un clone animato solo con transform e clip-path; il focus torna alla card dell’ultimo progetto visto.
- 2026-09-26 — pannello: il canvas 3d nasce la prima volta che il blocco è in vista, poi resta in pausa fuori vista; video da link caricati solo al clic, autoplay muto e in loop solo in vista; su mobile il foglio si chiude trascinando in giù (≥120px o gesto rapido).
- 2026-09-26 — `optimizeDeps.include` in `vite.config.ts` per react-pdf, page-flip e r3f/drei (evita doppie copie di react in sviluppo).
- 2026-09-26 — `src/content/progetti/prova-blocchi/` è un progetto di prova con tutti i tipi di blocco: va eliminato prima della pubblicazione.
- 2026-09-26 — chi sono: parole “spente” = bianco al 31,5% di opacità (= #4d4b4a sul nero), si anima solo l’opacità; testo desktop `clamp(1.125rem, min(2.6vw, 3.5svh), 2.5rem)` per stare tutto nello schermo; pin e griglia foto/testo da 768px.
- 2026-09-26 — foto: in attesa di quella vera c’è `src/assets/foto/foto-provvisoria*`; per sostituirla: foto in `src/assets/foto/`, `npm run foto-palette -- <file>`, cambiare l’import in `ChiSono.tsx`, regolare `src/config/foto.ts` (x/y = punto a metà tra le lenti). Lo script converte pixel per pixel (sharp `.linear()` non funzionava).
- 2026-09-26 — contatti: il testo nero dei pulsanti è una seconda copia ritagliata dal riempimento bianco (cerchio con clip-path dal punto d’ingresso del cursore); tooltip dell’email fatto con motion; se la copia fallisce si apre `mailto:`; su touch i pulsanti rotolano all’entrata in vista.
- 2026-09-26 — `RotolaAlPassaggio` e `Magnetico` sono i componenti da riusare per link e pulsanti in tutto il sito.
- 2026-09-26 — correzioni alla fase 3: lo scroll ora si sblocca a fine preloader (prima restava `overflow: hidden`), lenis nasce già fermo durante il preloader, lettere del nome con `y: 0` esplicito; con un link diretto la home scorre fino ad anello già formato.
- 2026-09-26 — fase 6 (rifinitura) svolta da un agente: lighthouse mobile prestazioni 73→81, accessibilità 92→96, buone pratiche 100, seo 83→100; bundle principale 250→210 kB gzip.
- 2026-09-26 — 3d: drei non si importa più intero; luci da studio e caricamento `.glb` (meshopt) in `src/components/volto/tre.ts` con three puro, condivisi tra header e blocco 3d; da drei solo `OrbitControls` e `ContactShadows`.
- 2026-09-26 — zod non si scarica nel sito: i progetti sono validati in build e nel terminale; nel sito solo i valori predefiniti (`src/lib/dati.ts`). `build.assetsInlineLimit: 0`. Plugin Flip rimosso (non usato).
- 2026-09-26 — `foto-palette` crea anche `<nome>-palette-900.webp`; la foto del chi sono usa `srcset` (900/1600).
- 2026-09-26 — cursore: ricalcola la forma a ogni cambio di indirizzo, di focus e negli scroll interni.
- 2026-09-26 — micro-interazioni: pulsanti di pannello e blocchi con `Magnetico` (4–6px per i controlli ravvicinati) e `RotolaAlPassaggio`; stati premuto con `active:scale`; focus da tastiera che entra in 0,3s.
- 2026-09-26 — movimento ridotto: regola css globale che annulla transizioni e animazioni css tranne le dissolvenze (0,2s).
- 2026-09-26 — nome nell’header limitato anche dall’altezza: `clamp(3.5rem, min(15vw, 26svh), 16rem)`; il chi sono si blocca solo da 768px di larghezza e 560px di altezza.
- 2026-09-26 — il bordo della card dell’header passa da bianco a grigio con la trasparenza (bianco al 31,5% = #4d4b4a).
- 2026-09-26 — testo del chi sono: copia nascosta per gli screen reader, parole animate nascoste (aria-hidden).
- 2026-09-26 — costanti dell’header in `Header/misure.ts`; `Portfolio/comune.tsx` diviso in `carta.ts` e `Copertina.tsx`.
- 2026-09-26 — anticipate dalla fase 7: meta description in `index.html` (da `sito.descrizione`) e `public/robots.txt`.
- 2026-09-26 — fase 7 (preparazione, senza pubblicare): `public/og.png` 1200×630 generata con `npm run genera-og` (stessa composizione dell’header; richiede outfit installato sul computer); meta open graph e twitter in `index.html` (dopo la pubblicazione `og:image` va reso un indirizzo completo); guida `come-aggiungere-un-progetto.md`. Restano da fare con alessandro: git, github, vercel, dominio.
- 2026-09-26 — foto definitiva: originale `src/assets/foto/foto-mia.jpg` (900×1600, figura intera); ritaglio a mezzobusto 4:5 `foto-mia-mezzobusto.jpg` (260×325 px dell’originale, ingrandito a 960×1200) → `foto-mia-mezzobusto-palette.webp`, una sola versione senza srcset. firma in bianco (scelta di alessandro), colore regolabile in `src/config/foto.ts`; x 50 · y 22,1 · scala 21.
- 2026-09-26 — pulizia prima della pubblicazione: eliminato il progetto `prova-blocchi`; i file originali del logo (`Logo.glb`, `Logo.svg`) spostati da `public/` a `sorgenti/`, così restano conservati ma non vengono pubblicati.
- 2026-09-27 — debugging, pulizia e documentazione fatti da un team di agenti prima della pubblicazione: corretti il battito di risveglio (preloader e VoltoContext), il 3d dell’header che se fallisce lascia il volto svg (`Senza3D`), i file `._*` del disco exfat (ignorati da oxlint, git e `prepara-progetti`); eliminati tooltip shadcn e foto provvisorie; `Grana.tsx` → `components/effetti/`, `Magnetico.tsx` → `components/interazioni/`; `pdfjs-dist` dichiarato in `package.json`; documentazione in `README.md` e `docs/`.
- 2026-09-27 — pubblicazione: repository github `alessandrobottone2005-crypto/ProvaLandingPagePortfolio_Claude` (ramo `main`), progetto vercel `provalandingpageportfolio-claude`; nel repository anche `CLAUDE.md`, `sorgenti/` e la foto originale; esclusi `.mcp.json`, `.claude/settings.local.json`, `.vercel`. prima versione online con i 10 segnaposto.
