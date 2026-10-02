// discipline visibili nel sito (claude.md §6.2 e §6.4).
// web design è spento finché non ci sono progetti: metti true per riattivare la sua fase nell’header
// (finestra del browser disegnata attorno al logo) e la sua cartella nel computer. il codice è già tutto pronto.
import type { Disciplina } from '../lib/schema.ts'

export const webDesignAttivo = false

/** cartelle del computer e fasi dell’header, nello stesso ordine */
export const disciplineVisibili: Disciplina[] = ['illustrazione', 'branding', '3d', ...(webDesignAttivo ? (['web design'] as const) : [])]
