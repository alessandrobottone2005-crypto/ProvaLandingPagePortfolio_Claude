# avatar del chi sono: video da google flow

> **stato (1 ottobre 2026):** il sito usa la bozza a nuvola di punti `Ologramma_Foto.jpeg` + `Ologramma_Video.mp4` (prompt in `avatar-punti/brief.md`): una sola clip verso sinistra, la destra è specchiata, su e giù sono una piccola inclinazione. Per cambiarla: nuovo video con lo stesso movimento al posto di `Ologramma_Video.mp4`, poi `npm run prepara-avatar`.
>
> Le istruzioni qui sotto (8 clip realistiche da `partenza.png`) sono il piano precedente, non usato: restano utili se un giorno si vuole il movimento completo in tutte le direzioni.

Servono **8 clip** in cui giri la testa in 8 direzioni, tutte generate partendo dalla **stessa immagine**. Nel sito il cursore sceglie il fotogramma: la testa segue il mouse in ogni direzione. L’effetto ologramma lo aggiungo io dopo, quindi le clip devono essere **pulite e realistiche**.

## 1. impostazioni in flow

- modalità **Frames to Video** (immagine come primo fotogramma). Carica come primo fotogramma `partenza.png` (in questa cartella). Non mettere un ultimo fotogramma.
- modello: Veo nella versione di qualità più alta che hai.
- formato **9:16 (verticale)**; durata 8 secondi.
- prova **2–4 varianti per prompt** e tieni la migliore.
- scarica alla risoluzione più alta disponibile (1080p se c’è). L’audio non serve.

## 2. come scegliere la clip buona

Scarta la clip se:
- la camera si muove, zooma o cambia inquadratura (deve restare **ferma**);
- il volto cambia (occhiali diversi, lineamenti diversi, denti strani);
- entrano mani, oggetti o testo, oppure lo sfondo non è nero;
- parli, chiudi gli occhi a lungo o il sorriso sparisce;
- la testa gira poco o troppo, oppure non si ferma alla fine.

Le spalle possono muoversi appena: va bene.

## 3. gli 8 prompt

Il testo è uguale in tutti; cambia solo la parte in **[parentesi]**. Copia tutto il blocco, sostituendo la direzione.

```
Use the uploaded image as the exact first frame. Same man, same glasses, same navy jacket and white polo, same open smile showing teeth. Pure black seamless background, soft frontal key light, thin white rim light on hair and shoulders. Locked-off static camera: no zoom, no pan, no camera movement, no cuts. During the first 5 seconds he slowly and smoothly turns only his head to look [DIREZIONE], eyes following the same direction, shoulders almost still; then he holds perfectly still for the last 3 seconds. Keep the open smile the whole time. No talking, no blinking, no hand movement, no text, no music.
```

| file da salvare | [DIREZIONE] da incollare |
|---|---|
| `avatar-sinistra.mp4` | toward the left edge of the frame (his right side), about 35 degrees |
| `avatar-destra.mp4` | toward the right edge of the frame (his left side), about 35 degrees |
| `avatar-su.mp4` | slightly upward, tilting his chin up about 20 degrees |
| `avatar-giu.mp4` | slightly downward, tilting his chin down about 20 degrees |
| `avatar-su-sinistra.mp4` | up and toward the left edge of the frame (his right side), about 30 degrees sideways and 15 degrees up |
| `avatar-su-destra.mp4` | up and toward the right edge of the frame (his left side), about 30 degrees sideways and 15 degrees up |
| `avatar-giu-sinistra.mp4` | down and toward the left edge of the frame (his right side), about 30 degrees sideways and 15 degrees down |
| `avatar-giu-destra.mp4` | down and toward the right edge of the frame (his left side), about 30 degrees sideways and 15 degrees down |

«sinistra» e «destra» sono sempre **dello schermo**: in `avatar-sinistra` la testa si gira verso il lato sinistro del video.

## 4. consegna

Metti gli 8 file `.mp4`, con questi nomi, in questa cartella (`sorgenti/foto/flow/`) e dimmelo. Se una direzione proprio non viene, mandami le altre: la si può ricavare mescolando le vicine.

Poi preparo io i fotogrammi con `npm run prepara-avatar` e li collego al sito.
