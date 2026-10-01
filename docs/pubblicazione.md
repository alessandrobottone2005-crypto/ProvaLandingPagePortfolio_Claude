# pubblicazione

## repository e ambiente

- [Repository GitHub](https://github.com/alessandrobottone2005-crypto/ProvaLandingPagePortfolio_Claude).
- Progetto Vercel: `provalandingpageportfolio-claude`, team ABDesign (`abd-esign1`), Vite e Node 24.
- [Dominio di produzione](https://provalandingpageportfolio-claude.vercel.app).
- Branch di lavoro: `main`. Il 1 ottobre 2026 vi è stato fuso `prova/computer-retro` (computer retrò, sala di cemento, avatar a punti, volto dietro il computer).
- Branch storico: `codex/manutenzione-portfolio-3d`, da cui è stata pubblicata la versione del 29 settembre 2026.

## pubblicazione del 1 ottobre 2026

Autorizzata da alessandro in chat il 1 ottobre 2026: merge di `prova/computer-retro` in `main`, push su GitHub e deploy Vercel in produzione. **Per sua scelta esplicita la pubblicazione avviene con i crediti CC BY del computer e della sala ancora segnaposto** (rischio accettato): la build mostra due avvisi e i crediti restano da completare in `src/config/sito.ts` (`computer.crediti`), vedi [sorgenti del computer](../sorgenti/computer/README.md) e [sorgenti della sala](../sorgenti/sala/README.md).

| voce | stato |
|---|---|
| merge in `main` e push GitHub | fast-forward di `prova/computer-retro` in `main`, push riuscito (`d889e56..47bffee`); pubblicato anche il branch `prova/computer-retro` |
| commit pubblicato | `47bffee` (computer retrò, sala di cemento, avatar e volto che sbuca dietro il monitor) |
| deploy production (stato, data e ora) | `READY`, 1 ottobre 2026 alle 21:00 (ora italiana), avviato dall’integrazione Git di Vercel al push su `main` |
| URL immutabile della versione | https://provalandingpageportfolio-claude-9qxw01f9n-abd-esign1.vercel.app |
| alias pubblico | https://provalandingpageportfolio-claude.vercel.app |
| deployment e durata della build | `dpl_43znGWQMaHWDvvDkMmHvXgn9hhk8`, build 39s |
| verifica online | rotte `/`, `/progetti/segnaposto-05` e slug inesistente in 200; GLB di volto, computer e sala, luci cotte, avatar, `og.png` e `robots.txt` in 200. Chrome headless desktop 1440×900 e telefono 390×844: link diretto con finestra «progetto 05» aperta nel computer, Esc torna a `/`, scroll fino ai contatti, nessun errore in console né risorse mancanti. Non verificati: dispositivi fisici, Safari/Firefox, Lighthouse |

Da controllare online: discesa al computer, accensione e spegnimento, cartelle e finestre, link diretto e ricarica di `/progetti/<slug>`, volto dietro il monitor e nascondino, biografia con avatar, contatti, movimento ridotto, telefono (viewport) e asset `public/computer/`, `public/sala/`, `public/avatar/` con risposta HTTP 200.

## storico: manutenzione del 29 settembre 2026

L’utente aveva autorizzato creazione/push del branch e deploy in produzione. **Quella versione è stata pubblicata dal branch di manutenzione, senza merge in `main`.**

| voce | stato |
|---|---|
| branch GitHub | [`codex/manutenzione-portfolio-3d`](https://github.com/alessandrobottone2005-crypto/ProvaLandingPagePortfolio_Claude/tree/codex/manutenzione-portfolio-3d), push riuscito |
| commit codice pubblicato | [`6db4e456239ee683268b7a6d0aeb512719bcb108`](https://github.com/alessandrobottone2005-crypto/ProvaLandingPagePortfolio_Claude/commit/6db4e456239ee683268b7a6d0aeb512719bcb108) |
| deploy production | `READY`, 29 settembre 2026, circa 00:08 (Europe/Rome) |
| URL immutabile della versione | [9g7a1ojwa](https://provalandingpageportfolio-claude-9g7a1ojwa-abd-esign1.vercel.app) |
| deployment | `dpl_Hdc8NqEk67VzLRdzBim6bGcdeTXy`, build Vite circa 21s |
| verifica online | superata sul dominio pubblico: spirale 3D, griglia 3/2/1, card e pannello, link diretto/refresh, movimento ridotto; nessun errore browser rilevato |

Prima di quel deploy erano stati completati lint/build e controlli browser locali (desktop e viewport mobile 390px, venti card, griglia, pannello, link diretto/refresh, movimento ridotto). Dopo il deploy erano stati verificati sul dominio pubblico desktop 1440px, tablet 820px e mobile 390px, senza overflow orizzontale; home, rotta progetto, modello V2, immagine social e robots rispondevano HTTP 200. Spirale, griglia, card e pannello sono stati sostituiti dal computer il 1 ottobre 2026. Le prove mobile erano a viewport emulata, non misure Lighthouse né prove su telefoni fisici.

## build e deploy

```sh
npm ci
npm run lint
npm run build
npm run preview
```

La build esegue TypeScript, il plugin di validazione progetti e Vite. Se un file/campo manca, si ferma con un messaggio italiano. L’output è `dist/`; il sito pubblica codice e asset runtime, non le cartelle di lavoro.

Prima del deploy controllare header, discesa al computer, accensione e spegnimento, cartelle e finestre dei progetti, volto dietro il monitor, link diretto, biografia, contatti e movimento ridotto. Dopo commit e push, il progetto locale già collegato può essere pubblicato in produzione con la CLI Vercel (`vercel --prod`). Controllare che il target sia il progetto corretto e annotare l’URL della versione restituita. La CLI aggiorna l’alias pubblico; non modifica né unisce i branch GitHub.

Il push di un branch può generare una preview se l’integrazione Git è attiva. Una preview e un deploy production sono distinti: verificare il target di ogni pubblicazione. Per altre pubblicazioni serve l’autorizzazione prevista nel [brief operativo](../CLAUDE.md).

## rotte e asset

`vercel.json` rimanda le rotte della SPA a `index.html`, mantenendo accessibili gli asset reali. Aprire e ricaricare `/progetti/<slug>` deve portare la home a metà della sosta davanti al computer acceso, con la finestra del progetto aperta, anche su telefono e con movimento ridotto.

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

`.gitignore` governa Git; `.vercelignore` governa l’upload della CLI. Un file incluso nel repository pubblico è consultabile su GitHub anche quando non fa parte del sito. `pubblicato: false` nasconde un progetto, non costituisce accesso riservato ai suoi file.

## checklist di rilascio — 1 ottobre 2026

Da spuntare dopo il deploy, con gli esiti reali.

- [x] merge di `prova/computer-retro` in `main`, push e progetto Vercel corretti
- [x] lint e build completati, lockfile coerente e validazione dei progetti superata (avvisi attesi: crediti di computer e sala)
- [x] desktop/tablet/viewport telefono: discesa, accensione/spegnimento, cartelle, finestre, scroll inverso
- [x] link diretto e refresh di `/progetti/<slug>` verificati nella build e online
- [ ] fallback SVG/DOM e cambio movimento ridotto verificati localmente; movimento ridotto verificato anche online
- [x] testi, link, pulsante email, nome fisso, copyright e asset social controllati
- [x] pubblicazione riuscita, URL immutabile e commit annotati sopra
- [x] contenuti segnaposto dichiarati: i venti progetti e i crediti di computer e sala restano segnaposto per scelta di alessandro
- [ ] misure Lighthouse e prova su Safari iOS/Chrome Android fisici ripetute quando disponibili
