# accessibilità e prestazioni

## leggibilità

Palette in `src/styles/globals.css`: nero `#141414`, grigio `#4d4b4a`, bianco `#c9c5c0`. Copertine a colori e luci 3d sono le eccezioni previste. Outfit Variable locale, testi/etichette in minuscolo, selezione bianca con testo nero.

Il testo da leggere resta bianco sul fondo scuro; il grigio è riservato a bordi, superfici e parole biografiche prima della rivelazione. Biografia, etichette, nome fisso, contatti e copyright sono sopra il Canvas. I contenuti del pannello sono opachi, così immagini e colori non vengono alterati dall’ambiente.

## movimento ridotto e riserva

`prefers-reduced-motion: reduce` è rispettato anche se cambia a pagina aperta: niente Lenis, pin, scrub, Canvas, battiti, cursore personalizzato o grana animata. SVG statici e griglia 3/2/1 subito interattiva; restano dissolvenze brevi. Il preloader non scarica la scena o il modello 3d in questa modalità. [Comportamenti completi](animazioni.md#movimento-ridotto).

Un errore del modello o del Canvas viene gestito da `ScenaProtetta`: volto SVG e spirale DOM di riserva. La griglia e i pannelli continuano a funzionare. Il fallback non sostituisce i test sui dispositivi/browser reali.

## tastiera, touch e struttura

- Focus bianco 2px con offset 4px, sempre visibile.
- Nome fisso attivabile da tastiera per tornare all’inizio.
- Spirale: frecce sinistra/destra per avanzare; nessuna apertura delle card prima della griglia.
- Griglia: Tab, Invio/Spazio sulla copertina, esplora, chiudi ed Esc. `aria-expanded` e `aria-controls`; contenuti e griglia non disponibili sono `inert`.
- Dialog Radix: focus intrappolato, Esc, ritorno del focus alla card.
- Video: slider con frecce, Home/End; PDF con pulsanti e contatore accessibile.
- Contatti: hover equivalente a focus/tocco; copia email annunciata con `aria-live`.
- Controlli principali almeno 48px; contatti 56px, margini minimi 16px e safe area iOS.

`html lang="it"`, un `main`, quattro sezioni etichettate, un `h1` e titoli di sezione `sr-only`. Testi animati hanno una copia accessibile e la copia visuale `aria-hidden`. Canvas, tavola, grana e cursore sono decorativi. Le copertine hanno etichette descrittive; foto/firma non compaiono nella home.

## caricamento e rendering

| risorsa | quando viene richiesta |
|---|---|
| codice della scena Three.js/R3F e GLB V2 | preloader, salvo movimento ridotto |
| copertine della spirale | montaggio delle card della scena; il preloader include la prima |
| pannello | prima apertura di un progetto |
| blocchi PDF, modello 3d, video, immagini, testo | solo se usati dal progetto aperto |
| laboratorio | solo sviluppo |
| player esterno Vimeo/YouTube | clic sul pulsante play |

- Modello V2 circa 872 kB con Meshopt, texture WebP incorporate e cache condivisa; nessuna HDRI di studio scaricata dalla home.
- Canvas unico su `demand`, aggiornato solo con scena visibile e scheda attiva; le espressioni continuano quando posizione/scala sono ferme. I modelli nei pannelli si fermano fuori vista.
- Stessi effetti e limite DPR 1,5 su desktop e mobile; volume a 32 campioni per raggio. Non esiste un ramo mobile che elimina l’ambiente.
- Geometrie delle card condivise; materiali/texture locali, luci e render target liberati allo smontaggio. Le risorse della GLB condivisa restano in cache.
- Immagini WebP fino a 2400px, copertine card da 900px; `srcset` per le immagini HTML. I file rimangono separati dal codice (`assetsInlineLimit: 0`).
- Zod esegue controlli in sviluppo/build, non viene scaricato dal sito di produzione.
- Video autoplay soltanto muti e in vista; PDF renderizzati vicino alla pagina aperta; grana animata solo con mouse.

## verifiche e limiti delle misure

Build e lint verificano codice e file dei progetti; la verifica browser deve coprire scroll avanti/indietro, cambio viewport, griglia, espansione singola, pannello e link diretto, navbar, contatti, movimento ridotto e caricamento 3d fallito. Gli ultimi controlli della spirale sono descritti in [ambiente 3d](ambiente-3d.md#verifica-della-spirale--28-settembre-2026).

Le misure Lighthouse del 26 settembre 2026 (prestazioni 81, accessibilità 96, buone pratiche 100, SEO 100) precedono il logo e l’ambiente V2: sono storiche e non descrivono la build corrente. L’obiettivo di 60fps non è una garanzia su ogni dispositivo. Ripetere misure sulla versione pubblicata e su telefoni fisici; un viewport mobile emulato verifica layout e interazioni, non le prestazioni del telefono.
