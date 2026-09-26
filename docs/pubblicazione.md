# pubblicazione

## come funziona

- **github**: il codice sta nel repository https://github.com/alessandrobottone2005-crypto/ProvaLandingPagePortfolio_Claude
- **vercel**: il repository è collegato a vercel (collegamento in fase di configurazione). ogni push sul ramo `main` fa partire da solo una nuova pubblicazione su https://provalandingpageportfolio-claude.vercel.app, di solito in un paio di minuti
- vercel riconosce un progetto vite: esegue `npm run build` e pubblica la cartella `dist/`

in pratica: modifichi in locale → controlli con `npm run dev` → commit → push su `main` → il sito si aggiorna.

## la build

`npm run build` = `tsc -b && vite build`:

1. controlla il typescript
2. il plugin `controlla-progetti` (`vite.config.ts`) controlla tutti i progetti: se manca un file o un campo la build si ferma con un messaggio in italiano, e su vercel la pubblicazione non parte (resta online la versione precedente)
3. vite prepara il sito in `dist/`

per vedere in locale il sito esattamente come sarà pubblicato: `npm run build`, poi `npm run preview`.

## `vercel.json`

```json
{ "rewrites": [{ "source": "/(.*)", "destination": "/index.html" }] }
```

tutti gli indirizzi rimandano a `index.html`: senza questa regola, aprendo o ricaricando direttamente `/progetti/<slug>` vercel risponderebbe “pagina non trovata”. i file che esistono davvero (immagini, script, `og.png`…) vengono serviti normalmente.

## anteprima quando il sito viene condiviso

- in `index.html`: `description`, meta open graph (`og:title`, `og:description`, `og:image` 1200×630 con testo alternativo) e `twitter:card`.
- `public/og.png` si crea con `npm run genera-og` (`scripts/genera-og.mjs`): volto al centro, “alessandro” in alto a sinistra, “bottone” in basso a destra, su nero, dalla stessa geometria del volto. serve il font outfit installato sul computer (`Outfit-VariableFont_wght.ttf` in `~/Library/Fonts` o `/Library/Fonts`).
- **da fare dopo la pubblicazione**: `og:image` oggi è `/og.png`; molti social vogliono l’indirizzo completo. va cambiato in `https://provalandingpageportfolio-claude.vercel.app/og.png` (o nel dominio definitivo).
- se cambi `sito.descrizione` in `src/config/sito.ts`, aggiorna a mano anche le due descrizioni in `index.html`.

## `robots.txt`

`public/robots.txt` permette a tutti i motori di ricerca di leggere tutto il sito.

## cosa non va su github (`.gitignore`)

| cosa | perché |
|---|---|
| `._*` | file nascosti che macos crea sui dischi esterni (exfat), come quello del progetto |
| `node_modules` | le librerie: si reinstallano con `npm install` |
| `dist`, `dist-ssr` | il sito preparato: lo ricrea vercel a ogni pubblicazione |
| `.env`, `.env.*` (tranne `.env.example`) | chiavi e segreti |
| `.mcp.json` | configurazione degli strumenti di claude code (contiene chiavi personali, es. 21st.dev) |
| `.claude/settings.local.json` | preferenze locali di claude code |
| `.vercel` | collegamento locale a vercel |
| `*.local`, log, `.DS_Store`, cartelle degli editor | file del computer, non del sito |

## checklist prima di pubblicare

- [ ] i progetti veri sono in `src/content/progetti/` e i dieci `segnaposto-01` … `segnaposto-10` sono stati cancellati (o messi con `"pubblicato": false`)
- [ ] `npm run prepara-progetti` finisce con “tutto a posto”
- [ ] `npm run build` finisce senza errori
- [ ] controllato con `npm run preview`: header, anello, apertura e chiusura di un progetto, link diretto a `/progetti/<slug>`, email copiata
- [ ] testi, link ed email giusti in `src/config/sito.ts`
- [ ] foto e posizione della firma giuste (`src/config/foto.ts`)
- [ ] niente maiuscole nei testi nuovi
- [ ] dopo la prima pubblicazione: `og:image` con l’indirizzo completo, prova su safari ios e chrome android veri, lighthouse (mobile) sul sito online
