// Barra dei menu del 1984: si apre con un clic, le voci si scelgono con mouse, tocco o frecce.
import { useEffect, useRef, useState, type KeyboardEvent, type ReactNode } from 'react'
import { sito } from '@/config/sito'
import { useVoltoPixel } from './voltoPixel'

export type Voce = { testo: string; azione: () => void; disattivata?: boolean; spuntata?: boolean }
export type Menu = { id: string; etichetta: string; titolo: ReactNode; voci: Voce[] }

export function BarraMenu({ menu }: { menu: Menu[] }) {
  const [aperto, setAperto] = useState<string | null>(null)
  const barra = useRef<HTMLDivElement>(null)

  // clic fuori dalla barra: le tendine si chiudono
  useEffect(() => {
    if (!aperto) return
    const fuori = (e: PointerEvent) => {
      if (!barra.current?.contains(e.target as Node)) setAperto(null)
    }
    document.addEventListener('pointerdown', fuori, true)
    return () => document.removeEventListener('pointerdown', fuori, true)
  }, [aperto])

  const voci = (id: string) => [...(barra.current?.querySelectorAll<HTMLButtonElement>(`[data-tendina="${id}"] [role^="menuitem"]:not(:disabled)`) ?? [])]
  const titoloDi = (id: string) => barra.current?.querySelector<HTMLButtonElement>(`[data-titolo="${id}"]`)

  const apri = (id: string, primaVoce: boolean) => {
    setAperto(id)
    if (primaVoce) requestAnimationFrame(() => voci(id)[0]?.focus())
  }
  const chiudi = (id: string) => {
    setAperto(null)
    titoloDi(id)?.focus()
  }

  const tastiTitolo = (e: KeyboardEvent, i: number) => {
    const m = menu[i]
    if (e.key === 'ArrowDown' || e.key === 'Enter' || e.key === ' ') {
      e.preventDefault()
      apri(m.id, true)
    } else if (e.key === 'ArrowRight' || e.key === 'ArrowLeft') {
      e.preventDefault()
      const altro = menu[(i + (e.key === 'ArrowRight' ? 1 : menu.length - 1)) % menu.length]
      titoloDi(altro.id)?.focus()
      if (aperto) setAperto(altro.id)
    }
  }
  const tastiTendina = (e: KeyboardEvent, id: string) => {
    const elenco = voci(id)
    const i = elenco.indexOf(document.activeElement as HTMLButtonElement)
    if (e.key === 'ArrowDown' || e.key === 'ArrowUp') {
      e.preventDefault()
      elenco[(i + (e.key === 'ArrowDown' ? 1 : elenco.length - 1)) % elenco.length]?.focus()
    } else if (e.key === 'Escape') {
      e.preventDefault()
      e.stopPropagation()
      chiudi(id)
    } else if (e.key === 'Tab') setAperto(null)
  }

  // esc con una tendina aperta chiude solo la tendina, anche se il focus è sul titolo
  const tastiBarra = (e: KeyboardEvent) => {
    if (e.key !== 'Escape' || !aperto) return
    e.preventDefault()
    e.stopPropagation()
    chiudi(aperto)
  }

  return (
    <div ref={barra} className="mac-barra" onKeyDown={tastiBarra}>
      {menu.map((m, i) => (
        <div key={m.id} className="mac-menu">
          <button
            type="button"
            data-titolo={m.id}
            aria-haspopup="menu"
            aria-expanded={aperto === m.id}
            aria-label={m.etichetta}
            className="mac-menu-titolo"
            onClick={() => (aperto === m.id ? setAperto(null) : apri(m.id, false))}
            onPointerEnter={(e) => e.pointerType === 'mouse' && aperto && aperto !== m.id && setAperto(m.id)}
            onKeyDown={(e) => tastiTitolo(e, i)}
          >
            {m.titolo}
          </button>
          {aperto === m.id && (
            <div role="menu" aria-label={m.etichetta} data-tendina={m.id} className="mac-tendina" onKeyDown={(e) => tastiTendina(e, m.id)}>
              {m.voci.map((v) => (
                <button
                  key={v.testo}
                  type="button"
                  role={v.spuntata === undefined ? 'menuitem' : 'menuitemradio'}
                  aria-checked={v.spuntata}
                  disabled={v.disattivata}
                  className="mac-voce"
                  onClick={() => {
                    setAperto(null)
                    titoloDi(m.id)?.focus()
                    v.azione()
                  }}
                >
                  <span aria-hidden="true" className="mac-spunta">
                    {v.spuntata ? '✓' : ''}
                  </span>
                  {v.testo}
                </button>
              ))}
            </div>
          )}
        </div>
      ))}
    </div>
  )
}

/** primo titolo della barra: il volto pixel al posto della mela */
export function TitoloVolto() {
  const volto = useVoltoPixel(20)
  return volto ? <img src={volto} alt="" width={20} height={20} className="mac-volto-menu" /> : <span className="sr-only">{sito.computer.menu.volto}</span>
}
