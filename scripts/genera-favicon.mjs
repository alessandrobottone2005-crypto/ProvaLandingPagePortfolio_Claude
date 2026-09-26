// npm run genera-favicon
// crea le favicon del volto (sveglio e addormentato) dalla stessa geometria del componente <Volto />.
import { writeFileSync } from 'node:fs'
import { join } from 'node:path'
import sharp from 'sharp'
import { APERTURA, svgStatico } from '../src/components/volto/geometria.ts'

const cartella = join(import.meta.dirname, '..', 'public', 'volto')
const sfondo = '#141414'

const sveglio = svgStatico({ apertura: APERTURA.naturale, sfondo })
const dorme = svgStatico({ apertura: APERTURA.dorme, sfondo })

writeFileSync(join(cartella, 'favicon.svg'), sveglio)
writeFileSync(join(cartella, 'favicon-dorme.svg'), dorme)
// per safari e ios, che preferiscono un png
await sharp(Buffer.from(sveglio)).resize(180).png().toFile(join(cartella, 'apple-touch-icon.png'))

console.log('favicon create in public/volto/')
