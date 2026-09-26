// npm run prepara-progetti
// controlla tutti i progetti e ottimizza i file:
// - immagini → webp, lato massimo 2400px, più una versione piccola della copertina per la card
// - modelli .glb compressi con gltf-transform
// - avvisi per pdf sopra 15mb e video sopra 25mb
// gli originali restano in una sottocartella "_originali" (non finisce nel sito).
import { execFileSync } from 'node:child_process'
import { existsSync, mkdirSync, readdirSync, readFileSync, renameSync, statSync, writeFileSync } from 'node:fs'
import { extname, join } from 'node:path'
import sharp from 'sharp'
import { CARTELLA_PROGETTI, validaProgetti } from './valida-progetti.ts'

const LATO_MAX = 2400
const LATO_CARD = 900
const MB = 1024 * 1024
const IMMAGINE = /\.(jpe?g|png|avif|tiff?|webp)$/i
const VIDEO = /\.(mp4|webm|mov|m4v)$/i
const gltfTransform = join(import.meta.dirname, '..', 'node_modules', '.bin', 'gltf-transform')

const avvisi = []
let ottimizzati = 0

const senzaEstensione = (f) => f.slice(0, -extname(f).length)
const giaFatto = (originali, file) =>
  existsSync(originali) && readdirSync(originali).some((o) => senzaEstensione(o) === senzaEstensione(file))

for (const slug of readdirSync(CARTELLA_PROGETTI).sort()) {
  const cartella = join(CARTELLA_PROGETTI, slug)
  if (slug.startsWith('.') || slug.startsWith('_') || !statSync(cartella).isDirectory()) continue
  const originali = join(cartella, '_originali')
  const rinominati = {}

  for (const file of readdirSync(cartella)) {
    const percorso = join(cartella, file)
    // salta i file nascosti (es. i "._" che macos crea sui dischi esterni)
    if (file.startsWith('.') || !statSync(percorso).isFile()) continue
    const peso = statSync(percorso).size

    if (IMMAGINE.test(file) && !file.endsWith('-card.webp') && !giaFatto(originali, file)) {
      mkdirSync(originali, { recursive: true })
      const originale = join(originali, file)
      renameSync(percorso, originale)
      const webp = `${senzaEstensione(file)}.webp`
      await sharp(originale)
        .rotate()
        .resize({ width: LATO_MAX, height: LATO_MAX, fit: 'inside', withoutEnlargement: true })
        .webp({ quality: 82 })
        .toFile(join(cartella, webp))
      if (webp !== file) rinominati[file] = webp
      ottimizzati++
      console.log(`  ${slug}: ${file} → ${webp}`)
    }

    if (/\.glb$/i.test(file) && !giaFatto(originali, file)) {
      mkdirSync(originali, { recursive: true })
      const originale = join(originali, file)
      renameSync(percorso, originale)
      execFileSync(gltfTransform, ['optimize', originale, percorso, '--compress', 'meshopt', '--texture-compress', 'webp'], { stdio: 'inherit' })
      ottimizzati++
      console.log(`  ${slug}: ${file} compresso (${(peso / MB).toFixed(1)}mb → ${(statSync(percorso).size / MB).toFixed(1)}mb)`)
    }

    if (/\.pdf$/i.test(file) && peso > 15 * MB) avvisi.push(`${slug}: il pdf "${file}" pesa ${(peso / MB).toFixed(0)}mb (consigliato sotto 15mb)`)
    if (VIDEO.test(file) && peso > 25 * MB) avvisi.push(`${slug}: il video "${file}" pesa ${(peso / MB).toFixed(0)}mb (consigliato sotto 25mb)`)
    if (/\.(mov|m4v)$/i.test(file)) avvisi.push(`${slug}: "${file}" va esportato in mp4 (h.264) per funzionare su tutti i browser`)
  }

  // aggiorna progetto.json se un’immagine ha cambiato estensione
  const percorsoJson = join(cartella, 'progetto.json')
  if (Object.keys(rinominati).length && existsSync(percorsoJson)) {
    let testo = readFileSync(percorsoJson, 'utf8')
    for (const [prima, dopo] of Object.entries(rinominati)) testo = testo.replaceAll(`"${prima}"`, `"${dopo}"`)
    writeFileSync(percorsoJson, testo)
  }

  // versione piccola della copertina per la card
  if (existsSync(percorsoJson)) {
    try {
      const { copertina } = JSON.parse(readFileSync(percorsoJson, 'utf8'))
      const sorgente = copertina && join(cartella, copertina)
      if (sorgente && existsSync(sorgente)) {
        const card = join(cartella, `${senzaEstensione(copertina)}-card.webp`)
        if (!existsSync(card) || statSync(card).mtimeMs < statSync(sorgente).mtimeMs) {
          await sharp(sorgente).resize({ width: LATO_CARD, withoutEnlargement: true }).webp({ quality: 80 }).toFile(card)
          ottimizzati++
        }
      }
    } catch {
      // l’errore nel json viene segnalato dal controllo qui sotto
    }
  }
}

const { progetti, errori } = validaProgetti()

console.log(`\n${ottimizzati ? `${ottimizzati} file ottimizzati` : 'nessun file da ottimizzare'}`)
if (avvisi.length) console.log(`\navvisi:\n${avvisi.map((a) => `  ${a}`).join('\n')}`)
if (errori.length) {
  console.error(`\nci sono problemi nei progetti:\n${errori.map((e) => `  ${e}`).join('\n')}\n`)
  process.exit(1)
}
const pubblicati = progetti.filter((p) => p.dati.pubblicato).length
console.log(`\ntutto a posto: ${progetti.length} progetti (${pubblicati} pubblicati)\n`)
