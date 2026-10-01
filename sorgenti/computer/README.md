# computer del portfolio

`Computer.glb` è il modello originale (15 MB, sette parti: case, monitor, pannello, tastiera, tasti, mouse e cavo). Non va modificato dagli script: la copia per il sito si rigenera con

```sh
npm run prepara-computer
```

che scrive `public/computer/computer.glb` (texture WebP ≤ 1024 px, Meshopt; ≈ 1,1 MB).

## dove si usa

- `src/components/computer/inquadratura.ts`: posizione a terra nella sala di cemento, dove la luce della fessura tocca il pavimento (punto «computer» di `src/components/volto/stazioniSala.json`, scritto da `sorgenti/sala/scripts/prepara_sala.py`), scala ×4, rotazione e rettangolo del vetro (`VETRO`) misurato con una vista frontale in Blender. Lo stesso file proietta l’ingombro del monitor (`MONITOR`, mesh «monik2») per posare il volto dietro il computer. Se il modello cambia, vetro e monitor vanno rimisurati.
- `src/components/volto/ComputerNellaScena.tsx`: modello, bagliore del vetro e luce dello schermo.

## licenza — da completare

Il modello viene da Sketchfab con licenza **CC BY 4.0**: l’attribuzione è obbligatoria. Il link originale è andato perso (1 ottobre 2026) e una ricerca non ha trovato il modello con certezza. Il 1 ottobre 2026 alessandro ha scelto di pubblicare comunque il sito con i crediti segnaposto (rischio accettato). Da fare appena possibile:

1. ritrovare autore e pagina Sketchfab;
2. scriverli in `src/config/sito.ts` → `computer.crediti` (`modello` e `modelloLink`), che compaiono nella finestra «informazioni» del computer;
3. aggiornare questa sezione.

Se non si ritrovano, sostituire il modello con uno di provenienza certa.
