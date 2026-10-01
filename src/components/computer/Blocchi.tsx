// i blocchi del progetto, nell’ordine di progetto.json, dentro la finestra del computer (claude.md §6.5).
// ogni tipo si scarica solo quando serve (react.lazy): pdf, 3d e video pesano parecchio.
import { Component, lazy, Suspense, type ReactNode } from 'react'
import type { Blocco } from '@/lib/progetti'

const Pdf = lazy(() => import('./blocchi/Pdf'))
const Modello3D = lazy(() => import('./blocchi/Modello3D'))
const Video = lazy(() => import('./blocchi/Video'))
const Immagini = lazy(() => import('./blocchi/Immagini'))
const Testo = lazy(() => import('./blocchi/Testo'))

/** spazio d’attesa mentre il blocco si scarica: stessa forma del blocco, così la pagina non salta */
function Attesa({ forma }: { forma: string }) {
  return <div aria-hidden="true" className={`${forma} animate-pulse rounded-card border border-grigio motion-reduce:animate-none`} />
}

/** se un blocco si rompe, il resto della finestra continua a funzionare */
class Confine extends Component<{ children: ReactNode }, { rotto: boolean }> {
  state = { rotto: false }
  static getDerivedStateFromError() {
    return { rotto: true }
  }
  componentDidCatch(errore: unknown) {
    console.warn('blocco del progetto non disponibile:', errore)
  }
  render() {
    return this.state.rotto ? <Attesa forma="aspect-video animate-none" /> : this.props.children
  }
}

function Contenuto({ blocco, titolo }: { blocco: Blocco; titolo: string }) {
  switch (blocco.tipo) {
    case 'pdf':
      return <Pdf file={blocco.file} titolo={titolo} />
    case 'modello3d':
      return <Modello3D file={blocco.file} titolo={titolo} />
    case 'video':
      return <Video blocco={blocco} titolo={titolo} />
    case 'immagini':
      return <Immagini file={blocco.file} layout={blocco.layout} titolo={titolo} />
    case 'testo':
      return <Testo testo={blocco.testo} />
  }
}

const FORME: Record<Blocco['tipo'], string> = {
  pdf: 'aspect-[4/3]',
  modello3d: 'aspect-4/5 md:aspect-video',
  video: 'aspect-video',
  immagini: 'aspect-video',
  testo: 'h-24',
}

export function Blocchi({ blocchi, titolo }: { blocchi: Blocco[]; titolo: string }) {
  return blocchi.map((blocco, i) => (
    <Confine key={i}>
      <Suspense fallback={<Attesa forma={FORME[blocco.tipo]} />}>
        <Contenuto blocco={blocco} titolo={titolo} />
      </Suspense>
    </Confine>
  ))
}
