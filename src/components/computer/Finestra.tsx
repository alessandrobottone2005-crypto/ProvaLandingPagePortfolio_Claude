// Finestra del Finder 1984: barra del titolo a righe, casella di chiusura, trascinabile col mouse.
// Non modale: più finestre insieme, quella in primo piano ha le righe nel titolo.
import { useEffect, useId, useRef, type PointerEvent, type ReactNode } from 'react'
import { sito } from '@/config/sito'

export type Rettangolo = { x: number; y: number; larghezza: number; altezza: number }

type Props = {
  titolo: string
  rettangolo: Rettangolo
  davanti: boolean
  livello: number
  /** su schermi stretti la finestra occupa tutta la scrivania e non si trascina */
  piena: boolean
  /** da schermo a interfaccia: quanti pixel reali vale un pixel dell’interfaccia */
  scala: () => number
  onPrimoPiano: () => void
  onSposta: (x: number, y: number) => void
  onChiudi: () => void
  children: ReactNode
}

export function Finestra({ titolo, rettangolo, davanti, livello, piena, scala, onPrimoPiano, onSposta, onChiudi, children }: Props) {
  const id = useId()
  const ref = useRef<HTMLElement>(null)

  // aprendo la finestra il focus entra nella finestra
  // con un link diretto l’interfaccia può essere ancora nascosta (modello del computer in arrivo):
  // si riprova per qualche secondo, finché nessun altro elemento ha preso il focus
  useEffect(() => {
    let id = 0
    const prova = (volte: number) => {
      const el = ref.current
      el?.focus({ preventScroll: true })
      if (el && document.activeElement === document.body && volte > 0) id = requestAnimationFrame(() => prova(volte - 1))
    }
    prova(300)
    return () => cancelAnimationFrame(id)
  }, [])

  const trascina = (e: PointerEvent<HTMLDivElement>) => {
    if (piena || e.button !== 0 || (e.target as Element).closest('button')) return
    e.preventDefault()
    const el = e.currentTarget
    el.setPointerCapture(e.pointerId)
    const k = scala() || 1
    const inizio = { px: e.clientX, py: e.clientY, x: rettangolo.x, y: rettangolo.y }
    const muovi = (ev: globalThis.PointerEvent) => onSposta(inizio.x + (ev.clientX - inizio.px) / k, inizio.y + (ev.clientY - inizio.py) / k)
    const fine = () => {
      el.removeEventListener('pointermove', muovi)
      el.removeEventListener('pointerup', fine)
      el.removeEventListener('pointercancel', fine)
    }
    el.addEventListener('pointermove', muovi)
    el.addEventListener('pointerup', fine)
    el.addEventListener('pointercancel', fine)
  }

  return (
    <section
      ref={ref}
      role="dialog"
      aria-modal="false"
      aria-labelledby={id}
      tabIndex={-1}
      data-davanti={davanti || undefined}
      data-piena={piena || undefined}
      onPointerDownCapture={onPrimoPiano}
      onFocusCapture={onPrimoPiano}
      className="mac-finestra"
      style={
        piena
          ? { zIndex: livello }
          : { zIndex: livello, left: rettangolo.x, top: rettangolo.y, width: rettangolo.larghezza, height: rettangolo.altezza }
      }
    >
      <div className="mac-titolo" onPointerDown={trascina}>
        <button type="button" className="mac-chiudi" aria-label={sito.computer.chiudiFinestra(titolo)} onClick={onChiudi} />
        <h3 id={id}>{titolo}</h3>
      </div>
      <div className="mac-contenuto" data-lenis-prevent>
        {children}
      </div>
    </section>
  )
}
