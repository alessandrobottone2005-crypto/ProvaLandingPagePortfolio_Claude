// controlla tutte le cartelle in src/content/progetti.
// usato dalla build di vite e dagli script: se qualcosa non va, la build si ferma.
import { existsSync, readdirSync, readFileSync, statSync } from 'node:fs'
import { join } from 'node:path'
import { fileURLToPath } from 'node:url'
import { fileUsati, schemaProgetto, SLUG_VALIDO, spiegaErrori, type DatiProgetto } from '../src/lib/schema.ts'

export const CARTELLA_PROGETTI = fileURLToPath(new URL('../src/content/progetti', import.meta.url))

type ProgettoLetto = { slug: string; cartella: string; dati: DatiProgetto }

export function validaProgetti(): { progetti: ProgettoLetto[]; errori: string[] } {
  const progetti: ProgettoLetto[] = []
  const errori: string[] = []
  if (!existsSync(CARTELLA_PROGETTI)) return { progetti, errori }

  for (const slug of readdirSync(CARTELLA_PROGETTI).sort()) {
    const cartella = join(CARTELLA_PROGETTI, slug)
    if (slug.startsWith('.') || slug.startsWith('_') || !statSync(cartella).isDirectory()) continue

    if (!SLUG_VALIDO.test(slug)) {
      errori.push(`progetto "${slug}": il nome della cartella diventa l’indirizzo, usa solo lettere minuscole, numeri e trattini (es. "mio-progetto")`)
      continue
    }
    const percorsoJson = join(cartella, 'progetto.json')
    if (!existsSync(percorsoJson)) {
      errori.push(`progetto "${slug}": manca il file "progetto.json"`)
      continue
    }
    let grezzo: unknown
    try {
      grezzo = JSON.parse(readFileSync(percorsoJson, 'utf8'))
    } catch (e) {
      errori.push(`progetto "${slug}": "progetto.json" non è scritto correttamente (${(e as Error).message})`)
      continue
    }
    const esito = schemaProgetto.safeParse(grezzo)
    if (!esito.success) {
      errori.push(spiegaErrori(slug, esito.error))
      continue
    }
    // i progetti nascosti possono essere incompleti: i file si controllano quando li pubblichi
    if (esito.data.pubblicato) for (const file of fileUsati(esito.data)) {
      if (!existsSync(join(cartella, file))) errori.push(`progetto "${slug}": manca il file "${file}"`)
    }
    progetti.push({ slug, cartella, dati: esito.data })
  }
  return { progetti, errori }
}
