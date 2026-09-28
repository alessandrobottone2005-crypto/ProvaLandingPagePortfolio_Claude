# logo 3d · metallo grezzo

Qui si conservano scene Blender, texture, esportazioni e anteprime. La home usa la **V2**: logo con forme animate, metallo grezzo, tre fari e ambiente volumetrico. I sorgenti non vengono serviti dal sito pubblicato.

## file correnti e archivio

| file/cartella | utilizzo |
|---|---|
| `Logo3DAnimabile_MetalloGrezzo_V2.blend` | riferimento creato da Alessandro: luci e volume della V2; conservare senza sovrascrivere |
| `Logo3DAnimabile_V2_Web.glb` | esportazione neutra V2 con shape key; viene ottimizzata per il runtime |
| `../../public/volto/logo-metallo-v2.glb` | asset compresso usato dalla home, Meshopt e texture WebP |
| `Logo3DAnimabile_MetalloGrezzo.blend` | lavorazione precedente con demo 1–290, 24fps e texture incorporate |
| `Logo3DAnimabile_MetalloGrezzo.glb` | export precedente con materiali, shape key e sette clip |
| `Logo3DAnimabile_Web.glb` | versione compressa della demo precedente; usata dall’anteprima locale |
| `Logo3DAnimabile_originale.blend` | copia dell’originale, conservata intatta |
| `legacy/volto.glb` | vecchio logo fornito prima del modello animabile; fuori dagli asset runtime |
| `textures/` | mappe Metal032, derivate e HDRI della lavorazione precedente |
| `anteprime/` | quattro render finiti, video dimostrativo e preview HTML |
| `verifica.json` | controllo delle mesh/espressioni della prima lavorazione |

Le copie pubbliche della GLB precedente e dell’HDRI sono state eliminate: gli originali rimangono qui. I backup Blender numerati restano sul disco ma sono ignorati da Git/deploy. La sequenza PNG `anteprime/frames/` è una cache rigenerabile, rimossa dal repository; rimangono render finiti e video.

## esportare la V2 per il sito

Dalla radice del progetto, con Blender locale:

```sh
/Applications/Blender.app/Contents/MacOS/Blender -b sorgenti/logo-3d/Logo3DAnimabile_MetalloGrezzo_V2.blend --python sorgenti/logo-3d/scripts/export_v2_web.py
node_modules/.bin/gltf-transform optimize sorgenti/logo-3d/Logo3DAnimabile_V2_Web.glb public/volto/logo-metallo-v2.glb --flatten false --join false --instance false --simplify false --compress meshopt --texture-compress webp --texture-size 1024
```

Lo script seleziona soltanto `logo_root` e i discendenti, porta le forme alla posa neutra e rimuove l’animazione **in memoria** prima dell’export. Non salva il `.blend`. La GLB mantiene gerarchia, shape key e materiali; luci, volume e camera vengono ricostruiti nel sito. L’asset runtime pesa circa 872 kB e richiede MeshoptDecoder.

Il sito anima gli eventi reali invece di riprodurre l’intera demo: sguardo verso cursore/tocco, battiti, sonno, risveglio, occhiolino e sorriso. [Ambiente web e limiti del confronto con Cycles](../../docs/ambiente-3d.md), [volto e runtime](../../docs/volto.md).

## controlli ed espressioni

`logo_root` sposta l’intero modello; `testa` controlla orientamento e inclinazione. `sguardo_sx` e `sguardo_dx` spostano le pupille. Palpebre: shape key `chiusura` e `apertura`; pupille: `chiusura`; bocca: `sorriso_ampio`. Valori 0–1.

Blender: fronte −Y, alto +Z. GLB: fronte +Z, alto +Y. Per animare manualmente le forme in Blender, silenziare prima le tracce NLA.

La demo della lavorazione precedente conserva queste clip:

| clip | fotogrammi |
|---|---|
| sguardo | 1–72 |
| battito | 73–86 |
| occhiolino | 87–114 |
| sorriso | 115–154 |
| sonno | 155–202 |
| respiro_sonno | 203–250 |
| risveglio | 251–290 |

## lavorazione e rigenerazione precedente

Le forme partono dalle nove mesh del logo originale. Palpebre chiuse, normali ricalcolate, Bevel a tre segmenti e Subdivision Surface a due livelli, applicati prima delle shape key. Naso con Bevel a quattro segmenti e normali ponderate. Metallo neutro ruvido, roughness prevalentemente 0,5–0,65, metallic 1, micrograffi e grana. Questa procedura riguarda la prima lavorazione; non sostituisce le luci/ambiente personalizzati della V2.

Dalla cartella `sorgenti/logo-3d/`, usare Blender in background in questo ordine:

1. `--factory-startup --background Logo3DAnimabile_originale.blend --python scripts/build_logo.py`
2. `--factory-startup --background Logo3DAnimabile_MetalloGrezzo.blend --python scripts/refine_logo.py`
3. `--factory-startup --background Logo3DAnimabile_MetalloGrezzo.blend --python scripts/finalize_logo.py`
4. `node scripts/prepare_web.mjs` per ripristinare la posa neutra e far partire ogni clip da zero nell’export precedente.
5. Comprimere con glTF Transform mantenendo gerarchia e mesh separate, con gli stessi flag mostrati per la V2.

Il primo script legge ancora il file originale dal Desktop: adattare il percorso prima di rigenerare su un altro computer. Gli script della lavorazione precedente salvano la relativa scena e possono sovrascrivere gli export; usarli consapevolmente. Il terzo genera anche i frame dell’anteprima video e può richiedere alcuni minuti.

[Anteprima locale della demo precedente](http://127.0.0.1:5173/sorgenti/logo-3d/anteprime/preview.html), con server Vite attivo. Usa la GLB precedente e l’HDRI; non è una riproduzione della scena V2 e non esiste nel sito pubblicato.

## fonti e licenze

- [Metal032 — ambientCG / Lennart Demes](https://ambientcg.com/a/Metal032), [licenza CC0](https://docs.ambientcg.com/license/). Mappe rielaborate e combinate con grana generata, colore neutralizzato.
- [Studio Small 08 — Poly Haven / Sergej Majboroda](https://polyhaven.com/a/studio_small_08), [licenza CC0](https://polyhaven.com/license). HDRI conservata per sorgenti e demo precedente, non caricata dalla home V2.

Download del 27 settembre 2026. Crediti anche in `../../public/volto/crediti.txt`.
