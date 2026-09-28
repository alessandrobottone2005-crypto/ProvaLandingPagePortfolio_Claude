// Spirale su desktop, tablet e mobile; griglia immediata con movimento ridotto.
// La sovrapposizione mantiene il logo al centro nel passaggio dall’header.
import { useEffect, useRef, useState } from 'react'
import { media } from '@/config/movimento'
import { sito } from '@/config/sito'
import { gsap, ScrollTrigger, useGSAP } from '@/lib/gsap'
import { Spirale } from './Spirale'
import { Griglia } from './Griglia'

type Modo = 'spirale' | 'griglia'

const calcolaModo = (): Modo => (matchMedia(media.ridotto).matches ? 'griglia' : 'spirale')

function useModo() {
  const [modo, setModo] = useState<Modo>(calcolaModo)
  useEffect(() => {
    const preferenza = matchMedia(media.ridotto)
    const cambia = () => setModo(calcolaModo())
    preferenza.addEventListener('change', cambia)
    return () => preferenza.removeEventListener('change', cambia)
  }, [])
  return modo
}

export function Portfolio() {
  const modo = useModo()
  const sezione = useRef<HTMLElement>(null)
  const contenuto = useRef<HTMLDivElement>(null)
  const sovrapposto = modo !== 'griglia'

  // finché lo scroll non arriva alla fine dell’header la sezione (che gli sta sopra) resta invisibile e non si tocca
  useGSAP(
    () => {
      const el = contenuto.current!
      if (!sovrapposto) {
        gsap.set(el, { clearProps: 'opacity,pointerEvents' })
        return
      }
      const aggiorna = (st: ScrollTrigger) => {
        const visibile = st.scroll() >= st.start - 1
        el.style.opacity = visibile ? '' : '0'
        el.style.pointerEvents = visibile ? '' : 'none'
      }
      ScrollTrigger.create({
        trigger: sezione.current,
        start: 'top top',
        end: 'max',
        onToggle: aggiorna,
        onRefresh: aggiorna,
      })
    },
    { dependencies: [modo], revertOnUpdate: true },
  )

  // Cambiando la preferenza di movimento, le posizioni di scroll vanno ricalcolate.
  useEffect(() => {
    const id = requestAnimationFrame(() => ScrollTrigger.refresh())
    return () => cancelAnimationFrame(id)
  }, [modo])

  return (
    <section
      id="portfolio"
      ref={sezione}
      aria-labelledby="titolo-portfolio"
      className={`relative z-20 ${sovrapposto ? '-mt-[100svh]' : ''}`}
    >
      <h2 id="titolo-portfolio" className="sr-only">
        {sito.sezioni.portfolio}
      </h2>
      <div ref={contenuto} style={sovrapposto ? { opacity: 0, pointerEvents: 'none' } : undefined}>
        {modo === 'spirale' && <Spirale />}
        {modo === 'griglia' && <Griglia />}
      </div>
    </section>
  )
}
