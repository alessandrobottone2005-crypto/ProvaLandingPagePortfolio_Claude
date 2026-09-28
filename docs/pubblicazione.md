# pubblicazione

## repository e ambiente

- [Repository GitHub](https://github.com/alessandrobottone2005-crypto/ProvaLandingPagePortfolio_Claude).
- Progetto Vercel: `provalandingpageportfolio-claude`, team ABDesign (`abd-esign1`), Vite e Node 24.
- [Dominio di produzione](https://provalandingpageportfolio-claude.vercel.app).
- Branch della manutenzione del 29 settembre 2026: `codex/manutenzione-portfolio-3d`.

L’utente ha autorizzato creazione/push del branch e deploy in produzione. **La versione del 29 settembre 2026 è stata pubblicata dal branch di manutenzione, senza merge in `main`.** Un successivo deploy da `main` deve includere queste modifiche, altrimenti può riportare online il codice precedente.

## stato della manutenzione corrente

| voce | stato |
|---|---|
| branch GitHub | [`codex/manutenzione-portfolio-3d`](https://github.com/alessandrobottone2005-crypto/ProvaLandingPagePortfolio_Claude/tree/codex/manutenzione-portfolio-3d), push riuscito |
| commit codice pubblicato | [`6db4e456239ee683268b7a6d0aeb512719bcb108`](https://github.com/alessandrobottone2005-crypto/ProvaLandingPagePortfolio_Claude/commit/6db4e456239ee683268b7a6d0aeb512719bcb108) |
| deploy production | `READY`, 29 settembre 2026, circa 00:08 (Europe/Rome) |
| URL immutabile della versione | [9g7a1ojwa](https://provalandingpageportfolio-claude-9g7a1ojwa-abd-esign1.vercel.app) |
| alias aggiornato | [dominio pubblico](https://provalandingpageportfolio-claude.vercel.app) |
| deployment | `dpl_Hdc8NqEk67VzLRdzBim6bGcdeTXy`, build Vite circa 21s |
| verifica online | superata sul dominio pubblico: spirale 3D, griglia 3/2/1, card e pannello, link diretto/refresh, movimento ridotto; nessun errore browser rilevato |

Deploy e alias sono confermati. L’URL immutabile identifica questa versione anche se il dominio pubblico verrà aggiornato in futuro. Le successive modifiche documentali del branch possono avere commit diversi dal commit del codice effettivamente pubblicato.

Prima del deploy sono stati completati lint/build e controlli browser locali: desktop e viewport mobile 390px, venti card e griglia 3/1 senza overflow, espansione e pannello, link diretto/refresh, movimento ridotto e cambio della preferenza, chiusura e indietro del browser. Gli esiti locali non sostituiscono la verifica funzionale online né una prova su telefono fisico.

Dopo il deploy, verificati nel browser sul dominio pubblico desktop 1440px, tablet 820px e mobile 390px, senza overflow orizzontale. Confermati caricamento del Canvas e spirale anche su mobile, venti card, griglia finale, apertura/chiusura del pannello e rotta diretta con ricarica. Con movimento ridotto il Canvas è assente e la griglia resta disponibile. Home, rotta progetto, modello V2, immagine social e robots rispondono HTTP 200; il modello pubblico coincide con quello locale. Nessun errore rilevato nel browser o nei log Vercel consultati dopo il deploy. Le prove mobile sono a viewport emulata; non sono nuove misure Lighthouse né prove su telefoni fisici.

## build e deploy

```sh
npm ci
npm run lint
npm run build
npm run preview
```

La build esegue TypeScript, il plugin di validazione progetti e Vite. Se un file/campo manca, si ferma con un messaggio italiano. L’output è `dist/`; il sito pubblica codice e asset runtime, non le cartelle di lavoro.

Prima del deploy controllare header, spirale/campo lungo/griglia, card espansa, pannello, link diretto, contatti e movimento ridotto. Dopo commit e push del branch, il progetto locale già collegato può essere pubblicato in produzione con la CLI Vercel (`vercel --prod`). Controllare che il target sia il progetto corretto e annotare l’URL della versione restituita. La CLI aggiorna l’alias pubblico; non modifica né unisce il branch GitHub.

Il push di un branch può generare una preview se l’integrazione Git è attiva. Una preview e un deploy production sono distinti: verificare il target di ogni pubblicazione. Per altre pubblicazioni serve l’autorizzazione prevista nel [brief operativo](../CLAUDE.md).

## rotte e asset

`vercel.json` rimanda le rotte della SPA a `index.html`, mantenendo accessibili gli asset reali. Aprire e ricaricare `/progetti/<slug>` deve caricare la home sulla griglia finale e il pannello, anche con movimento ridotto.

`index.html` contiene descrizione, Open Graph e Twitter Card. `og:url` e `og:image` sono già assoluti sul dominio Vercel. Se cambia dominio aggiornare entrambi; se cambia `sito.descrizione`, aggiornare anche le descrizioni HTML. `npm run genera-og` produce `public/og.png` 1200×630 e richiede Outfit TTF installato. `public/robots.txt` permette l’indicizzazione.

## file conservati e file pubblicati

| posizione | GitHub | sito/deploy |
|---|---|---|
| `src/`, configurazioni, lockfile | sì | codice di build e asset importati |
| `public/` | sì | tutti i file della cartella: solo asset necessari |
| `sorgenti/`, scene Blender, texture, render finiti | sì | esclusi dall’upload CLI con `.vercelignore` |
| `docs/`, README e brief | sì | esclusi dall’upload CLI |
| foto originali e `_originali/` dei progetti | conservati | esclusi dall’upload CLI se non importati |
| frame PNG rigenerabili | no | rimossi; rigenerabili dagli script Blender |
| `*.blend1` e altri backup numerati | sul disco, ignorati Git | esclusi |
| `.env*`, `.mcp.json`, impostazioni locali, `.vercel` | esclusi | chiavi/configurazioni locali non pubblicate |
| `node_modules`, `dist`, log, `._*` | esclusi | output ricreati, cache e metadati non caricati |

`.gitignore` governa Git; `.vercelignore` governa l’upload della CLI. Un file incluso nel repository pubblico è consultabile su GitHub anche quando non fa parte del sito. `pubblicato: false` nasconde una card, non costituisce accesso riservato ai suoi file.

## checklist di rilascio

- [x] branch/commit e progetto Vercel corretti, nessun merge non richiesto
- [x] lint e build completati, lockfile coerente e validazione dei progetti superata
- [x] comportamento desktop/tablet/viewport telefono, scroll inverso, card e dialog verificati
- [x] link diretto e refresh della rotta verificati nella build e online
- [x] fallback SVG/DOM e cambio movimento ridotto verificati localmente; movimento ridotto verificato anche online
- [x] presenza di testi, link, pulsante email, nome fisso, copyright e asset social controllata
- [x] pubblicazione riuscita, URL immutabile e commit annotati sopra
- [x] contenuti segnaposto dichiarati: i venti attuali restano pubblicati finché non vengono sostituiti
- [ ] misure Lighthouse e prova su Safari iOS/Chrome Android fisici ripetute quando disponibili
