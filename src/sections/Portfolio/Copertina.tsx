// Copertina condivisa dalla spirale e dalla griglia.
import type { Progetto } from '@/lib/progetti'

type PropsCopertina = {
  progetto: Progetto
  prima?: boolean
  sizes: string
}

/** Copertina sempre a colori. */
export function Copertina({ progetto, prima, sizes }: PropsCopertina) {
  const srcSet = progetto.copertinaCard ? `${progetto.copertinaCard} 900w, ${progetto.copertina} 2400w` : undefined
  const comuni = {
    srcSet,
    sizes,
    alt: '',
    loading: prima ? ('eager' as const) : ('lazy' as const),
    decoding: 'async' as const,
    draggable: false,
  }
  return <img src={progetto.copertinaCard ?? progetto.copertina} {...comuni} data-copertina-card className="absolute inset-0 h-full w-full object-cover" />
}
