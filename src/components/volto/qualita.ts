// qualità adattiva della scena (claude.md §2 regola 7): stessa scena e stessi effetti su ogni dispositivo,
// ma se i fotogrammi non stanno nei 60fps scende la risoluzione interna (prima nebbia, poi riflesso, poi dpr).
// ?qualita=0..3 fissa un livello per le prove.

export type Livello = 0 | 1 | 2 | 3

export const LIVELLI = {
  3: { dpr: 1.5, nebbia: 0.5, passi: 32, riflesso: 768 },
  2: { dpr: 1.5, nebbia: 0.42, passi: 24, riflesso: 512 },
  1: { dpr: 1.25, nebbia: 0.33, passi: 20, riflesso: 384 },
  0: { dpr: 1, nebbia: 0.25, passi: 16, riflesso: 256 },
} as const satisfies Record<Livello, { dpr: number; nebbia: number; passi: number; riflesso: number }>

const fisso = new URLSearchParams(location.search).get('qualita')
const ascoltatori = new Set<(l: Livello) => void>()

export const qualita = {
  livello: (fisso !== null ? Math.max(0, Math.min(3, Number(fisso))) : 3) as Livello,
  bloccata: fisso !== null,
  imposta(l: number) {
    if (qualita.bloccata) return
    const nuovo = Math.max(0, Math.min(3, Math.round(l))) as Livello
    if (nuovo === qualita.livello) return
    qualita.livello = nuovo
    ascoltatori.forEach((fn) => fn(nuovo))
  },
  ascolta(fn: (l: Livello) => void) {
    ascoltatori.add(fn)
    return () => void ascoltatori.delete(fn)
  },
  get valori() {
    return LIVELLI[qualita.livello]
  },
}
