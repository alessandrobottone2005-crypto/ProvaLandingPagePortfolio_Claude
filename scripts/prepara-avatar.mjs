// npm run prepara-avatar
// dal video a punti generato con Google Flow (sorgenti/foto/flow/Ologramma_Video.mp4) crea in public/avatar/:
// - giro.webp: i fotogrammi in cui la testa gira verso la sinistra dello schermo, in un atlante
//   (24 fotogrammi, 4×2 celle) con tre fotogrammi per cella (uno per canale R, G, B: sono in scala di grigi);
// - fermo.webp: il primo fotogramma, per movimento ridotto e riserva.
// la destra si ottiene nel sito specchiando gli stessi fotogrammi. serve ffmpeg; l’originale non viene toccato.
import { execFileSync } from 'node:child_process'
import { existsSync, mkdirSync, readdirSync, rmSync, statSync } from 'node:fs'
import { tmpdir } from 'node:os'
import { join } from 'node:path'
import sharp from 'sharp'

const RADICE = join(import.meta.dirname, '..')
const VIDEO = join(RADICE, 'sorgenti', 'foto', 'flow', 'Ologramma_Video.mp4')
const USCITA = join(RADICE, 'public', 'avatar')
// ritaglio 4:5 nel fotogramma 1080×1920: testa intera e spalle
const RITAGLIO = { left: 0, top: 60, width: 1080, height: 1350 }
const CELLA = { width: 540, height: 675 }
const GRIGLIA = { colonne: 4, righe: 2 }
const MASSIMO = GRIGLIA.colonne * GRIGLIA.righe * 3

if (!existsSync(VIDEO)) {
  console.error(`manca ${VIDEO}`)
  process.exit(1)
}
const lavoro = join(tmpdir(), `avatar-${process.pid}`)
mkdirSync(lavoro, { recursive: true })
mkdirSync(USCITA, { recursive: true })

// 1) tutti i fotogrammi, già in scala di grigi (toglie la leggera dominante blu)
execFileSync('ffmpeg', ['-v', 'error', '-i', VIDEO, '-an', '-vf', 'format=gray', join(lavoro, '%03d.png')])
const fotogrammi = readdirSync(lavoro).filter((f) => /^\d+\.png$/.test(f)).sort()

// 2) il picco della rotazione: tra il decimo fotogramma e la metà del video, quello in cui la testa quasi si ferma
// (dopo, nella bozza di Flow, la testa torna al centro)
const piccoli = await Promise.all(
  fotogrammi.map((f) => sharp(join(lavoro, f)).resize(135, 240).greyscale().raw().toBuffer()),
)
let picco = 10,
  minimo = Infinity
for (let i = 10; i < Math.min(piccoli.length - 1, Math.round(piccoli.length * 0.6)); i++) {
  let somma = 0
  for (let p = 0; p < piccoli[i].length; p++) somma += Math.abs(piccoli[i][p] - piccoli[i + 1][p])
  if (somma < minimo) {
    minimo = somma
    picco = i
  }
}
// distribuisce i fotogrammi 0 → picco nelle celle disponibili
const quanti = Math.min(MASSIMO, picco + 1)
const scelti = Array.from({ length: quanti }, (_, i) => Math.round((i * picco) / (quanti - 1)))
console.log(`picco al fotogramma ${picco}, ${quanti} fotogrammi nell’atlante`)

// 3) ritaglio, livelli (nero pieno sullo sfondo) e atlante a canali
const cella = (i) =>
  sharp(join(lavoro, fotogrammi[i]))
    .extract(RITAGLIO)
    .resize(CELLA.width, CELLA.height)
    .greyscale()
    .linear(1.15, -18)
    .raw()
    .toBuffer()
const W = CELLA.width * GRIGLIA.colonne,
  H = CELLA.height * GRIGLIA.righe
const atlante = Buffer.alloc(W * H * 3)
for (let k = 0; k < quanti; k++) {
  const dati = await cella(scelti[k])
  const posto = k % (GRIGLIA.colonne * GRIGLIA.righe),
    canale = Math.floor(k / (GRIGLIA.colonne * GRIGLIA.righe))
  const x0 = (posto % GRIGLIA.colonne) * CELLA.width,
    y0 = Math.floor(posto / GRIGLIA.colonne) * CELLA.height
  for (let y = 0; y < CELLA.height; y++)
    for (let x = 0; x < CELLA.width; x++) atlante[((y0 + y) * W + x0 + x) * 3 + canale] = dati[y * CELLA.width + x]
}
for (const vecchio of readdirSync(USCITA)) rmSync(join(USCITA, vecchio))
await sharp(atlante, { raw: { width: W, height: H, channels: 3 } })
  .webp({ quality: 80, smartSubsample: false })
  .toFile(join(USCITA, 'giro.webp'))
await sharp(await cella(0), { raw: { width: CELLA.width, height: CELLA.height, channels: 1 } })
  .webp({ quality: 86 })
  .toFile(join(USCITA, 'fermo.webp'))
rmSync(lavoro, { recursive: true })

let totale = 0
for (const f of readdirSync(USCITA).filter((f) => !f.startsWith('._'))) {
  const kb = statSync(join(USCITA, f)).size / 1024
  totale += kb
  console.log(`✓ public/avatar/${f}  ${kb.toFixed(0)} kB`)
}
if (totale > 1500) console.warn(`attenzione: avatar pesante (${totale.toFixed(0)} kB)`)
// da copiare in movimento.avatar.fotogrammi se cambia
console.log(`fotogrammi: ${quanti}`)
