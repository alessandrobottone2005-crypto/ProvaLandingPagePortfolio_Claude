# architettura

Il sito separa racconto della home, scena immersiva e pannelli progetto. Testi e parametri hanno una fonte condivisa; le pose 3d vengono aggiornate senza render React a ogni fotogramma.

## librerie e responsabilità

| tecnologia | ruolo |
|---|---|
| React 19, TypeScript strict, Vite 8 | componenti, tipi, sviluppo e build |
| Tailwind v4 | token e stile in `src/styles/globals.css` |
| GSAP, ScrollTrigger, SplitText, DrawSVG, MorphSVG | pin/scrub, testo biografico, SVG, preloader e transizioni del pannello |
| Motion | stati delle card, hover/tap, magnetismo, testi e cursore |
| Lenis | unica istanza di scroll fluido, sincronizzata con GSAP; touch nativo |
| Three.js e React Three Fiber | Canvas globale della home e visualizzatori dei progetti |
| drei | `OrbitControls` e `ContactShadows` nei modelli dei progetti |
| React Router | home sempre montata e `/progetti/:slug` come rotta modale |
| Radix/shadcn | dialog accessibile; componenti sorgente ristilizzati |
| Lucide e SVG Figma | icone UI e social |
| react-pdf, pdfjs-dist, page-flip | PDF sfogliabili |
| Outfit Variable | unico font locale |
| Zod, Sharp, glTF Transform | validazione/build e strumenti di authoring |

Zod non è nel runtime di produzione; shadcn è uno strumento di sviluppo, i componenti generati sono sorgenti locali. Le versioni esatte sono nel lockfile.

## cartelle

```text
.
├─ README.md, CLAUDE.md       guida iniziale, brief corrente e storico
├─ docs/                     documentazione
├─ scripts/                  authoring, validazione, immagini e icone
├─ sorgenti/                 originali creativi; esclusi dal sito
│  └─ logo-3d/               scene Blender, texture, export, script e anteprime
│     └─ legacy/             vecchio volto.glb conservato
├─ public/                   asset serviti senza trasformazione
│  ├─ volto/                 logo-metallo-v2.glb, favicon, icona iOS, crediti
│  ├─ og.png
│  └─ robots.txt
├─ index.html                meta, lingua, titolo e favicon
├─ vite.config.ts            controllo progetti, preload font e alias @
├─ vercel.json               fallback SPA delle rotte
├─ .vercelignore             esclusioni dal caricamento di deploy
└─ src/
   ├─ main.tsx, App.tsx, router.tsx
   ├─ config/                sito.ts e movimento.ts
   ├─ styles/                globals.css
   ├─ lib/                   scroll, GSAP, caricamento, dati/schema/progetti, appunti, useMediaQuery
   ├─ components/
   │  ├─ volto/              SVG, context, sguardo, logo V2 e ambiente 3d
   │  ├─ preloader/, cursore/, testo/, interazioni/, effetti/
   │  ├─ bottoni/, icone/     componenti Figma
   │  └─ ui/                 dialog e button di base
   ├─ sections/
   │  ├─ Header/             racconto iniziale, tavola e nome fisso
   │  ├─ Portfolio/          Spirale, Griglia, CardProgetto e copertine
   │  ├─ ChiSono/, Contatti/
   ├─ pannello/              dialog, transizioni e blocchi lazy
   ├─ laboratorio/           solo sviluppo
   ├─ assets/                icone e fotografie conservate fuori dalla home
   ├─ types/                 tipi page-flip
   └─ content/progetti/      una cartella per progetto
```

`public/` viene copiata nella build: non usarla come archivio. Foto e scene originali non importate dal codice restano sul disco/repository, non nel sito. Cache di render e backup automatici Blender non vengono caricati per il deploy.

## avvio

1. `main.tsx`: `BrowserRouter` → `VoltoProvider` → `AvvioProvider` → `App` e stile globale.
2. `App.tsx`: avvia scroll, monta le quattro sezioni, `LogoContinuo`, preloader, cursore e grana; `main` resta `aria-busy` fino a sito pronto.
3. `caricamento.ts`: misura font, codice 3d, GLB V2 condivisa e prima copertina. Un errore non impedisce la fine del preloader. Il ramo movimento ridotto evita codice e asset 3d.
4. `Preloader.tsx`: contatore e disegno, risveglio, passaggio all’header, riavvio scroll. Durate in `movimento.preloader`.
5. A sito pronto: refresh delle misure e rotte modali; con link diretto a un progetto la home raggiunge la griglia finale su tutti i dispositivi.

## scena continua

`LogoContinuo.tsx` è un host fisso, senza rimontaggi tra sezioni. Il Canvas diventa visibile insieme al logo metallico nell’header. `Volto3D.tsx` compone volto, card, camera, fari e volume.

| modulo | responsabilità |
|---|---|
| `modelloLogo.ts` | unica promessa GLB V2, Meshopt e cache condivisa |
| `percorso.ts` | pose del logo e ancoraggi DOM tra le sezioni |
| `cardImmersive.ts` | pose delle card e `fasiSpirale`, senza import Three.js nel bundle iniziale |
| `scenaImmersiva.ts` | posizione/scala del logo e posizioni dei fari |
| `CameraImmersiva.tsx` | orbita diagonale, campo lungo e ritorno frontale |
| `CardNelloSpazio.tsx` | corpi/cornici/copertine e scambio con la griglia HTML |
| `LuciTeatro.tsx` | tre fari V2 con inerzia e due tagli per le card |
| `NebbiaVolumetrica.tsx` | composizione di scena e volume con profondità |

Le timeline scrivono valori condivisi; R3F li legge nel ciclo di rendering. Gli SVG rimangono disponibili come riserva. [Ambiente 3d](ambiente-3d.md).

## scroll e layout

`lib/gsap.ts` registra i plugin. `lib/scroll.ts` crea Lenis, lo collega a ScrollTrigger e al ticker GSAP, gestisce blocco/ripresa e scroll programmati. Movimento ridotto: scroll nativo.

- Header: 400vh desktop/tablet, 300vh telefono.
- Portfolio: si sovrappone all’ultimo schermo dell’header; spirale su tutti i dispositivi, campo lungo/distensione finale da 200vh, poi griglia in flusso normale. `Spirale.tsx` conserva l’id ScrollTrigger `portfolio-anello`, letto dai moduli di posa e dalle rotte.
- Griglia: espansione singola, aggiornamento Lenis/ScrollTrigger dopo il cambiamento d’altezza, controlli non disponibili `inert`.
- Biografia: pin solo quando il testo entra nello schermo; altrimenti flusso normale. Testo sopra il volume.
- Contatti: logo fermo in posa/dimensione, espressioni vive; pulsanti e copyright sopra l’ambiente.

GSAP e Motion non animano le stesse proprietà dello stesso elemento. Per esempio GSAP muove le pose della spirale, Motion espande le informazioni nella griglia finale.

## pannello e laboratorio

`router.tsx` carica il pannello con `React.lazy`. La home resta montata; il dialog ha scroll nativo e sfondo opaco. Ogni blocco si scarica soltanto se usato. [Pannello](pannello.md).

`/laboratorio` è dietro `import.meta.env.DEV`: serve a provare stati, sguardo, azioni, volto 3d e cursore; non è pubblicato.
