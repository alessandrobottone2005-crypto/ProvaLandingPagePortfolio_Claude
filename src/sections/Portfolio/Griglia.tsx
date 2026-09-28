// Griglia in flusso normale dopo la spirale; subito visibile con movimento ridotto.
import { useEffect, useRef, useState } from 'react'
import { ScrollTrigger } from '@/lib/gsap'
import { progetti } from '@/lib/progetti'
import { getLenis } from '@/lib/scroll'
import { CardProgetto } from './CardProgetto'

type Props = {
  abilitata?: boolean
  aperta?: string | null
  onAperta?: (slug: string | null) => void
}

export function Griglia({ abilitata = true, aperta, onAperta }: Props) {
  const [interna, setInterna] = useState<string | null>(null)
  const selezionata = aperta === undefined ? interna : aperta
  const scegli = onAperta ?? setInterna
  const frame = useRef(0)
  const aggiornaDimensioni = () => {
    cancelAnimationFrame(frame.current)
    frame.current = requestAnimationFrame(() => {
      const focus = document.activeElement instanceof HTMLElement ? document.activeElement : null
      getLenis()?.resize()
      ScrollTrigger.refresh()
      // Il refresh del pin reinserisce il palco nel DOM e può perdere il focus della tastiera.
      if (focus && focus !== document.body && focus.isConnected && !focus.closest('[inert]')) focus.focus({ preventScroll: true })
    })
  }

  useEffect(() => () => cancelAnimationFrame(frame.current), [])

  return (
    <ul data-griglia-progetti inert={!abilitata} aria-hidden={!abilitata} className="portfolio-griglia">
      {progetti.map((p, i) => (
        <li key={p.slug}>
          <CardProgetto
            progetto={p}
            prima={i === 0}
            aperta={abilitata && selezionata === p.slug}
            onToggle={() => scegli(selezionata === p.slug ? null : p.slug)}
            onChiudi={() => scegli(null)}
            onDimensioni={aggiornaDimensioni}
          />
        </li>
      ))}
    </ul>
  )
}
