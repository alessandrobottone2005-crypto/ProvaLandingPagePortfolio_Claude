// Aspetto condiviso dall’anello e dalla griglia: card di Figma 121:172.
// La copertina resta dinamica; le proporzioni sono 514×600, con immagine 452×524.
import type { Progetto } from '@/lib/progetti'
import { Copertina } from './Copertina'
import './portfolio.css'

type Props = { progetto: Progetto; prima?: boolean; sizes: string }

export function CardCopertina({ progetto, prima, sizes }: Props) {
  return (
    <span data-card-visuale className="card-visuale">
      <span data-cornice aria-hidden="true" className="card-cornice" />
      <span data-immagine className="card-immagine">
        <Copertina progetto={progetto} prima={prima} sizes={sizes} />
      </span>
    </span>
  )
}
