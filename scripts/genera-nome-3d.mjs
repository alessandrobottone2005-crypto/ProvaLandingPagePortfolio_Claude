// npm run genera-nome-3d
// dal ttf statico di outfit black (sorgenti/font/) estrae solo le lettere del nome e del cognome
// in un piccolo json di contorni che il sito estrude in 3d (src/components/nome/Nome3D.tsx).
// il parser opentype è quello già incluso in three-stdlib (dipendenza di drei).
import { readFileSync, writeFileSync } from 'node:fs'
import { join } from 'node:path'
import { TTFLoader } from 'three-stdlib'
import { sito } from '../src/config/sito.ts'

const radice = join(import.meta.dirname, '..')
const ttf = readFileSync(join(radice, 'sorgenti', 'font', 'Outfit-Black.ttf'))
const font = new TTFLoader().parse(ttf.buffer.slice(ttf.byteOffset, ttf.byteOffset + ttf.byteLength))

const lettere = [...new Set(`${sito.nome}${sito.cognome}`)]
const glyphs = Object.fromEntries(
  lettere.map((l) => {
    if (!font.glyphs[l]) throw new Error(`lettera mancante nel font: ${l}`)
    return [l, font.glyphs[l]]
  }),
)
const uscita = {
  glyphs,
  familyName: font.familyName,
  ascender: font.ascender,
  descender: font.descender,
  underlinePosition: font.underlinePosition,
  underlineThickness: font.underlineThickness,
  boundingBox: font.boundingBox,
  resolution: font.resolution,
  original_font_information: { copyright: 'Copyright 2021 The Outfit Project Authors · SIL Open Font License 1.1' },
}
const file = join(radice, 'public', 'nome', 'outfit-black-nome.json')
writeFileSync(file, JSON.stringify(uscita))
console.log(`${lettere.join('')} → public/nome/outfit-black-nome.json (${(JSON.stringify(uscita).length / 1024).toFixed(1)} kB)`)
