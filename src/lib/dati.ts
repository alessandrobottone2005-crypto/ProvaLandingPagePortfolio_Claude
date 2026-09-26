// parti dello schema dei progetti che non dipendono da zod: le usa anche il sito, senza scaricare zod
// (i progetti sono già controllati da zod in build e nel terminale di sviluppo, vedi scripts/valida-progetti.ts).
import type { DatiProgetto } from './schema.ts'

export const DISCIPLINE = ['branding', 'illustrazione', '3d', 'web design'] as const

/** l’indirizzo del progetto deriva dal nome della cartella */
export const SLUG_VALIDO = /^[a-z0-9]+(?:-[a-z0-9]+)*$/

/** tutti i file citati da un progetto (copertina e blocchi) */
export function fileUsati(p: DatiProgetto): string[] {
  const usati = [p.copertina]
  for (const b of p.blocchi) {
    if (b.tipo === 'immagini') usati.push(...(Array.isArray(b.file) ? b.file : [b.file]))
    else if (b.tipo === 'video') {
      if (b.file) usati.push(b.file)
      if (b.poster) usati.push(b.poster)
    } else if (b.tipo !== 'testo') usati.push(b.file)
  }
  return usati
}
