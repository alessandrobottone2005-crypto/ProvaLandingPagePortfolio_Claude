// prepara la sala di cemento per il sito (claude.md §16):
// sorgenti/sala/export (scritto da sorgenti/sala/scripts/prepara_sala.py in blender) → public/sala/
// - Sala_Web.glb: geometria + cemento pbr, texture webp ≤ 2048px, meshopt (UV della luce conservate: nessuna texture del file le usa)
// - luce_*.png: luce cotta (curva srgb, fattore in stazioni.json) → webp
// - stazioni.json → src/components/volto/stazioniSala.json (punti del racconto e fattore della luce)
import { execFileSync } from 'node:child_process'
import { copyFileSync, mkdirSync, readdirSync, statSync } from 'node:fs'
import { join } from 'node:path'
import sharp from 'sharp'

const radice = join(import.meta.dirname, '..')
const sorgente = join(radice, 'sorgenti', 'sala', 'export')
const pubblico = join(radice, 'public', 'sala')
const gltfTransform = join(radice, 'node_modules', '.bin', 'gltf-transform')

mkdirSync(pubblico, { recursive: true })
execFileSync(
  gltfTransform,
  ['optimize', join(sorgente, 'Sala_Web.glb'), join(pubblico, 'sala.glb'), '--compress', 'meshopt', '--texture-compress', 'webp', '--texture-size', '2048', '--join', 'false', '--flatten', 'false', '--simplify', 'false', '--prune-attributes', 'false'],
  { stdio: 'inherit' },
)
for (const [nome, lato] of [['sala', 4096], ['pavimento', 2048]])
  await sharp(join(sorgente, `luce_${nome}.png`)).resize(lato, lato).webp({ quality: 90, effort: 6 }).toFile(join(pubblico, `luce-${nome}.webp`))
copyFileSync(join(sorgente, 'stazioni.json'), join(radice, 'src', 'components', 'volto', 'stazioniSala.json'))

const kb = (f) => statSync(f).size / 1024
let totale = 0
for (const f of readdirSync(pubblico).filter((f) => !f.startsWith('._'))) {
  totale += kb(join(pubblico, f))
  console.log(`${f}: ${(kb(join(pubblico, f)) / 1024).toFixed(2)} MB`)
}
console.log(`\nsala pronta: ${(totale / 1024).toFixed(2)} MB in public/sala/`)
if (totale > 6 * 1024) console.warn('attenzione: la sala supera i 6 MB previsti')
