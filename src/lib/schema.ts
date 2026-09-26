// schema di progetto.json (claude.md §9).
// usato sia dal sito sia dagli script e dalla build, così i controlli sono gli stessi ovunque.
import { z } from 'zod'
import { DISCIPLINE } from './dati.ts'

export { DISCIPLINE, fileUsati, SLUG_VALIDO } from './dati.ts'

const nomeFile = z
  .string({ error: 'deve essere il nome di un file' })
  .min(1, 'il nome del file è vuoto')
  .refine((f) => !f.includes('/') && !f.includes('\\'), 'metti il file nella cartella del progetto, senza sottocartelle')

const bloccoPdf = z.strictObject({
  tipo: z.literal('pdf'),
  file: nomeFile,
})

const bloccoImmagini = z.strictObject({
  tipo: z.literal('immagini'),
  file: z.union([nomeFile, z.array(nomeFile).min(1, 'serve almeno un’immagine')]),
  layout: z.enum(['piena', 'griglia']).default('piena'),
})

const bloccoModello3d = z.strictObject({
  tipo: z.literal('modello3d'),
  file: nomeFile,
})

const bloccoVideo = z
  .strictObject({
    tipo: z.literal('video'),
    file: nomeFile.optional(),
    url: z.url('l’indirizzo del video non è valido').optional(),
    poster: nomeFile.optional(),
    autoplay: z.boolean().default(false),
  })
  .refine((b) => Boolean(b.file) !== Boolean(b.url), 'un video vuole “file” oppure “url” (uno solo dei due)')

const bloccoTesto = z.strictObject({
  tipo: z.literal('testo'),
  testo: z.string().min(1, 'il testo è vuoto'),
})

const schemaBlocco = z.discriminatedUnion('tipo', [bloccoPdf, bloccoImmagini, bloccoModello3d, bloccoVideo, bloccoTesto], {
  error: 'tipo di blocco sconosciuto: usa pdf, immagini, modello3d, video o testo',
})

export const schemaProgetto = z.strictObject({
  titolo: z.string().min(1, 'il titolo è vuoto'),
  descrizione: z.string().min(1, 'la descrizione è vuota'),
  discipline: z
    .array(z.enum(DISCIPLINE, { error: `disciplina sconosciuta: usa ${DISCIPLINE.join(', ')}` }))
    .min(1, 'serve almeno una disciplina'),
  anno: z.number().int().min(2000).max(2100),
  cliente: z.string().optional(),
  ordine: z.number().optional(),
  pubblicato: z.boolean().default(true),
  copertina: nomeFile,
  blocchi: z.array(schemaBlocco).default([]),
})

export type DatiProgetto = z.infer<typeof schemaProgetto>
/** progetto.json così come è scritto (i campi con un valore predefinito possono mancare) */
export type DatiProgettoScritti = z.input<typeof schemaProgetto>
export type DatiBlocco = z.infer<typeof schemaBlocco>
export type Disciplina = (typeof DISCIPLINE)[number]

/** trasforma gli errori di zod in frasi leggibili, in italiano */
export function spiegaErrori(slug: string, errore: z.ZodError): string {
  return errore.issues
    .map((i) => {
      const dove = i.path.length ? ` (campo “${i.path.join('.')}”)` : ''
      let messaggio = i.message
      if (i.code === 'invalid_type' && i.input === undefined) messaggio = 'campo mancante'
      if (i.code === 'unrecognized_keys') messaggio = `campo non previsto: ${i.keys.join(', ')}`
      return `progetto "${slug}"${dove}: ${messaggio}`
    })
    .join('\n')
}
