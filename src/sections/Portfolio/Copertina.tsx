// copertina delle card del portfolio (anello, pila, griglia)
import type { Ref } from 'react'
import type { Progetto } from '@/lib/progetti'

type PropsCopertina = {
  progetto: Progetto
  prima?: boolean
  /** larghezza della card sullo schermo, per scegliere l’immagine giusta */
  sizes: string
  refImmagine?: Ref<HTMLImageElement>
}

/**
 * copertina in due strati: sotto in scala di grigi, sopra a colori.
 * per passare dal grigio al colore si anima solo l’opacità dello strato a colori ([data-colore]),
 * e per scurirla l’opacità del velo nero ([data-scuro]): niente filtri ricalcolati a ogni fotogramma.
 */
export function Copertina({ progetto, prima, sizes, refImmagine }: PropsCopertina) {
  const srcSet = progetto.copertinaCard ? `${progetto.copertinaCard} 900w, ${progetto.copertina} 2400w` : undefined
  const comuni = {
    src: progetto.copertinaCard ?? progetto.copertina,
    srcSet,
    sizes,
    alt: '',
    loading: prima ? ('eager' as const) : ('lazy' as const),
    decoding: 'async' as const,
    draggable: false,
  }
  return (
    <>
      <img {...comuni} className="absolute inset-0 h-full w-full object-cover grayscale" />
      <img {...comuni} ref={refImmagine} data-colore data-copertina-card className="absolute inset-0 h-full w-full object-cover" />
      <span data-scuro aria-hidden="true" className="absolute inset-0 bg-nero opacity-0" />
    </>
  )
}

