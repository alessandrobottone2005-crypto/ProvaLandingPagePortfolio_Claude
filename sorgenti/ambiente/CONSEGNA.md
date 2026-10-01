# Ambiente Brutalista — consegna intermedia Fase A

29 settembre 2026 — revisione A. **Greybox revisionata per approvazione. Fase B non iniziata.**

Aprire `Ambiente_Brutalista.blend`. La scena attiva è `Ambiente Brutalista | Fase A`.
Galleria: `anteprime/greybox/index.html`. 17 PNG: 8 viste × desktop 1440×900 e mobile 390×844, più biografia mobile affiancata al testo, EEVEE, World Volume densità 0,01. Le sette viste richieste sono presenti; è aggiunta la camera frontale standard della spirale.

## Geometria e riferimenti

- Collection `ambiente`: **13 oggetti mesh, 14,984 triangoli**. Oggetti uniti per zona/materiale.
- Collection `riferimenti`: copie statiche del logo V2 con mesh condivise, 20 proxy card 1,4×1,65, elica raggio 3,5 e altezza 28, fondale cielo grigio. Non esportare questa collection.
- `stazioni_e_camere`: quattro Empty senza rotazioni e sei camere. Le quattro normali sono figlie delle stazioni, local (0,−20,0), FOV verticale 18°. Orbita: 100 chiavi, distanza 8,25, azimut −24°→+22°, elevazione 10°→14°→10°. Campo lungo: distanza 40, elevazione 10°, FOV verticale 42°.
- `luci_anteprima`: 6 Empty luce_*, Sun bianco caldo 0,7°, Area di apertura e quattro Area di riflesso per leggere il metallo. Le Area di riflesso sono ausili di anteprima, non ulteriori fasci da ricreare nel sito.
- Unità Blender = sito. Conversione (x,y,z) → (x,z,−y). Fronte −Y.
- Logo importato mediante operatore Append; originale V2 mai aperto come file di lavoro e mai salvato.
- Backup numerati `.blend1`, `.blend2`, `.blend3` conservati.

## Revisione applicata

- Otto blocchi centrali spostati sulle pareti laterali; fondale dietro al volto scuro e senza rilievi.
- Lama 03 orientata sul volto; lama 04 sui blocchi laterali. Riflesso di anteprima della spirale calibrato per leggere il metallo.
- Passerelle raccordate alle pareti del pozzo; laterali chiusi, pavimento abbassato per non nascondere le card.
- Archi scuriti in alto a destra. Architettura e luci di biografia e contatti conservate.
- Copia precedente conservata in `Ambiente_Brutalista_pre-revisione-A.blend`.

## Stazioni

| Empty | Posizione Blender | Rotazione Z |
|---|---|---|
| stazione_header | [0.0, 0.0, 0.0] | 0° |
| stazione_spirale | [36.0, 0.0, 0.0] | 0° |
| stazione_biografia | [72.0, 0.0, 0.0] | 0° |
| stazione_contatti | [108.0, 0.0, 0.0] | 0° |

Distanze consecutive 36 u. Segmenti tra stazioni e tra camere liberi (verificati anche a Z±0,25). Passerelle laterali raccordate alle pareti e al fondo del pozzo collegano le zone. Il pavimento centrale scende al fondo del pozzo per mantenere visibile l’elica nel campo lungo. Il vuoto centrale della spirale resta aperto per rispettare il cilindro delle card.

## Fasci

La direzione è l’asse locale −Z in coordinate mondo.

| Empty | Posizione XYZ | Direzione XYZ | larghezza | lunghezza | intensita |
|---|---|---|---|---|---|
| luce_01 | -3.000, -1.000, 8.650 | 0.235, 0.235, -0.943 | 1.3 | 12 | 0.85 |
| luce_02 | -3.000, 12.000, 8.650 | 0.300, 0.300, -0.905 | 1.2 | 15 | 0.65 |
| luce_03 | 34.000, -1.000, 30.000 | 0.066, 0.033, -0.997 | 2 | 50 | 1 |
| luce_04 | 42.000, 7.000, 30.000 | 0.129, -0.022, -0.991 | 1.5 | 47 | 0.75 |
| luce_05 | 68.000, 3.000, 27.400 | 0.048, 0.193, -0.980 | 1 | 33 | 0.55 |
| luce_06 | 108.000, 22.000, 13.000 | 0.000, -0.619, -0.785 | 3 | 22 | 0.95 |

## Verifica

`verifica-greybox.json` contiene conteggi, coordinate, proprietà e FOV misurati.

- Nessuna collisione sui segmenti stazioni/camere verificati tramite BVH.
- Nessun triangolo potenzialmente nel cilindro raggio 5, Z −17…+17: verifica conservativa AABB per triangolo.
- Formati PNG verificati nei rispettivi header; confronto visivo di composizioni e ritagli.
- Far clip camere 60. L’edificio intero attraversa più zone, pertanto NON è tutto contenuto in una sfera di 55 u attorno a ciascuna camera. La lettura locale è progettata per le viste previste; resta da verificare il culling durante la transizione reale nel sito.

## Materiali, texture, atlas

Cinque materiali architettonici greybox (tre di base più due varianti): cemento #c9c5c0, cemento in ombra #4d4b4a, pavimento #141414 (roughness 0,22). Varianti: fondo pozzo #141414 opaco e archi con sfumatura acromatica più scura in alto a destra. Smussi applicati sugli elementi iniziali; nuove coperture e raccordi semplificati nella greybox.

Nessuna texture architettonica scaricata e nessuna atlas generata: CC0 ambientCG, segni di cassaforma, UVLuce, bake Cycles, materiali web e pulizia finale delle intersezioni appartengono alla Fase B.
Il logo mantiene i materiali del file fornito; la documentazione del logo attribuisce Metal032 ad ambientCG, CC0. I riferimenti visivi sono copie delle immagini fornite, non texture da distribuire.

## Punti da approvare / limiti noti

1. **Mobile corretto:** camere invariate; copie del logo scalate solo durante i render a header 2,5 u, spirale 1,2 u, contatti 2,4 u. La biografia è mostrata in due pose: passaggio alto-sinistra (48 px, centro 38/38 px) e affiancamento al testo (78 px, centro X 55 px e Y 422 px), ricavati dal codice `percorso.ts` e dal layout mobile di `ChiSono.tsx`. Nessuna modifica al sito. Le matrici desktop vengono ripristinate prima di salvare il blend.
2. Camera orbitale inquadra solo una parte dell’elica; il campo lungo ne mostra lo sviluppo. I proxy possono sovrapporsi al logo nelle viste ravvicinate, come previsto dalla disposizione richiesta; il sito gestirà visibilità e animazione delle card.
3. Illuminazione ancora da greybox: volume di anteprima presente, fasci definiti dai sei Empty. Il contrasto e i riflessi definitivi saranno da calibrare con il metallo e la nebbia del runtime.
4. La scalinata ha dettagli anche nella fascia bassa: l’illuminazione li mantiene scuri, ma i pulsanti reali andranno verificati in compositing nel sito.
5. I riferimenti autorevoli sono in `ispirazioni/`, come indicato dalla revisione.

Nessun GLB esportato, nessun comando Git eseguito, nessuna modifica al codice o a `public/`. Fermarsi qui e attendere l’approvazione prima della Fase B.
