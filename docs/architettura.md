# architettura

come è costruito il sito, in breve. per i dettagli di ogni parte vedi gli altri file in `docs/`.

## le librerie e il loro ruolo

| libreria | a cosa serve qui |
|---|---|
| react 19 + typescript (strict) + vite 8 | base del progetto; `vite.config.ts` |
| tailwind css v4 (`@tailwindcss/vite`) | stile, con i token di `src/styles/globals.css` (tre colori, outfit, scala tipografica) |
| shadcn/ui (radix) | base del pannello: `src/components/ui/dialog.tsx` (dialog di radix) |
| gsap + scrolltrigger, splittext, drawsvg, morphsvg, `@gsap/react` | tutto ciò che dipende dallo scroll (pin, scrub), disegno e morph del volto, testo del chi sono spezzato in parole |
| motion (`motion/react`) | stati e micro-interazioni: hover, magnetismo, testi che rotolano, cursore, riempimento dei pulsanti, rivelazione delle immagini |
| lenis | scroll fluido con rotella e trackpad (una sola istanza) |
| three + react three fiber | volto 3d dell’header e blocco `modello3d`; da drei solo `OrbitControls` e `ContactShadows` |
| react router 8 (modalità libreria, `BrowserRouter`) | `/` e `/progetti/:slug` come rotta modale |
| lucide-react | icone dell’interfaccia (tratto 1.5) |
| simple-icons | icone di instagram e behance nei contatti |
| react-pdf + page-flip | blocco pdf sfogliabile (page-flip usato direttamente: `react-pageflip` non supporta react 19) |
| `@fontsource-variable/outfit` | il font outfit variabile, in locale |
| zod | controllo di `progetto.json`, solo in build e negli script (non si scarica nel sito) |
| sharp, `@gltf-transform/cli` | script: ottimizzazione di immagini, foto, favicon, og e modelli 3d |

## le cartelle

```
.
├─ CLAUDE.md                 brief di progetto e “decisioni prese”
├─ README.md                 punto di partenza
├─ docs/                     questa documentazione
├─ index.html                titolo, meta, favicon, anteprima social
├─ vite.config.ts            plugin: controllo progetti, precarico del font; alias @ = src
├─ vercel.json               tutte le rotte → index.html
├─ scripts/                  nuovo-progetto, prepara-progetti, foto-palette, genera-favicon, genera-og, valida-progetti
├─ sorgenti/                 file originali del logo (Logo.svg, Logo.glb): non finiscono nel sito
├─ public/
│  ├─ volto/                 volto.glb, favicon.svg, favicon-dorme.svg, apple-touch-icon.png
│  ├─ og.png
│  └─ robots.txt
└─ src/
   ├─ main.tsx, App.tsx, router.tsx
   ├─ config/                sito.ts (testi e link), movimento.ts (tempi e scroll), foto.ts (firma)
   ├─ styles/globals.css     token, regola delle minuscole, focus, grana, movimento ridotto
   ├─ lib/                   gsap.ts, scroll.ts, caricamento.ts, progetti.ts, schema.ts, dati.ts, appunti.ts, utils.ts
   ├─ components/
   │  ├─ volto/              Volto.tsx, VoltoContext.tsx, sguardo.ts, geometria.ts, Volto3D.tsx, tre.ts
   │  ├─ preloader/          Preloader.tsx, AvvioContext.tsx
   │  ├─ cursore/            Cursore.tsx
   │  ├─ testo/              TestoCheRotola.tsx, RotolaAlPassaggio.tsx, NomePesoVariabile.tsx
   │  ├─ interazioni/        Magnetico.tsx
   │  ├─ effetti/            Grana.tsx
   │  └─ ui/                 componenti shadcn (dialog, button)
   ├─ sections/
   │  ├─ Header/             Header.tsx, Tavola.tsx, misure.ts
   │  ├─ Portfolio/          Portfolio.tsx, Anello.tsx, Pila.tsx, Griglia.tsx, Copertina.tsx, carta.ts
   │  ├─ ChiSono/            ChiSono.tsx
   │  └─ Contatti/           Contatti.tsx
   ├─ pannello/              Pannello.tsx, transizioni.ts, Blocchi.tsx, blocchi/ (Pdf, Modello3D, Video, Immagini, Testo)
   ├─ laboratorio/           Laboratorio.tsx (solo in sviluppo)
   ├─ types/                 tipi per page-flip
   ├─ assets/foto/           foto originale e versione “palette”
   └─ content/progetti/      una cartella per progetto
```

## come parte il sito

1. **`src/main.tsx`** monta l’app dentro, nell’ordine: `BrowserRouter` → `VoltoProvider` (umore globale del volto) → `AvvioProvider` (stato del preloader) → `App`. importa anche `globals.css`.
2. **`src/App.tsx`**:
   - all’avvio chiama `avviaScroll()` (lenis) e `aggiornaDopoCaricamento()` (ricalcola scrolltrigger quando font e pagina sono caricati)
   - disegna `<main>` con le quattro sezioni in ordine: `Header`, `Portfolio`, `ChiSono`, `Contatti` (`aria-busy` finché il preloader non ha finito)
   - sopra: `Preloader`, `Cursore`, `Grana`
   - le rotte del pannello (`RotteModali`) si montano solo quando il sito è `pronto`
   - quando il sito è pronto rilancia `ScrollTrigger.refresh()`; se l’indirizzo è `/progetti/<slug>` (link diretto) porta la home sul portfolio, oltre la disposizione dell’anello, così l’anello è già formato
