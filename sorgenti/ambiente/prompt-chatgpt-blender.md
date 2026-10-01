Sei un artista 3D esperto di Blender e architettura. Lavori sul mio Mac con Computer Use.
 Devi costruire in Blender l’ambientazione 3D del mio portfolio web: un edificio brutalista
 monumentale in bianco e nero, che poi verrà caricato in un sito Three.js. Lavora con
 precisione: le misure qui sotto vengono dal codice del sito e non sono indicative.

 CARTELLA DEL PROGETTO
 /Volumes/SSD_ALE/Portfolio2026/Projects/ProvaLandingPagePortfolio_Claude

 REGOLE SUI FILE (obbligatorie)
 - Scrivi SOLO dentro sorgenti/ambiente/. Non modificare, spostare o cancellare nient’altro.
 - Non salvare mai sorgenti/logo-3d/Logo3DAnimabile_MetalloGrezzo_V2.blend: il logo va solo
   importato con File > Append.
 - Nessun comando git, nessuna installazione di software o add-on a pagamento.
 - File di lavoro: sorgenti/ambiente/Ambiente_Brutalista.blend (salva spesso; tieni i backup
   numerati di Blender).
 - Usa Blender in /Applications/Blender.app. Per posizioni e misure esatte usa l’area
   Scripting (Python) e controlla poi il risultato a vista.

 RIFERIMENTI VISIVI
 Guarda prima tutte le immagini in sorgenti/ambiente/ispirazioni/ (la tavola Gemini è il
 brief). Parole chiave: architettura monumentale, archi e prospettive infinite, torre di
 blocchi di cemento sfalsati, scalinata monumentale, passerella sospesa sul vuoto tra pareti
 altissime, cemento grezzo con segni di cassaforma, ombre nette, luce drammatica solo
 dall’alto, pavimento scuro riflettente, atmosfera solenne, figura minuscola in uno spazio
 enorme. Qui la «figura» è il mio logo: un volto di metallo grezzo.

 CONCETTO
 Un unico edificio continuo attraversato in quattro tappe, una per sezione del sito.
 Ambiente PREVALENTEMENTE SCURO: la luce entra solo da aperture precise (lucernari,
 fessure, archi) come lame bianche. Il sito aggiunge una nebbia volumetrica che rende
 visibili quei fasci, e sopra la scena compaiono testi bianco caldo: dove ci sono testi
 serve ombra.

 PALETTE (vincolante)
 Solo acromatici caldi. Nero #141414, grigio #4d4b4a, bianco caldo #c9c5c0 e loro
 sfumature. Cemento chiaro al massimo come #c9c5c0; pareti in ombra fino a #141414.
 Luci solo bianche o bianco caldo (nessuna luce colorata). World quasi nero
 (intensità ≈ 0,002). Nessun colore saturo in nessun materiale.

 SISTEMA DI COORDINATE E SCALA
 - Unità Blender = unità del sito. Z in alto. Il sito converte (x, y, z) → (x, z, −y).
 - Il logo guarda verso −Y. Ogni camera del sito sta davanti al logo, sul lato −Y.
 - Camera del sito in inquadratura normale: 20 unità davanti al punto inquadrato, campo
   visivo VERTICALE 18° (Sensor Fit: Vertical) → altezza visibile 6,34 unità sul piano del
   logo. Far clip del sito: 60 unità.
 - Larghezza del volto per tappa (misurata a 1440×900): header ≈ 6,5 u; spirale ≈ 2,3 u;
   chi sono ≈ 2,5 u spostato a sinistra; contatti ≈ 4,8 u.
 - Formati da verificare SEMPRE: desktop 1440×900 e telefono verticale 390×844 (sul telefono
   la larghezza visibile al piano del logo è solo ≈ 2,9 u: gli elementi chiave devono
   leggersi anche nel ritaglio verticale centrale).

 LE QUATTRO STAZIONI
 Crea quattro Empty (Plain Axes) con questi nomi esatti: stazione_header,
 stazione_spirale, stazione_biografia, stazione_contatti. Ognuno è il punto al centro
 dell’inquadratura di quella sezione; l’asse −Y locale punta verso la camera. Le stazioni
 possono avere solo rotazione attorno a Z (niente inclinazioni). Il sito sposta l’edificio da
 una stazione all’altra in linea retta, nell’ordine header → spirale → biografia → contatti:
 il segmento tra due stazioni consecutive, e quello tra le rispettive camere, deve essere
 libero da geometria (corridoio, arco, scala o passerella allineati). Distanza consigliata
 tra stazioni consecutive: 25–60 unità.

 Per ogni stazione crea una camera figlia chiamata cam_<nome> (es. cam_header): posizione
 locale (0, −20, 0), rivolta verso la stazione, FOV verticale 18°. Metti in ogni stazione
 una copia collegata (Alt+D) del logo scalata alla larghezza indicata sopra, e posizionata
 come descritto sotto, dentro una collection «riferimenti» (non verrà esportata).

 1. stazione_header — SALA AD ARCHI
    Sala alta con archi a tutto sesto in sequenza prospettica (immagine degli archi). Una
    lama di luce dall’alto cade sul volto al centro. Il volto è grande (≈ 6,5 u): lo
    sfondo deve leggersi ai lati e sopra. Nella parte bassa e in alto a destra compaiono
    testi grandi: lì ombra.

 2. stazione_spirale — TORRE / POZZO VERTICALE
    Uno spazio verticale altissimo con la torre di blocchi sfalsati (immagine della torre)
    o pareti a blocchi (immagine della scalinata). Attorno al volto ruotano 20 card dei
    progetti a elica. CILINDRO LIBERO obbligatorio: raggio 5 u, da −17 a +17 u in Z attorno
    alla stazione, nessuna geometria all’interno. Crea anche:
    - cam_spirale_orbita: distanza 8,25 u, FOV verticale 42°, animata dai fotogrammi 1 a 100
      da azimut −24° a +22° attorno alla stazione, elevazione da 10° a 14° e ritorno;
    - cam_spirale_campo_lungo: camera frontale a 40 u, FOV verticale 42°, elevazione 10°.
      In questa vista si vede un’area di ≈ 30 u di altezza: la torre deve funzionare come
      composizione anche da lontano, senza vuoti o bordi del modello visibili.
    Aggiungi un proxy a elica di 20 rettangoli 1,4 × 1,65 u (raggio 3,5 u, altezza totale
    28 u) nella collection «riferimenti» per controllare le inquadrature.

 3. stazione_biografia — PASSERELLA TRA PARETI ALTISSIME
    Passerella sospesa sul vuoto tra muri di cemento (immagine della passerella).
    Penombra. Il volto sta a sinistra (≈ 2,5 u di larghezza, centro a x locale ≈ −2,5);
    la metà destra dell’inquadratura ospita un lungo testo: deve restare scura e
    uniforme, senza dettagli contrastati o fasci di luce.

 4. stazione_contatti — USCITA VERSO LA LUCE
    Cima della scalinata monumentale o apertura verso un cielo nuvoloso grigio. Il volto
    è al centro, grande (≈ 4,8 u). Nel terzo inferiore compaiono tre pulsanti e il
    copyright: lì ombra o superficie uniforme scura.

 LAME DI LUCE
 Per ogni apertura da cui entra un fascio visibile crea un Empty luce_01, luce_02, …
 posizionato all’apertura, con l’asse −Z locale orientato nella direzione del fascio, e
 aggiungi le proprietà personalizzate: larghezza (u), lunghezza (u), intensita (0–1).
 Almeno una lama per stazione, al massimo 8 in totale. Illumina la scena con Sun (angolo
 piccolo, 0,5–1°, per ombre nette) e Area light bianche posizionate nelle aperture.

 MATERIALI
 - Cemento con segni di cassaforma: usa texture CC0 di ambientCG (per esempio una serie
   «Concrete»), scaricate in sorgenti/ambiente/textures/ con un file LICENZE.txt che
   indica nomi e link. Niente texture con licenza diversa da CC0.
 - Pavimento scuro e lucido (roughness 0,15–0,3), cemento grezzo (roughness 0,7–0,9).
 - Smussi piccoli (Bevel 0,02–0,06 u) sugli spigoli visibili: servono a far scorrere la luce.
 - Niente figure umane, testi, loghi o oggetti non architettonici.

 BUDGET PER IL WEB (obbligatorio)
 - Collection «ambiente» con tutta la geometria da esportare; collection «riferimenti»
   per logo, proxy e piani guida (non esportata).
 - Massimo 150.000 triangoli in «ambiente», modificatori applicati prima del bake.
 - Oggetti uniti per zona e materiale (massimo ≈ 40 oggetti).
 - Nessuna geometria oltre 55 unità da ogni camera nella sua inquadratura; ciò che è più
   lontano viene tagliato dal sito.
 - Nessuna faccia nascosta dentro i volumi, niente dettagli più piccoli di 0,05 u.

 LAVORA IN DUE FASI E FERMATI TRA UNA E L’ALTRA

 FASE A — GREYBOX
 Volumi semplici grigi, stazioni, camere, lame di luce e luci; cilindro libero rispettato.
 Renderizza con EEVEE da ogni camera (cam_header, cam_spirale_orbita al fotogramma 1, 50 e
 100, cam_spirale_campo_lungo, cam_biografia, cam_contatti) sia a 1440×900 sia a 390×844,
 con il logo di riferimento visibile e la nebbia volumetrica attiva solo per l’anteprima
 (World Volume, densità ≈ 0,01). Salva i PNG in sorgenti/ambiente/anteprime/greybox/.
 Poi FERMATI e mostrami le anteprime: aspetto la mia approvazione prima di continuare.

 FASE B — DETTAGLIO E BAKE (solo dopo il mio OK)
 1. Materiali e dettagli definitivi, anteprime aggiornate in sorgenti/ambiente/anteprime/finale/.
 2. Crea su ogni oggetto di «ambiente» un secondo UV map chiamato UVLuce (Lightmap Pack
    o Smart UV Project senza sovrapposizioni, margine ≥ 0,005).
 3. Bake in Cycles: tipo Diffuse con Direct + Indirect + Color attivi (niente Glossy,
    niente volume), 256 campioni, denoise attivo, su poche atlas 2048×2048 raggruppate per
    zona (es. bake_header.png, bake_spirale.png, …) in sorgenti/ambiente/bake/.
    Controlla che non ci siano cuciture nere, macchie o ombre mancanti.
 4. Materiale web: per ogni oggetto aggiungi (senza cancellare quello Cycles) una variante
    materiale che usa la texture cotta tramite UVLuce, così posso esportare in glTF una
    versione non illuminata.
 5. Salva Ambiente_Brutalista.blend.

 CONSEGNA FINALE
 Scrivi sorgenti/ambiente/CONSEGNA.md con:
 - coordinate e rotazione Z di ogni stazione; coordinate, direzione e proprietà di ogni luce_*;
 - numero di triangoli e oggetti di «ambiente»; elenco delle atlas e dei materiali;
 - texture usate con licenza;
 - problemi noti o punti che non sei riuscito a rispettare, detti chiaramente.
 Non esportare GLB e non toccare il sito: l’export e l’integrazione li faccio io.
