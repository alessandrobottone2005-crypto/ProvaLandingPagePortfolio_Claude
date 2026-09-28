// misure della “tavola” dell’header, nelle stesse coordinate del volto (vedi geometria.ts).
// Condivise tra la timeline dell’header e il suo disegno SVG.
import { VIEWBOX } from '@/components/volto/geometria'

export const ID_MATITA = 'tratto-matita'

const L = VIEWBOX.larghezza

/** La finestra del browser nella fase web dell’header. */
export const FINESTRA = { x: -75, y: -62, w: L + 150, h: 304, r: 10 }
