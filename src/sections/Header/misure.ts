// misure della “tavola” dell’header, nelle stesse coordinate del volto (vedi geometria.ts).
// stanno in un file a parte perché le usano anche l’header e il portfolio.
import { ASSE, VIEWBOX } from '@/components/volto/geometria'

export const ID_MATITA = 'tratto-matita'

const L = VIEWBOX.larghezza
const CX = ASSE
const CY = 88

/** la finestra del browser (fase 4) e la card in cui si trasforma */
export const FINESTRA = { x: -75, y: -62, w: L + 150, h: 304, r: 10 }
// raggio ≈ 16px quando il volto è largo 26vmin
export const CARTA = { x: CX - 112, y: CY - 140, w: 224, h: 280, r: 17 }
