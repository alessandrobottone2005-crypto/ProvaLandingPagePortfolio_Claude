# portfolio di alessandro bottone

Portfolio one-page in italiano, raccontato dallo scroll. Il volto parte come segno e diventa un logo metallico 3d animato nell’ambiente della scena Blender V2.

**preloader → header → portfolio → chi sono → contatti**

- Header con quattro discipline; il nome grande si raccoglie in alto a destra e resta cliccabile per tornare all’inizio.
- Venti card a colori in una spirale profonda: spessore, smussi, camera orbitale, fari e nebbia. Il finale mostra l’elica in campo lungo e la distende in una griglia a 3 colonne su desktop, 2 su tablet, 1 su telefono.
- Una card aperta alla volta: titolo, discipline, anno, descrizione, «esplora» e «chiudi». L’espansione sposta le righe successive; esplora apre il pannello opaco del progetto.
- Biografia invariata, rivelata parola per parola con il logo a sinistra; contatti con logo grande, Instagram, Behance, email e copyright.

La stessa esperienza 3d è presente su mobile. Con movimento ridotto: SVG statici, scroll nativo e griglia subito disponibile. In caso di errore WebGL restano il volto SVG e le card HTML di riserva. I venti progetti attuali sono segnaposto.

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
| `npm run genera-favicon` | rigenera favicon sveglia, addormentata e icona iOS |
| `npm run genera-og` | rigenera l’immagine social; richiede Outfit TTF installato sul computer |
| `npm run foto-palette -- <file>` | helper opzionale per convertire una foto nella palette; la home non usa foto |

## dove modificare

| contenuto | file |
|---|---|
| testi, biografia, contatti, email, copyright ed etichette | `src/config/sito.ts` |
| tempi, scroll, profondità/orbita della spirale e campo lungo | `src/config/movimento.ts` |
| ancoraggi e percorso continuo del logo | `src/components/volto/percorso.ts` |
| modello, espressioni e composizione della scena | `src/components/volto/Volto3D.tsx` |
| camera, fari, volume e card solide | `src/components/volto/CameraImmersiva.tsx`, `LuciTeatro.tsx`, `NebbiaVolumetrica.tsx`, `CardNelloSpazio.tsx` |
| progetti | `src/content/progetti/<slug>/`; [guida pratica](docs/come-aggiungere-un-progetto.md) |
| meta e indirizzi social del sito | `index.html` |

Scrivere i testi in minuscolo con apostrofi tipografici (’). Gli originali creativi si conservano in `sorgenti/`; soltanto le versioni runtime necessarie stanno in `public/`.

## pubblicazione

Repository: [ProvaLandingPagePortfolio_Claude](https://github.com/alessandrobottone2005-crypto/ProvaLandingPagePortfolio_Claude). Progetto Vercel: `provalandingpageportfolio-claude`, ambiente Node 24/Vite. Dominio: [provalandingpageportfolio-claude.vercel.app](https://provalandingpageportfolio-claude.vercel.app).

La manutenzione corrente usa il branch `codex/manutenzione-portfolio-3d`; lo stato del deploy, la versione e i controlli online si trovano in [pubblicazione](docs/pubblicazione.md). Il push di un branch e il deploy in produzione sono operazioni distinte. La configurazione mantiene il refresh delle rotte `/progetti/<slug>`.

## documentazione

| guida | contenuto |
|---|---|
| [come aggiungere un progetto](docs/come-aggiungere-un-progetto.md) | authoring, file e controlli |
| [architettura](docs/architettura.md) | responsabilità, cartelle, avvio, scroll e rotte |
| [volto](docs/volto.md) | SVG, modello V2, espressioni e cache |
| [ambiente 3d](docs/ambiente-3d.md) | spirale solida, camera, luci, volume ed esportazione |
| [animazioni](docs/animazioni.md) | comportamento e parametri delle sezioni |
| [progetti](docs/progetti.md) | schema JSON, caricamento e script |
| [pannello](docs/pannello.md) | rotta modale e cinque tipi di blocco |
| [accessibilità e prestazioni](docs/accessibilita-prestazioni.md) | tastiera, movimento ridotto, fallback e limiti delle misure |
| [pubblicazione](docs/pubblicazione.md) | GitHub, Vercel, asset pubblici e verifiche |
| [sorgenti Blender](sorgenti/logo-3d/README.md) | scene, controlli, rigenerazione e licenze |
| [CLAUDE.md](CLAUDE.md) | brief operativo e storico delle decisioni |
