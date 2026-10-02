# originali dei progetti

Una cartella per progetto, con lo stesso slug di `src/content/progetti/`. Contiene i file pesanti originali che restano **solo sul disco**: la cartella è ignorata da git (tranne questo README) e da Vercel.

- `dai-tre-fuochi/`, `lorenzo/`, `serena-brancale/`: brand book pdf originali (21–157 MB). Nel sito c’è la versione compressa con `npm run comprimi-pdf -- <entrata> <uscita> [px] [qualità]`.
- `cuphead-mugman-art-toys/`: scena `.blend` e `.fbx` originali; `export/modello.glb` è l’esportazione di `scripts/blender/esporta-cuphead.py` (uguale a `src/content/progetti/cuphead-mugman-art-toys/_originali/modello.glb`, poi compressa da `npm run prepara-progetti`).

Guida: [come aggiungere un progetto](../../docs/come-aggiungere-un-progetto.md).
