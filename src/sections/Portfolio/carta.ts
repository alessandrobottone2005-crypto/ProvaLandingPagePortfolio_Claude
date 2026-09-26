// pezzi comuni alle tre versioni del portfolio (anello, pila, griglia):
// misure della card, testi, apertura del progetto. (la copertina è in Copertina.tsx)
import type { MouseEvent } from 'react'
import { useLocation, useNavigate } from 'react-router'
import { volto as misure } from '@/config/movimento'
import { VIEWBOX } from '@/components/volto/geometria'
import type { Progetto } from '@/lib/progetti'
import { CARTA } from '@/sections/Header/misure'

// la card frontale ha la stessa misura e posizione della card con cui finisce l’header:
// la card dell’header è disegnata nelle coordinate del volto, che sullo schermo è largo `volto.header`.
const scala = (unita: number) => `calc(${misure.header} * ${unita / VIEWBOX.larghezza})`
export const cartaLarghezza = scala(CARTA.w)
export const cartaAltezza = scala(CARTA.h)
/** di quanto il centro della card dell’header sta sotto (o sopra) il centro dello schermo */
export const cartaScostamentoY = scala(CARTA.y + CARTA.h / 2 - VIEWBOX.altezza / 2)

/** le stesse misure in pixel, lette dal browser (servono ai calcoli delle animazioni) */
export function cartaInPixel() {
  const prova = document.createElement('div')
  prova.style.cssText = `position:absolute;visibility:hidden;pointer-events:none;width:${misure.header}`
  document.body.appendChild(prova)
  const s = prova.offsetWidth / VIEWBOX.larghezza
  prova.remove()
  return { w: CARTA.w * s, h: CARTA.h * s, scostamentoY: (CARTA.y + CARTA.h / 2 - VIEWBOX.altezza / 2) * s }
}

export const doppie = (n: number) => String(n).padStart(2, '0')

/** testo accessibile del link: titolo, discipline e anno */
export const testoCard = (p: Progetto) => `${p.titolo}, ${p.discipline.join(', ')}, ${p.anno}`

/**
 * apre il pannello del progetto passando anche il rettangolo della copertina sullo schermo
 * (il pannello lo usa per l’espansione). con ctrl/cmd/clic centrale il link si comporta da link normale.
 */
export function useApriProgetto() {
  const navigate = useNavigate()
  const location = useLocation()
  return (e: MouseEvent<HTMLAnchorElement> | null, slug: string, link: HTMLElement | null) => {
    if (e && (e.metaKey || e.ctrlKey || e.shiftKey || e.altKey || e.button !== 0)) return
    e?.preventDefault()
    const img = link?.querySelector<HTMLElement>('[data-copertina-card]')
    const r = img?.getBoundingClientRect()
    navigate(`/progetti/${slug}`, {
      state: { sfondo: location, origine: r ? { x: r.left, y: r.top, w: r.width, h: r.height } : undefined },
    })
  }
}
