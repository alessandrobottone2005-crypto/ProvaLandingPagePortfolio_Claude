import { movimento } from '@/config/movimento'

export type PosaCard = { x: number; y: number; z: number; rx: number; ry: number; rz: number; larghezza: number; opacity: number }
export const cardImmersive: PosaCard[] = []

const morbido = (p: number, da: number, a: number) => {
  const t = Math.max(0, Math.min(1, (p - da) / (a - da)))
  return t * t * (3 - 2 * t)
}

// Un solo ritmo per camera, geometrie, volto e copia HTML. Nessuna dipendenza 3D nel bundle iniziale.
export function fasiSpirale(p: number) {
  const c = movimento.portfolio.spirale3d
  return {
    ritiro: morbido(p, 0, c.fineRitiro),
    distensione: morbido(p, c.fineRitiro, c.fineDistensione),
    frontale: morbido(p, c.fineRitiro, c.fineDistensione),
    dissolvenza: morbido(p, c.fineDistensione, 0.99999),
  }
}
