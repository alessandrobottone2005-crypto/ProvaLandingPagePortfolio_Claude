// npm run foto-palette -- percorso/della/foto.jpg
// converte la foto in bianco e nero mappato sulla palette:
// nero puro → #141414, bianco puro → #c9c5c0. l’originale non viene toccato.
import { existsSync, readdirSync } from 'node:fs'
import { basename, extname, join } from 'node:path'
import sharp from 'sharp'

const CARTELLA = join(import.meta.dirname, '..', 'src', 'assets', 'foto')
const NERO = [0x14, 0x14, 0x14]
const BIANCO = [0xc9, 0xc5, 0xc0]

let sorgente = process.argv[2]
if (!sorgente) {
  const trovate = existsSync(CARTELLA) ? readdirSync(CARTELLA).filter((f) => /\.(jpe?g|png|webp|tiff?|heic)$/i.test(f) && !f.includes('-palette')) : []
  if (trovate.length !== 1) {
    console.error(trovate.length ? `ci sono più foto in src/assets/foto: indica quale, es. npm run foto-palette -- src/assets/foto/${trovate[0]}` : 'metti la foto in src/assets/foto/ e rilancia')
    process.exit(1)
  }
  sorgente = join(CARTELLA, trovate[0])
}

const uscita = join(CARTELLA, `${basename(sorgente, extname(sorgente))}-palette.webp`)

// 1) bianco e nero (un solo canale)
const { data: grigi, info } = await sharp(sorgente)
  .rotate()
  .resize({ width: 2400, height: 2400, fit: 'inside', withoutEnlargement: true })
  .greyscale()
  .raw()
  .toBuffer({ resolveWithObject: true })

// 2) ogni grigio diventa un colore tra nero e bianco della palette:
// valore = nero + grigio × (bianco − nero) / 255
// (sharp non sa espandere un canale in tre con .linear(), quindi lo facciamo a mano)
const canali = info.channels
const pixel = info.width * info.height
const rgb = Buffer.alloc(pixel * 3)
for (let i = 0; i < pixel; i++) {
  const g = grigi[i * canali]
  for (let c = 0; c < 3; c++) rgb[i * 3 + c] = Math.round(NERO[c] + (g * (BIANCO[c] - NERO[c])) / 255)
}

const convertita = sharp(rgb, { raw: { width: info.width, height: info.height, channels: 3 } })
await convertita.clone().webp({ quality: 86 }).toFile(uscita)

// 3) una versione più piccola per i telefoni (il sito sceglie da solo quale scaricare, con srcset)
const piccola = uscita.replace(/\.webp$/, '-900.webp')
await convertita.clone().resize({ width: 900, withoutEnlargement: true }).webp({ quality: 84 }).toFile(piccola)

console.log(`fatto: ${uscita}\n       ${piccola}`)
