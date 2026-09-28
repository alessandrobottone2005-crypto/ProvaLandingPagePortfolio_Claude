# pubblicazione

## repository e ambiente

- [Repository GitHub](https://github.com/alessandrobottone2005-crypto/ProvaLandingPagePortfolio_Claude).
- Progetto Vercel: `provalandingpageportfolio-claude`, team ABDesign (`abd-esign1`), Vite e Node 24.
- [Dominio di produzione](https://provalandingpageportfolio-claude.vercel.app).
- Branch della manutenzione del 29 settembre 2026: `codex/manutenzione-portfolio-3d`.

L’utente ha autorizzato creazione/push del branch e deploy in produzione. **Questa pubblicazione viene preparata dal branch di manutenzione; non comporta un merge in `main`.** Un successivo deploy da `main` deve includere queste modifiche, altrimenti può riportare online il codice precedente.

## stato della manutenzione corrente

| voce | stato |
|---|---|
| branch locale | `codex/manutenzione-portfolio-3d` |
| commit pubblicato e push GitHub | da registrare dopo conferma |
| deploy production e URL della versione | in preparazione; non ancora confermati |
| verifica online | da registrare dopo il deploy |

Il dominio sopra è l’indirizzo stabile del progetto, non la prova che il nuovo deploy sia già online. URL immutabile della versione, commit ed esito dei controlli vanno aggiornati solo dopo la pubblicazione riuscita.

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

- [ ] branch/commit e progetto Vercel corretti, nessun merge non richiesto
- [ ] lint e build completati, lockfile coerente e validazione dei progetti superata
- [ ] comportamento desktop/tablet/telefono, scroll inverso, card e dialog verificati
- [ ] link diretto e refresh della rotta verificati nella build e online
- [ ] fallback SVG/DOM e cambio movimento ridotto verificati
- [ ] testi, link, email, nome fisso, copyright e asset social controllati
- [ ] pubblicazione riuscita, URL immutabile e commit annotati sopra
- [ ] contenuti segnaposto dichiarati: i venti attuali restano pubblicati finché non vengono sostituiti
- [ ] misure Lighthouse e prova su Safari iOS/Chrome Android fisici ripetute quando disponibili
