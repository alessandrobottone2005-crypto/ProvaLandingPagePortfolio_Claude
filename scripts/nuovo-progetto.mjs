// npm run nuovo-progetto
// fa qualche domanda e crea la cartella del progetto con un progetto.json di partenza.
import { existsSync, mkdirSync, writeFileSync } from 'node:fs'
import { join } from 'node:path'
import { createInterface } from 'node:readline/promises'
import { stdin, stdout } from 'node:process'
import { DISCIPLINE, SLUG_VALIDO } from '../src/lib/schema.ts'
import { CARTELLA_PROGETTI } from './valida-progetti.ts'

const rl = createInterface({ input: stdin, output: stdout })
const chiedi = async (domanda, predefinito = '') => {
  const risposta = (await rl.question(predefinito ? `${domanda} (${predefinito}): ` : `${domanda}: `)).trim()
  return (risposta || predefinito).toLowerCase()
}

const creaSlug = (testo) =>
  testo
    .normalize('NFD')
    .replace(/[̀-ͯ]/g, '')
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')

console.log('\nnuovo progetto\n')

let titolo = ''
while (!titolo) titolo = await chiedi('titolo')

let slug = ''
while (!SLUG_VALIDO.test(slug) || existsSync(join(CARTELLA_PROGETTI, slug))) {
  if (slug) console.log(existsSync(join(CARTELLA_PROGETTI, slug)) ? '  esiste già un progetto con questo indirizzo' : '  usa solo lettere minuscole, numeri e trattini')
  slug = creaSlug(await chiedi('indirizzo (/progetti/…)', slug || creaSlug(titolo)))
}

const descrizione = await chiedi('breve descrizione (due o tre righe)')

console.log(`discipline: ${DISCIPLINE.map((d, i) => `${i + 1} ${d}`).join(' · ')}`)
let discipline = []
while (!discipline.length) {
  const scelte = (await chiedi('numeri separati da virgola', '1')).split(/[,\s]+/)
  discipline = [...new Set(scelte.map((n) => DISCIPLINE[Number(n) - 1]).filter(Boolean))]
}

let anno = NaN
while (!Number.isInteger(anno)) anno = Number(await chiedi('anno', String(new Date().getFullYear())))

const cliente = await chiedi('cliente (invio per nessuno)')
rl.close()

const progetto = {
  titolo,
  descrizione: descrizione || 'descrizione provvisoria.',
  discipline,
  anno,
  ...(cliente && { cliente }),
  pubblicato: false,
  copertina: 'copertina.webp',
  blocchi: [],
}

const cartella = join(CARTELLA_PROGETTI, slug)
mkdirSync(cartella, { recursive: true })
writeFileSync(join(cartella, 'progetto.json'), JSON.stringify(progetto, null, 2) + '\n')

console.log(`
fatto: src/content/progetti/${slug}/progetto.json

prossimi passi:
  1. metti nella cartella la copertina (copertina.jpg, .png o .webp) e gli altri file
  2. aggiungi i blocchi in progetto.json
  3. cambia "pubblicato" in true
  4. lancia npm run prepara-progetti
`)
