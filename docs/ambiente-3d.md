# ambiente 3d della V2

Il riferimento è `sorgenti/logo-3d/Logo3DAnimabile_MetalloGrezzo_V2.blend`, aperto e verificato in Blender tramite il plugin Computer. Il file originale non viene risalvato dagli script di esportazione.

## percorso

Le prime fasi illustrate dell’header restano invariate. La scena scura compare con il logo metallico, rimane dietro tutte le sezioni e accompagna le venti card della spirale. Lo scroll guida una camera diagonale con campo visivo fino a 42°, elevazione di 10–14° e orbita parziale da −24° a +22°. Focale e distanza cambiano insieme per conservare l’inquadratura del logo. Nel finale la camera arretra per mostrare tutta l’elica, poi torna esattamente frontale prima dello scambio con la griglia. L’ultimo tratto sfuma le card WebGL nelle card HTML interattive, conservando espansione, tastiera e pannello progetto.

Biografia, etichette, navbar, contatti e copyright sono sopra il volume e restano leggibili. I pannelli progetto hanno sfondo opaco. La modalità movimento ridotto conserva il percorso statico accessibile senza Canvas; non è collegata alla dimensione dello schermo.

## spirale delle venti card

- Ogni card ha tre superfici reali: corpo con retro scuro, cornice forata estrusa e copertina incassata. Smussi arrotondati e normali continue fanno scorrere la luce sui bordi. Le geometrie sono condivise tra tutte le card.
- La spirale attraversa il piano del logo: le card vicine lo possono coprire, quelle lontane sono dietro di lui. La profondità è proporzionale all’altezza della finestra anche su telefono; non viene compressa in base alla larghezza.
- Due ulteriori luci d’area radenti illuminano cornici, fianchi e retro durante la spirale. Si spengono prima della griglia. Le copertine conservano il materiale senza riflessi; restano soggette alla stessa nebbia della scena.
- Il finale dura 200vh: nel primo 30% la camera arretra e l’elica si allarga e riduce il passo per entrare nell’inquadratura; dal 30% all’88% le card si raddrizzano, raggiungono la griglia e perdono spessore; nell’ultimo 12% la grafica HTML compare sopra le superfici WebGL ancora opache. Nessuna doppia dissolvenza o rumore sulle immagini. Le card diventano interattive solo a transizione terminata.
- Il percorso è interamente reversibile. La griglia finale, l’apertura delle informazioni e il pannello progetto restano gli stessi. In movimento ridotto si arriva direttamente alla griglia.

I parametri di orbita, profondità, passo, campo lungo e tempi sono in `movimento.portfolio.spirale3d`; `fasiSpirale` sincronizza camera, card, logo e dissolvenza.

## illuminazione e nebbia

- Tre luci principali d’area bianche, nelle posizioni della V2 convertite dagli assi Blender a quelli di Three.js. Puntano al logo come i vincoli Track To del file. La posizione inseguita ha inerzia; luci e dimensioni si adattano alla scala del volto.
- Ambiente senza HDRI di studio: fondo scuro, luci radenti, materiale metallico della V2, tone mapping AgX. L’intensità è calibrata per il renderer web; un render Cycles e WebGL non producono pixel identici.
- Nebbia volumetrica calcolata in 32 campioni lungo ogni raggio, densità di base 0,01 e rumore tridimensionale lento. La profondità della scena arresta il volume davanti alle superfici. Non è una GIF o un video di sfondo.
- Desktop e mobile usano gli stessi effetti, 32 campioni, antialiasing e limite DPR 1,5. Nessun ramo mobile elimina luci, nebbia o viaggio della camera. Il rendering si ferma quando la scheda è nascosta o prima dell’apparizione del 3D.

La nebbia web approssima la diffusione della V2; non riproduce il path tracing, i rimbalzi indiretti o le ombre volumetriche complete di Cycles.

## file da regolare

- `src/components/volto/CameraImmersiva.tsx`: percorso della camera.
- `LuciTeatro.tsx`: posizioni, intensità e ritardo dei fari.
- `NebbiaVolumetrica.tsx`: densità, movimento e diffusione del volume; composizione con buffer di profondità.
- `CardNelloSpazio.tsx`: copertine reali dentro la scena; passaggio alla griglia.
- `scenaImmersiva.ts` e `cardImmersive.ts`: pose condivise senza aggiornamenti React per fotogramma.
- `Volto3D.tsx`: viso, espressioni e composizione della scena.

Le geometrie/materiali del modello restano nella cache del caricatore. Render target, luci, materiali e texture delle card vengono liberati allo smontaggio. In caso di errore del 3D rimangono il volto SVG e la spirale DOM di riserva. Il render target della nebbia segue dimensioni e DPR effettivo; il cambio della preferenza di movimento smonta/ripristina la scena anche a sito aperto.

## esportazione

```sh
/Applications/Blender.app/Contents/MacOS/Blender -b sorgenti/logo-3d/Logo3DAnimabile_MetalloGrezzo_V2.blend --python sorgenti/logo-3d/scripts/export_v2_web.py
node_modules/.bin/gltf-transform optimize sorgenti/logo-3d/Logo3DAnimabile_V2_Web.glb public/volto/logo-metallo-v2.glb --flatten false --join false --instance false --simplify false --compress meshopt --texture-compress webp --texture-size 1024
```

L’esportazione prende solo la gerarchia del logo, con shape key e posa neutra degli occhi; volume e luci vengono ricostruiti nel sito. Le espressioni restano interattive. La GLB compressa pesa circa 872 kB.

Riferimenti tecnici: [luci d’area](https://threejs.org/docs/pages/RectAreaLight.html), [buffer di profondità](https://threejs.org/docs/pages/DepthTexture.html), [render target](https://threejs.org/manual/pages/rendertargets.html).

## verifica della spirale — 28 settembre 2026

Build TypeScript/Vite e lint completati. Verifica nel browser a 1440×900, 820×1180 e 390×844: geometrie e camera, griglia 3/2/1 senza overflow orizzontale, espansione di una sola card, apertura e chiusura del pannello, ritorno alla spirale e all’header. L’allineamento delle venti pose alle card HTML prima dello scambio è entro la precisione numerica. Il cambio a movimento ridotto smonta il Canvas e lascia tutti i venti progetti utilizzabili. Nessun errore nel caricamento e percorso finali; l’utility delle normali è inclusa nell’ottimizzazione iniziale di Vite per evitare ricaricamenti delle dipendenze durante lo sviluppo. Restano gli avvisi già presenti sui bundle grandi. Le dimensioni mobili sono simulate nel browser, non costituiscono una misura di prestazioni su un telefono fisico.

## manutenzione — 29 settembre 2026

Il componente di scroll è ora `src/sections/Portfolio/Spirale.tsx`; l’id ScrollTrigger `portfolio-anello` rimane per le letture di posa e le rotte. La pila mobile e le misure della vecchia card header sono state eliminate perché non usate. La home continua a usare la V2: copie pubbliche del modello V1 e dell’HDRI rimosse, sorgenti conservati fuori dal runtime. Debugging e controlli correnti sono descritti in [accessibilità e prestazioni](accessibilita-prestazioni.md) e [pubblicazione](pubblicazione.md).
