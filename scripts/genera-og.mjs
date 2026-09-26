// npm run genera-og
// crea public/og.png (1200×630): l’anteprima che compare quando il sito viene condiviso sui social.
// volto e nome su nero, dalla stessa geometria del componente <Volto />.
// il nome si scrive con outfit: serve il font installato sul computer (file .ttf).
import { existsSync } from 'node:fs'
import { homedir } from 'node:os'
import { join } from 'node:path'
import sharp from 'sharp'
import { svgStatico } from '../src/components/volto/geometria.ts'

const W = 1200
const H = 630
const FONT = [join(homedir(), 'Library/Fonts/Outfit-VariableFont_wght.ttf'), '/Library/Fonts/Outfit-VariableFont_wght.ttf'].find(existsSync)
if (!FONT) {
  console.error('manca il font outfit installato (Outfit-VariableFont_wght.ttf): installalo e rilancia')
  process.exit(1)
}

const volto = await sharp(Buffer.from(svgStatico())).resize(430).png().toBuffer()
const scrivi = (testo) =>
  sharp({ text: { text: `<span foreground="#c9c5c0" letter_spacing="-2000">${testo}</span>`, font: 'Outfit Light 64', fontfile: FONT, rgba: true, dpi: 150 } })
    .png()
    .toBuffer()
const [nome, cognome] = await Promise.all([scrivi('alessandro'), scrivi('bottone')])
const mNome = await sharp(nome).metadata()
const mCognome = await sharp(cognome).metadata()
const mVolto = await sharp(volto).metadata()

await sharp({ create: { width: W, height: H, channels: 3, background: '#141414' } })
  .composite([
    { input: nome, left: 64, top: 48 },
    { input: cognome, left: W - 64 - mCognome.width, top: H - 48 - mCognome.height },
    { input: volto, left: Math.round((W - mVolto.width) / 2), top: Math.round((H - mVolto.height) / 2) },
  ])
  .png()
  .toFile(join(import.meta.dirname, '..', 'public', 'og.png'))

console.log(`fatto: public/og.png (${W}×${H}) · nome ${mNome.width}px`)
