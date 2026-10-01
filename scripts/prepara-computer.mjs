// prepara il computer del portfolio per il sito (claude.md §16):
// sorgenti/computer/Computer.glb (originale, non si tocca) → public/computer/computer.glb
// texture webp al massimo 1024px e geometrie compresse con meshopt.
// il rettangolo del vetro su cui si posa l’interfaccia è in src/components/computer/inquadratura.ts (VETRO):
// se cambi modello, rimisuralo con una vista frontale in blender.
import { execFileSync } from 'node:child_process'
import { mkdirSync, statSync } from 'node:fs'
import { join } from 'node:path'

const radice = join(import.meta.dirname, '..')
const originale = join(radice, 'sorgenti', 'computer', 'Computer.glb')
const destinazione = join(radice, 'public', 'computer', 'computer.glb')
const gltfTransform = join(radice, 'node_modules', '.bin', 'gltf-transform')

mkdirSync(join(radice, 'public', 'computer'), { recursive: true })
execFileSync(
  gltfTransform,
  ['optimize', originale, destinazione, '--compress', 'meshopt', '--texture-compress', 'webp', '--texture-size', '1024'],
  { stdio: 'inherit' },
)
const mb = (f) => (statSync(f).size / 1024 / 1024).toFixed(2)
console.log(`\ncomputer pronto: ${mb(originale)} MB → ${mb(destinazione)} MB`)
if (statSync(destinazione).size > 2 * 1024 * 1024) console.warn('attenzione: il modello web supera 2 MB')
