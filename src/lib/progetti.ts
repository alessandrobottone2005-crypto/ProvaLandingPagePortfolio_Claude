// legge da solo tutti i progetti in src/content/progetti (claude.md §9).
// per aggiungere un progetto basta creare una cartella: nessun codice da toccare.
import { fileUsati } from './dati'
import type { DatiBlocco, DatiProgetto, DatiProgettoScritti, Disciplina } from './schema'

const json = import.meta.glob<unknown>('/src/content/progetti/*/progetto.json', { eager: true, import: 'default' })
const file = import.meta.glob<string>('/src/content/progetti/*/*.{webp,avif,jpg,jpeg,png,gif,pdf,glb,gltf,mp4,webm}', {
  eager: true,
  query: '?url',
  import: 'default',
})

export type Blocco =
  | { tipo: 'pdf'; file: string }
  | { tipo: 'immagini'; file: string[]; layout: 'piena' | 'griglia' }
  | { tipo: 'modello3d'; file: string }
  | { tipo: 'video'; file?: string; url?: string; poster?: string; autoplay: boolean }
  | { tipo: 'testo'; testo: string }

export type Progetto = {
  slug: string
  titolo: string
  descrizione: string
  discipline: Disciplina[]
  anno: number
  cliente?: string
  ordine?: number
  copertina: string
  /** versione piccola per la card, se esiste (creata da npm run prepara-progetti) */
  copertinaCard?: string
  blocchi: Blocco[]
}

/**
 * valori predefiniti dei campi facoltativi. i progetti sono già controllati da zod in build
 * (e nel terminale durante lo sviluppo): qui non serve ripetere il controllo, così zod non si scarica nel sito.
 */
function completa(g: DatiProgettoScritti): DatiProgetto {
  return {
    ...g,
    pubblicato: g.pubblicato ?? true,
    blocchi: (g.blocchi ?? []).map((b): DatiBlocco => {
      if (b.tipo === 'immagini') return { ...b, layout: b.layout ?? 'piena' }
      if (b.tipo === 'video') return { ...b, autoplay: b.autoplay ?? false }
      return b
    }),
  }
}

// in sviluppo, se un progetto.json non va, l’errore compare anche nella console del browser
if (import.meta.env.DEV) {
  void import('./schema').then(({ schemaProgetto, spiegaErrori }) => {
    for (const [percorso, grezzo] of Object.entries(json)) {
      const esito = schemaProgetto.safeParse(grezzo)
      if (!esito.success) console.error(spiegaErrori(percorso.split('/').at(-2)!, esito.error))
    }
  })
}

function leggi(): Progetto[] {
  const errori: string[] = []
  const tutti: Progetto[] = []

  for (const [percorso, grezzo] of Object.entries(json)) {
    const slug = percorso.split('/').at(-2)!
    // come nella validazione: le cartelle che iniziano con "_" non sono progetti
    if (slug.startsWith('_')) continue
    const dati = completa(grezzo as DatiProgettoScritti)
    if (!dati.pubblicato) continue
    const url = (nome: string) => file[`/src/content/progetti/${slug}/${nome}`]
    const mancanti = fileUsati(dati).filter((f) => !url(f))
    if (mancanti.length) {
      errori.push(...mancanti.map((f) => `progetto "${slug}": manca il file "${f}"`))
      continue
    }

    const blocchi = dati.blocchi.map((b: DatiBlocco): Blocco => {
      switch (b.tipo) {
        case 'immagini':
          return { ...b, file: (Array.isArray(b.file) ? b.file : [b.file]).map(url) }
        case 'video':
          return { ...b, file: b.file && url(b.file), poster: b.poster && url(b.poster) }
        case 'testo':
          return b
        default:
          return { ...b, file: url(b.file) }
      }
    })

    tutti.push({
      slug,
      titolo: dati.titolo,
      descrizione: dati.descrizione,
      discipline: dati.discipline,
      anno: dati.anno,
      cliente: dati.cliente,
      ordine: dati.ordine,
      copertina: url(dati.copertina),
      copertinaCard: url(dati.copertina.replace(/(\.[a-z0-9]+)$/i, '-card.webp')),
      blocchi,
    })
  }

  if (errori.length) throw new Error(errori.join('\n'))

  // prima quelli con “ordine” (dal più basso), poi i più recenti per anno
  return tutti.sort((a, b) => {
    if (a.ordine !== undefined && b.ordine !== undefined) return a.ordine - b.ordine
    if (a.ordine !== undefined) return -1
    if (b.ordine !== undefined) return 1
    return b.anno - a.anno || a.slug.localeCompare(b.slug)
  })
}

export const progetti = leggi()

export function trovaProgetto(slug: string | undefined) {
  return progetti.find((p) => p.slug === slug)
}
