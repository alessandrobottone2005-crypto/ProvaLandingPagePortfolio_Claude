// icone del sito (figma: iconset_atoms): instagram, behance, email, linkedin a 16, 20 e 24px.
// i file svg di figma restano intatti in src/assets/icone/; qui diventano una maschera
// riempita con il colore del testo (currentColor), così seguono gli stati dei bottoni.
import type { CSSProperties } from 'react'

export type TipoIcona = 'instagram' | 'behance' | 'email' | 'linkedin'
export type MisuraIcona = 16 | 20 | 24

const file = import.meta.glob<string>('../../assets/icone/*.svg', { eager: true, query: '?url', import: 'default' })

// larghezza × altezza di ogni file (dagli attributi width e height degli svg di figma)
const MISURE: Record<TipoIcona, Record<MisuraIcona, [number, number]>> = {
  instagram: { 16: [16, 16], 20: [20, 20], 24: [24, 24] },
  linkedin: { 16: [16, 16], 20: [20, 20], 24: [24, 24] },
  behance: { 16: [16, 15], 20: [20, 19], 24: [24, 23] },
  email: { 16: [16, 13], 20: [20, 16], 24: [24, 19] },
}

type Props = {
  tipo: TipoIcona
  misura?: MisuraIcona
  className?: string
}

export function Icona({ tipo, misura = 24, className }: Props) {
  const url = file[`../../assets/icone/${tipo}-${misura}.svg`]
  const [larghezza, altezza] = MISURE[tipo][misura]
  const maschera = `url("${url}") center / contain no-repeat`
  const stile: CSSProperties = { width: larghezza, height: altezza, mask: maschera, WebkitMask: maschera }
  return <span aria-hidden="true" className={'inline-block shrink-0 bg-current ' + (className ?? '')} style={stile} />
}
