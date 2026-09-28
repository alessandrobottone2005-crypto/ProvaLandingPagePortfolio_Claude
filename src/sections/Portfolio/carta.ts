// Testo accessibile delle card e apertura del pannello dalla griglia.
import type { MouseEvent } from 'react'
import { useLocation, useNavigate } from 'react-router'
import type { Progetto } from '@/lib/progetti'

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
