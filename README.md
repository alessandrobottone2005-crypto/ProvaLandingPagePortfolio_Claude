# portfolio di alessandro bottone

Portfolio one-page in italiano, raccontato dallo scroll. Il volto parte come segno e diventa un logo metallico 3d animato nell’ambiente della scena Blender V2.

**preloader → header → portfolio → chi sono → contatti**

- Header con quattro discipline; il nome grande si raccoglie in alto a destra e resta cliccabile per tornare all’inizio.
- Portfolio dentro un computer retrò appoggiato a terra in una sala di cemento realistica (luce cotta in Blender, pavimento bagnato che riflette, polvere nel fascio di sole): la camera scende fino allo schermo, il computer si accende e si usa. L’interfaccia riprende il Finder del Macintosh 1984 (bianco e nero, ChicagoFLF): quattro cartelle per disciplina, un documento per progetto, finestre con copertina a colori, informazioni e blocchi. Il volto metallico sta dietro il monitor, gioca a nascondino e reagisce a cartelle e progetti.
- Biografia invariata, rivelata parola per parola; a sinistra il logo si trasforma in un avatar a punti che segue il cursore; contatti con logo grande, Instagram, Behance, email e copyright.

La stessa esperienza 3d è presente su mobile. Su telefono l’interfaccia occupa tutta la vista. Con movimento ridotto: SVG statici, scroll nativo e computer già acceso in una scena ferma. In caso di errore WebGL restano il volto SVG e l’interfaccia del computer. I venti progetti attuali sono segnaposto.

## avvio

Serve Node.js compatibile con Vite 8; la pubblicazione usa Node 24. Dal terminale nella cartella del progetto:

```sh
npm ci
npm run dev
```

Apri [localhost:5173](http://localhost:5173). Per fermare il server: `ctrl + c`. `npm ci` installa le versioni del lockfile; dopo modifiche intenzionali alle dipendenze usare `npm install` e aggiornare anche `package-lock.json`.

In sviluppo [laboratorio](http://localhost:5173/laboratorio) permette di provare volto e cursore; non è incluso nella build pubblicata.

## comandi

| comando | risultato |
|---|---|
| `npm run dev` | server locale, aggiornamento automatico e controllo dei progetti |
| `npm run build` | controllo TypeScript, validazione dei progetti e sito pronto in `dist/` |
| `npm run preview` | anteprima locale della build, normalmente su porta 4173 |
| `npm run lint` | controllo del codice con Oxlint |
| `npm run nuovo-progetto` | crea una cartella e un JSON iniziale non pubblicato |
| `npm run prepara-progetti` | ottimizza immagini/copertine/GLB e controlla i file dei progetti |
| `npm run prepara-computer` | rigenera `public/computer/computer.glb` dall’originale in `sorgenti/computer/` |
| `npm run prepara-sala` | rigenera `public/sala/` dall’esportazione Blender in `sorgenti/sala/export/` |
| `npm run genera-favicon` | rigenera favicon sveglia, addormentata e icona iOS |
| `npm run genera-og` | rigenera l’immagine social; richiede Outfit TTF installato sul computer |
| `npm run prepara-avatar` | dal video a punti in `sorgenti/foto/flow/` crea l’atlante dell’avatar in `public/avatar/` (serve ffmpeg) |
| `npm run foto-palette -- <file>` | helper opzionale per convertire una foto nella palette |

## dove modificare

| contenuto | file |
|---|---|
| testi, biografia, contatti, email, copyright, menu del computer, crediti ed etichette | `src/config/sito.ts` |
| tempi, scroll, avvicinamento e sosta del computer | `src/config/movimento.ts` |
| ancoraggi e percorso continuo del logo, volto dietro il monitor e lati del nascondino | `src/components/volto/percorso.ts` |
| nascondino del volto nella sosta | `useNascondino` in `src/sections/Portfolio/Portfolio.tsx` (tempi in `movimento.computer.sbircia`) |
| modello, espressioni e composizione della scena | `src/components/volto/Volto3D.tsx` |
| percorso della camera e posizione del computer | `src/components/computer/inquadratura.ts` |
| interfaccia del computer | `src/components/computer/` |
| sala, fari, effetti e computer 3d | `src/components/volto/Sala.tsx`, `LuciTeatro.tsx`, `Rifinitura.tsx`, `NebbiaVolumetrica.tsx`, `ComputerNellaScena.tsx` |
| progetti | `src/content/progetti/<slug>/`; [guida pratica](docs/come-aggiungere-un-progetto.md) |
| meta e indirizzi social del sito | `index.html` |

Scrivere i testi in minuscolo con apostrofi tipografici (’). Gli originali creativi si conservano in `sorgenti/`; soltanto le versioni runtime necessarie stanno in `public/`.

## pubblicazione

Repository: [ProvaLandingPagePortfolio_Claude](https://github.com/alessandrobottone2005-crypto/ProvaLandingPagePortfolio_Claude). Progetto Vercel: `provalandingpageportfolio-claude`, ambiente Node 24/Vite. Dominio: [provalandingpageportfolio-claude.vercel.app](https://provalandingpageportfolio-claude.vercel.app).

Dal 1 ottobre 2026 il lavoro sta su `main` (dove è stato fuso `prova/computer-retro`); `codex/manutenzione-portfolio-3d` è il branch storico del 29 settembre. Lo stato del deploy, la versione e i controlli online si trovano in [pubblicazione](docs/pubblicazione.md). I crediti del computer e della sala sono ancora segnaposto: pubblicati così per scelta di alessandro, da completare in `src/config/sito.ts`. Il push di un branch e il deploy in produzione sono operazioni distinte. La configurazione mantiene il refresh delle rotte `/progetti/<slug>`.

## documentazione

| guida | contenuto |
|---|---|
| [come aggiungere un progetto](docs/come-aggiungere-un-progetto.md) | authoring, file e controlli |
| [architettura](docs/architettura.md) | responsabilità, cartelle, avvio, scroll e rotte |
| [volto](docs/volto.md) | SVG, modello V2, espressioni e cache |
| [ambiente 3d](docs/ambiente-3d.md) | sala di cemento, luce cotta, riflessi, post-produzione ed esportazione |
| [animazioni](docs/animazioni.md) | comportamento e parametri delle sezioni |
| [progetti](docs/progetti.md) | schema JSON, caricamento e script |
| [computer](docs/computer.md) | discesa, interfaccia finder 1984, finestre, cinque tipi di blocco e crediti |
| [accessibilità e prestazioni](docs/accessibilita-prestazioni.md) | tastiera, movimento ridotto, fallback e limiti delle misure |
| [pubblicazione](docs/pubblicazione.md) | GitHub, Vercel, asset pubblici e verifiche |
| [sorgenti Blender](sorgenti/logo-3d/README.md) | scene, controlli, rigenerazione e licenze |
| [sorgenti del computer](sorgenti/computer/README.md) | modello, rigenerazione e licenza da completare |
| [sorgenti della sala](sorgenti/sala/README.md) | scena Blender, cottura, rigenerazione e licenza da completare |
| [CLAUDE.md](CLAUDE.md) | brief operativo e storico delle decisioni |
