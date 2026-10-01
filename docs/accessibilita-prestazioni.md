# accessibilità e prestazioni

## leggibilità

Palette in `src/styles/globals.css`: nero `#141414`, grigio `#4d4b4a`, bianco `#c9c5c0`. Copertine a colori e luci 3d sono le eccezioni previste; dentro lo schermo del computer valgono bianco e nero puri e ChicagoFLF (eccezione concordata il 1 ottobre 2026). Outfit Variable locale nel resto del sito, testi/etichette in minuscolo, selezione bianca con testo nero.

Il testo da leggere resta bianco sul fondo scuro; il grigio è riservato a bordi, superfici e parole biografiche prima della rivelazione. Biografia, etichette, nome fisso, contatti e copyright sono sopra il Canvas. Le finestre del computer sono opache: immagini e colori dei progetti non vengono alterati dall’ambiente.

## movimento ridotto e riserva

`prefers-reduced-motion: reduce` è rispettato anche se cambia a pagina aperta (si resta nella stessa sezione, `src/lib/scroll.ts`): niente Lenis, pin, scrub, battiti, cursore personalizzato o grana animata; volto SVG statico. Il portfolio usa una scena 3d ferma davanti al computer già acceso (il 3d del computer e della sala si scarica comunque, per scelta); restano dissolvenze brevi. Il preloader non scarica il logo 3d in questa modalità. [Comportamenti completi](animazioni.md#movimento-ridotto).

Un errore del logo o del Canvas viene gestito da `ScenaProtetta`: volto SVG di riserva. Se il computer 3d non si carica, l’interfaccia resta usabile in sovrimpressione nella posizione del vetro. Il fallback non sostituisce i test sui dispositivi/browser reali.

## tastiera, touch e struttura

- Focus bianco 2px con offset 4px, sempre visibile.
- Nome fisso attivabile da tastiera per tornare all’inizio.
- Computer: regione etichettata, `inert` finché la camera non è ferma sullo schermo acceso. Icone e voci sono pulsanti (Invio/Spazio aprono), menu con frecce ed Esc, finestre `role="dialog"` non modali; Esc chiude la finestra in primo piano e il focus torna all’icona che l’aveva aperta; aperture e chiusure annunciate con `aria-live`.
- Video: slider con frecce, Home/End; PDF con pulsanti e contatore accessibile.
- Contatti: hover equivalente a focus/tocco; copia email annunciata con `aria-live`.
- Controlli principali almeno 48px; contatti 56px, margini minimi 16px e safe area iOS.

`html lang="it"`, un `main`, quattro sezioni etichettate, un `h1` e titoli di sezione `sr-only`. Testi animati hanno una copia accessibile e la copia visuale `aria-hidden`. Canvas, tavola, grana e cursore sono decorativi. Le copertine hanno etichette descrittive; nessuna foto o firma nella home: l’avatar del chi sono è decorativo (Canvas `aria-hidden`, o immagine di riserva senza testo).

## caricamento e rendering

| risorsa | quando viene richiesta |
|---|---|
| codice della scena Three.js/R3F e GLB V2 | preloader, salvo movimento ridotto |
| computer 3d (≈ 1 MB) e interfaccia | dopo il preloader |
| copertine | icone dei documenti nelle cartelle aperte e finestra del progetto; il preloader include la prima |
| blocchi PDF, modello 3d, video, immagini, testo | solo se usati dal progetto aperto |
| laboratorio | solo sviluppo |
| player esterno Vimeo/YouTube | clic sul pulsante play |

- Modello V2 circa 872 kB con Meshopt, texture WebP incorporate e cache condivisa; nessuna HDRI di studio scaricata dalla home.
- Canvas unico su `demand`, aggiornato solo con scena visibile e scheda attiva; le espressioni continuano quando posizione/scala sono ferme. I modelli nelle finestre si fermano fuori vista.
- Stessi effetti e limite DPR 1,5 su desktop e mobile; volume a 32 campioni per raggio. Non esiste un ramo mobile che elimina l’ambiente.
- Materiali locali, luci e render target liberati allo smontaggio. Le risorse delle GLB condivise restano in cache.
- Immagini WebP fino a 2400px, copertine piccole da 900px per le icone. I file rimangono separati dal codice (`assetsInlineLimit: 0`).
- Zod esegue controlli in sviluppo/build, non viene scaricato dal sito di produzione.
- Video autoplay soltanto muti e in vista; PDF renderizzati vicino alla pagina aperta; grana animata solo con mouse.

## verifiche e limiti delle misure

Build e lint verificano codice e file dei progetti; la verifica browser deve coprire scroll avanti/indietro, accensione e spegnimento, cambio viewport, cartelle, finestre e link diretto, navbar, contatti, movimento ridotto e caricamento 3d fallito. Gli ultimi controlli sono descritti in [computer](computer.md#verifica--1-ottobre-2026).

Le misure Lighthouse del 26 settembre 2026 (prestazioni 81, accessibilità 96, buone pratiche 100, SEO 100) precedono il logo e l’ambiente V2: sono storiche e non descrivono la build corrente. L’obiettivo di 60fps non è una garanzia su ogni dispositivo. Ripetere misure sulla versione pubblicata e su telefoni fisici; un viewport mobile emulato verifica layout e interazioni, non le prestazioni del telefono.
