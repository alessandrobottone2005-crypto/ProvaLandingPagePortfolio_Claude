# sala di cemento

`Ambiente.glb` è il modello originale (18 MB, Sketchfab): una sala di cemento 20 × 29 m con pilastri, mensole e una fessura di luce nel soffitto. Ha la luce già dipinta in un’unica texture e un finto specchio d’acqua (sala capovolta sotto il pavimento). Non va modificato dagli script.

## come si rigenera

```sh
# 1. scena realistica, anteprime Cycles, cottura della luce (≈ 3 minuti su GPU Metal), esportazione
/Applications/Blender.app/Contents/MacOS/Blender -b --python sorgenti/sala/scripts/prepara_sala.py -- costruisci anteprime cuoci esporta
# 2. versione web in public/sala/ (≈ 4,6 MB) e punti del racconto in src/components/volto/stazioniSala.json
npm run prepara-sala
```

Passi di `prepara_sala.py` (si possono lanciare anche uno alla volta):

- `costruisci`: toglie il finto specchio, scala ×2,5 (la sala diventa 50 × 72 × 23 u), pavimento nuovo, UV «cemento» (proiezione in metri) e «luce» (per la cottura), cemento PBR CC0 reso quasi grigio verso la palette, pavimento con chiazze bagnate (rugosità bassa), sole stretto dalla fessura e cielo grigio. Salva `Sala_Realistica.blend`.
- `stazioni`: riscrive soltanto i punti del racconto (header, computer, biografia, contatti) senza ricuocere.
- `anteprime`: render Cycles delle stazioni in `anteprime/`.
- `cuoci`: luce diffusa (diretta + rimbalzi) cotta su pareti (4096) e pavimento (2048), ripulita con OIDN.
- `esporta`: `export/Sala_Web.glb` (UV0 cemento, UV1 luce) e lightmap in PNG con un fattore comune salvato in `stazioni.json`.

Il segnaposto del computer (cubo nascosto) sta dove la luce della fessura tocca il pavimento: lì il sito appoggia `Computer.glb`.

`export/*.exr`, `export/Sala_Web.glb` e `textures/` sono rigenerabili e non vanno su GitHub.

## materiali

Cemento di pareti e pavimento: pacchetto «Modular Concrete Interior» in `sorgenti/ambiente/assets_online/` (CC0, texture da texturehaven.com e cc0textures.com).

## licenza — da completare

Provenienza di `Ambiente.glb` sconosciuta (1 ottobre 2026). Lo stile (luce cotta, finto specchio, esportazione Sketchfab) è molto simile ai modelli di **abhayexe** su Sketchfab, alcuni CC BY 4.0 e altri «Free Standard», ma nessuno ha lo stesso numero di triangoli (≈ 2.100):

- [Brutalist Interior [Baked]](https://sketchfab.com/3d-models/brutalist-interior-baked-d1d02e42a87b41b18bd9bf4939f490a5) — CC BY 4.0
- [VR Room [Light Baked]](https://sketchfab.com/3d-models/vr-room-light-baked-4e4659da1542490dbfa3b3ca0d6bfd05) — CC BY 4.0
- [Brutalist Concrete Interior VR room | Baked](https://sketchfab.com/3d-models/brutalist-concrete-interior-vr-room-baked-2f520ab03fc649c0989c3aa1d3207349) — Free Standard
- [Brutalist Interior VR room [Baked]](https://sketchfab.com/3d-models/brutalist-interior-vr-room-baked-7781b7f1cfde42dabc613a5522f4d2b0) — Free Standard

Il 1 ottobre 2026 alessandro ha scelto di pubblicare comunque il sito con il credito segnaposto (rischio accettato). Da fare appena possibile: ritrovare la pagina esatta, scrivere autore, link e licenza in `src/config/sito.ts` (`computer.crediti.ambiente` e `ambienteLink`, visibili in «informazioni» nel computer) e aggiornare questa sezione. Finché mancano, la build avvisa.
