# Revisione della Fase A — da leggere prima della Fase B

29 settembre 2026. Greybox controllata: misure, stazioni, camere, lame, cilindro libero e budget sono corretti. Prima di iniziare la Fase B applica queste correzioni alla greybox, rifai le anteprime in `anteprime/greybox/` e fermati di nuovo per l’approvazione.

## 1. Spirale — priorità alta

La torre di blocchi sta dietro al volto, al centro dell’inquadratura (`03_spirale_orbita_050`, `05_spirale_campo_lungo`, `08_spirale_frontale`). I blocchi grigi grandi competono con le 20 copertine a colori e il volto di metallo scuro sul cemento grigio quasi sparisce.

- Sposta i blocchi sfalsati sulle pareti del pozzo, ai lati dell’inquadratura; non dietro al volto.
- Dietro al volto lascia un fondo scuro e uniforme (verso #141414), con una lama di luce dall’alto che cade sul volto.
- Il cilindro libero (raggio 5 u, Z −17…+17) resta obbligatorio.
- Campo lungo: nessun bordo del modello visibile. Oggi le passerelle laterali e il pavimento finiscono di colpo ai lati; chiudili con pareti o prolungali fuori campo.

## 2. Header

Gli archi in alto a destra sono troppo chiari: lì compare il nome fisso del sito. Scurisci quella zona; la luce sul volto al centro e il ritmo degli archi vanno bene.

## 3. Telefono — il limite segnalato non esiste

Il sito misura il volto in pixel rispetto allo schermo, non in unità fisse. Su telefono (390×844) il volto è più piccolo:

| stazione | larghezza del volto su telefono |
|---|---|
| header | ≈ 2,5 u |
| spirale | ≈ 1,2 u |
| biografia | piccolo in alto a sinistra durante il passaggio, poi affianca il testo |
| contatti | ≈ 2,4 u |

Rifai le anteprime mobile scalando le copie del logo a queste misure (solo per le render mobile). Le camere restano invariate.

## 4. Biografia

Va bene così. Al massimo una lama leggera sopra il volto a sinistra; la metà destra deve restare scura e uniforme.

## 5. Contatti

Ottima, da conservare. Mantieni scura la fascia bassa dove compaiono pulsanti e copyright.

## Nota

I riferimenti sono stati tolti da `public/`: fa fede la copia in `ispirazioni/`. Restano valide tutte le regole del prompt (`prompt-chatgpt-blender.md`).
