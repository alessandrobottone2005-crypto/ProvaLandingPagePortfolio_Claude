// sezione portfolio (claude.md §6.3–6.4): anello su desktop e tablet, pila su mobile,
// griglia a due colonne con movimento ridotto.
// con l’anello e la pila la sezione si sovrappone all’ultima schermata dell’header (margine negativo):
// così la card finale dell’header diventa, senza stacchi, la prima card del portfolio.
import { useEffect, useRef, useState } from 'react'
import { media } from '@/config/movimento'
import { sito } from '@/config/sito'
import { gsap, ScrollTrigger, useGSAP } from '@/lib/gsap'
import { Anello } from './Anello'
import { Griglia } from './Griglia'
import { Pila } from './Pila'

type Modo = 'anello' | 'pila' | 'griglia'

const calcolaModo = (): Modo => (matchMedia(media.ridotto).matches ? 'griglia' : matchMedia(media.anello).matches ? 'anello' : 'pila')

function useModo() {
  const [modo, setModo] = useState<Modo>(calcolaModo)
  useEffect(() => {
    const code = [matchMedia(media.ridotto), matchMedia(media.anello)]
    const cambia = () => setModo(calcolaModo())
    code.forEach((mq) => mq.addEventListener('change', cambia))
    return () => code.forEach((mq) => mq.removeEventListener('change', cambia))
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

  // cambiando modo (rotazione del tablet, preferenze) le posizioni di scroll vanno ricalcolate
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
      <div ref={contenuto} className={sovrapposto ? 'bg-nero' : ''} style={sovrapposto ? { opacity: 0, pointerEvents: 'none' } : undefined}>
        {modo === 'anello' && <Anello />}
        {modo === 'pila' && <Pila />}
        {modo === 'griglia' && <Griglia />}
      </div>
    </section>
  )
}