3. **`src/router.tsx`**: `/` non disegna niente in più; `/progetti/:slug` carica il pannello (con `React.lazy`); qualsiasi altro indirizzo → `/`. la home resta sempre montata sotto. vedi [pannello](pannello.md).

## preloader e caricamento

- `src/components/preloader/AvvioContext.tsx` tiene due cose: `pronto` (il preloader ha finito) e `voltoHeader`, il riferimento al contenitore del volto nell’header (la destinazione del volo).
- `src/lib/caricamento.ts` misura il caricamento reale, con dei pesi: font (`document.fonts.ready`, peso 1), codice di three (`Volto3D`, peso 3), download di `volto.glb` letto a pezzi per avere la percentuale (peso 3), copertina del primo progetto (peso 1). se qualcosa fallisce il sito parte comunque.
- `src/components/preloader/Preloader.tsx`:
  - blocca lo scroll (`fermaScroll()`) e porta la pagina in cima (tranne con un link diretto a un progetto)
  - a ogni fotogramma il contatore insegue il caricamento reale, ma non arriva a 100 prima della durata minima (1,6s) e ci arriva comunque entro la massima (6s): `movimento.preloader`
  - il volto (occhi chiusi) si disegna con la stessa percentuale
  - a 100: il volto passa a `naturale` e sbatte le palpebre, il contatore esce verso il basso, il volto vola sul volto dell’header (spostamento e scala verso `voltoHeader`)
  - alla fine: `setPronto(true)`, scroll sbloccato, preloader rimosso; l’header fa salire le lettere del nome
  - nella stessa sessione del browser (`sessionStorage`, chiave `ab-visitato`) la durata minima scende a 0,8s e il volo è più corto
  - con movimento ridotto: nessun volo, solo una dissolvenza di 0,2s

## scroll: lenis e gsap insieme

- `src/lib/gsap.ts` registra una volta sola i plugin (`ScrollTrigger`, `SplitText`, `DrawSVGPlugin`, `MorphSVGPlugin`, `useGSAP`) e imposta `ScrollTrigger.config({ ignoreMobileResize: true })`. gsap si importa sempre da qui.
- `src/lib/scroll.ts`:
  - `avviaScroll()` crea l’unica istanza di lenis (`lerp` da `movimento.lenis`, `smoothWheel: true`, `syncTouch: false`: su touch lo scroll resta nativo), collega `lenis.on('scroll', ScrollTrigger.update)`, la fa avanzare con `gsap.ticker` e imposta `gsap.ticker.lagSmoothing(0)`
  - con movimento ridotto lenis non viene creato: scroll nativo
  - `fermaScroll()` / `riprendiScroll()`: fermano e riavviano lenis e aggiungono/tolgono la classe `scroll-fermo` su `html` (`overflow: hidden`), così lo scroll è bloccato anche senza lenis. li usano il preloader e il pannello
  - `getLenis()` serve ad anello e app per gli scroll programmati (aggancio alla card, link diretto)
  - `history.scrollRestoration = 'manual'`: al refresh il browser non riposiziona la pagina da solo

## chi anima cosa

regola del brief, rispettata nel codice:

- **gsap** comanda ciò che dipende dallo scroll (pin, scrub, timeline dell’header, anello, pila, chi sono), il disegno e il morph dei tratti del volto, il preloader, le transizioni del pannello.
- **motion** comanda stati e micro-interazioni (inclinazione della card sotto il cursore, magnetismo, testi che rotolano, cursore, pulsanti dei contatti, immagini del pannello).
- mai tutti e due sulla stessa proprietà dello stesso elemento: quando un elemento è mosso da gsap, la micro-interazione sta su un elemento interno. esempi: nell’anello gsap ruota il `li`, motion inclina il `div` dentro; nel cursore gsap sposta il contenitore, motion cambia la forma dentro; `Magnetico` anima solo `x`/`y` del suo involucro.
- il volto 3d non viene toccato da gsap: gsap scrive dei numeri in un oggetto (`Controllo3D`) che la scena legge a ogni fotogramma.

## come si collegano le sezioni

- **header** (`src/sections/Header/Header.tsx`): sezione bloccata per 400vh (desktop) o 300vh (telefono). finisce con una sola card al centro dello schermo. vedi [animazioni](animazioni.md).
- **header → portfolio**: con anello e pila la sezione portfolio ha un margine `-100svh`, quindi si sovrappone all’ultima schermata dell’header. resta invisibile (opacità 0, niente clic) finché lo scroll non arriva al suo inizio; in quel momento la card frontale del portfolio ha la stessa misura e posizione della card finale dell’header, e il passaggio non si vede. le misure comuni stanno in `src/sections/Header/misure.ts` (`CARTA`) e `src/sections/Portfolio/carta.ts`.
- **portfolio**: `anello` da 768px in su, `pila` sotto i 768px, `griglia` con movimento ridotto (in quel caso niente sovrapposizione). cambiando modo le posizioni di scroll si ricalcolano.
- **chi sono**: bloccato per 150vh da 768px di larghezza e 560px di altezza; sotto, niente pin.
- **contatti**: ultima sezione, altezza minima uno schermo. la pagina finisce qui.

## /laboratorio (solo in sviluppo)

`src/laboratorio/Laboratorio.tsx` si carica solo con `npm run dev` all’indirizzo `/laboratorio` (in `App.tsx` è dietro `import.meta.env.DEV`, quindi non entra nel sito pubblicato). serve a provare: stati del volto, disegno, dimensione, sguardo verso un bersaglio, azioni (battito, occhiolino, sorriso), volto 3d sovrapposto e forme del cursore.
