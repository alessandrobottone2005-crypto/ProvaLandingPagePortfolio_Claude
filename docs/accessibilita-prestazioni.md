# accessibilità e prestazioni

## regole visive

- **solo tre colori** (`src/styles/globals.css`, `@theme`): nero `#141414`, grigio `#4d4b4a`, bianco `#c9c5c0`, più le loro trasparenze. le variabili di shadcn sono mappate su questi tre. eccezioni: le immagini dei progetti e le sfumature della luce sul 3d.
- **contrasto**: il testo da leggere è sempre bianco su nero (circa 10,7:1). il grigio su nero (circa 2:1) si usa solo per bordi, linee, dettagli decorativi e per le parole non ancora “accese” del chi sono (bianco al 31,5% = grigio).
- **solo outfit** (variabile, in locale con `@fontsource-variable/outfit`), precaricato in `index.html` dal plugin `precarica-font` di `vite.config.ts`.
- **mai maiuscole**: tutti i testi sono scritti in minuscolo (anche `<title>`, etichette, alt, aria-label) e in `globals.css` c’è `text-transform: lowercase !important` su tutto come rete di sicurezza.
- selezione del testo: sfondo bianco, testo nero.

## movimento ridotto

con `prefers-reduced-motion: reduce` il sito resta completo ma quasi fermo: niente lenis, pin, scrub, grana animata, cursore personalizzato, battiti del volto; l’anello diventa una griglia a due colonne; restano solo dissolvenze brevi (0,2s). elenco completo: [animazioni](animazioni.md#movimento-ridotto).

## tastiera e focus

- **focus sempre visibile**: anello bianco 2px con distanza 4px (`:focus-visible` in `globals.css`), che entra in 0,3s. il cursore personalizzato non lo nasconde.
- **anello del portfolio**: tab porta davanti la card che riceve il focus; frecce ← → ruotano; invio apre.
- **pannello**: dialog di radix con focus intrappolato, `esc` chiude, focus restituito alla card.
- **video**: barra di avanzamento con `role="slider"` usabile da tastiera (frecce, `home`, `end`).
- **contatti**: con il focus da tastiera i pulsanti si “accendono” come al passaggio del mouse e mostrano il suggerimento con l’email.

## struttura e aria

- `<html lang="it">`; un solo `<main>` con quattro `section`:
  - `#header`, etichettata “alessandro bottone”, con l’`h1` = nome (`aria-label` con nome e cognome, perché le lettere sono spezzate)
  - `#portfolio`, `#chi-sono`, `#contatti`, ognuna con un `h2` nascosto (solo screen reader): “portfolio”, “chi sono”, “contatti”
- `main` ha `aria-busy` finché il preloader non ha finito; il preloader è `aria-hidden`.
- **volto**: nell’header `role="img"` con `aria-label="logo di alessandro bottone"`; altrove è decorativo (`aria-hidden`). anche il canvas 3d, la tavola dell’header, la grana e il cursore sono `aria-hidden`.
- **testi animati**: il testo vero è in una copia `sr-only`, le lettere o parole animate sono `aria-hidden` (`TestoCheRotola`, `RotolaAlPassaggio`, testo del chi sono).
- **card**: ogni link ha un testo accessibile con titolo, discipline e anno.
- **email copiata**: annuncio “indirizzo email copiato” in una zona `aria-live="polite"`.
- **pdf**: contatore delle pagine in `aria-live`; pulsanti con etichette (“pagina precedente”, “schermo intero”…).
- testi alternativi descrittivi e in minuscolo: foto (“ritratto di alessandro bottone”), copertine e immagini del pannello (`copertina di <titolo>`, `immagine <n> di <titolo>`).
- tutte le etichette per screen reader stanno in `src/config/sito.ts` (`etichette`, `pannello`).

## touch

- aree toccabili di almeno 48px (pulsanti del pannello e dei blocchi `size-12`/`min-h-12`, pulsanti dei contatti 56px).
- ogni effetto al passaggio del mouse ha un equivalente su touch: pulsanti dei contatti (riempimento al tocco, testo che rotola quando entrano in vista), firma sopra la foto (tocco), peso del nome (punto toccato), card della pila (colore al centro dello schermo).
- margini laterali di almeno 16px su telefono; safe area di ios rispettate (`viewport-fit=cover`, `env(safe-area-inset-*)`).

## prestazioni

### codice diviso in pezzi

il sito scarica subito solo ciò che serve alla home; il resto arriva quando serve:

| pezzo | quando si scarica |
|---|---|
| `Volto3D` + three.js (`tre.ts`) | durante il preloader (conta nell’avanzamento), insieme a `volto.glb` |
| `Pannello` | alla prima apertura di un progetto |
| blocchi `Pdf` (con react-pdf, page-flip e il worker di pdf.js), `Modello3D` (con drei), `Video`, `Immagini`, `Testo` | solo se il progetto aperto li usa (`React.lazy`) |
| `Laboratorio` | mai nel sito pubblicato (solo in sviluppo) |

altre scelte:
- drei non si importa intero: solo `OrbitControls` e `ContactShadows`; luci e caricamento dei modelli sono scritti con three puro (`src/components/volto/tre.ts`).
- zod non entra nel sito: i progetti sono controllati in build e nel terminale; nel sito ci sono solo i valori predefiniti (`src/lib/dati.ts`).
- `build.assetsInlineLimit: 0` in `vite.config.ts`: nessuna immagine “incollata” dentro il codice, i file restano separati.
- `optimizeDeps.include` in `vite.config.ts`: in sviluppo le librerie del pannello sono preparate subito (evita ricaricamenti con due copie di react).

### 3d e canvas

- canvas dell’header in pausa (`frameloop="never"`) quando l’header non è attivo o prima del 45% dello scroll; canvas del blocco 3d creato solo quando arriva in vista e in pausa fuori vista.
- dpr massimo 1,5 su telefono, 2 su desktop; mappa delle luci più piccola su telefono (64 invece di 128).
- `volto.glb` compresso con meshopt: circa 92 kb.

### immagini e file

- copertine: versione da 900px per le card (`-card.webp`) con `srcset` verso quella da 2400px; `loading="lazy"` tranne la prima.
- immagini dei progetti in webp, lato massimo 2400px (`npm run prepara-progetti`); modelli compressi; avvisi per pdf sopra 15mb e video sopra 25mb.
- foto del chi sono: webp convertito con `npm run foto-palette`, `loading="lazy"`.
- video da link esterni caricati solo al clic; video con autoplay solo quando sono in vista; pagine pdf disegnate solo vicino a quella aperta.

### animazioni leggere

- si animano quasi solo `transform`, `opacity` e `clip-path`; il passaggio grigio → colore delle card è un’immagine sopra l’altra di cui cambia solo l’opacità (niente filtri ricalcolati).
- `will-change` solo durante le animazioni (volo della copertina, involucro del preloader).
- la grana è animata solo su dispositivi con mouse.

### ultime misure (dalla fase 6, vedi “decisioni prese” in `CLAUDE.md`)

| lighthouse (mobile) | prima | dopo |
|---|---|---|
| prestazioni | 73 | 81 |
| accessibilità | 92 | 96 |
| buone pratiche | 100 | 100 |
| seo | 83 | 100 |

bundle principale: da 250 a 210 kb (gzip). da ripetere dopo la pubblicazione, sul sito vero e con i progetti veri.
