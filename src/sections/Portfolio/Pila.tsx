// portfolio su mobile (claude.md §6.4): niente anello, card impilate.
// ogni card si ferma al centro dello schermo (sticky) e la successiva ci scorre sopra,
// mentre quella sotto si rimpicciolisce e si scurisce. la card al centro è a colori, le altre in grigio.
// all’inizio la prima card parte dalla misura e dalla posizione della card finale dell’header (§6.3).
import { useRef, type CSSProperties } from 'react'
import { Link } from 'react-router'
import { movimento } from '@/config/movimento'
import { gsap, useGSAP } from '@/lib/gsap'
import { progetti } from '@/lib/progetti'
import { cartaInPixel, testoCard, useApriProgetto } from './carta'
import { Copertina } from './Copertina'

const P = movimento.portfolio

// misure della pila in css: larghezza della card, altezza (copertina 4:5 + didascalia), posizione sticky
const variabili = {
  '--pila-w': 'min(calc(100vw - 2rem), calc((100svh - 9rem) * 0.8))',
  '--pila-h': 'calc(var(--pila-w) * 1.25 + 3.25rem)',
  '--pila-top': 'calc((100svh - var(--pila-h)) / 2)',
} as CSSProperties

export function Pila() {
  const radice = useRef<HTMLUListElement>(null)
  const apri = useApriProgetto()

  useGSAP(
    () => {
      const q = gsap.utils.selector(radice)
      const voci = q<HTMLElement>('[data-voce]')
      const interni = q<HTMLElement>('[data-interno]')
      const colori = q<HTMLElement>('[data-colore]')
      const scuri = q<HTMLElement>('[data-scuro]')
      const alto = () => parseFloat(getComputedStyle(voci[0]).top) || 0
      const scrub = movimento.scrub.mobile

      // tutte in grigio tranne la prima, che arriva a colori dall’header
      gsap.set(colori.slice(1), { opacity: 0 })

      // ingresso: la prima card cresce dalla card dell’header alla misura della pila
      const ingresso = q('[data-ingresso]')[0]
      const didascalia = q('[data-didascalia]')[0]
      const riquadro = q('[data-riquadro]')[0]
      if (ingresso && riquadro) {
        const misura = () => {
          const carta = cartaInPixel()
          const h = riquadro.offsetHeight
          return {
            scala: carta.w / riquadro.offsetWidth,
            y: innerHeight / 2 + carta.scostamentoY - (alto() + h / 2),
            origine: `50% ${h / 2}px`,
          }
        }
        let m = misura()
        gsap
          .timeline({
            scrollTrigger: {
              trigger: radice.current,
              start: 'top top',
              end: () => `+=${(P.pilaIngresso * innerHeight) / 100}`,
              scrub,
              invalidateOnRefresh: true,
              onRefresh: () => (m = misura()),
            },
          })
          .fromTo(
            ingresso,
            { scale: () => m.scala, y: () => m.y, transformOrigin: () => m.origine },
            { scale: 1, y: 0, ease: 'power2.inOut', duration: 1 },
            0,
          )
          .fromTo(didascalia, { opacity: 0 }, { opacity: 1, duration: 0.5 }, 0.5)
      }

      // ogni card che arriva copre la precedente: quella sotto si rimpicciolisce, si scurisce e torna grigia
      for (let i = 1; i < voci.length; i++) {
        const passaggio = {
          trigger: voci[i],
          start: 'top bottom',
          end: () => `top ${alto()}px`,
          scrub,
          invalidateOnRefresh: true,
        }
        gsap
          .timeline({ defaults: { ease: 'none' }, scrollTrigger: passaggio })
          .to(colori[i], { opacity: 1, ease: 'power2.in' }, 0)
          .to(colori[i - 1], { opacity: 0, ease: 'power2.in' }, 0)
          .to(interni[i - 1], { scale: P.pilaScala }, 0)
          .to(scuri[i - 1], { opacity: P.pilaScuro }, 0)
      }
    },
    { scope: radice },
  )

  return (
    <ul ref={radice} className="relative px-4 pb-[20svh]" style={{ ...variabili, paddingTop: 'var(--pila-top)' }}>
      {progetti.map((p, i) => (
        <li
          key={p.slug}
          data-voce
          className="sticky mx-auto mb-[30svh] bg-nero last:mb-0"
          style={{ top: 'var(--pila-top)', width: 'var(--pila-w)', height: 'var(--pila-h)' }}
        >
          <div data-ingresso={i === 0 ? '' : undefined} className="h-full">
            <div data-interno className="h-full origin-center">
              <Link
                to={`/progetti/${p.slug}`}
                data-card-slug={p.slug}
                onClick={(e) => apri(e, p.slug, e.currentTarget)}
                className="group block rounded-card transition-transform duration-300 ease-entrata active:scale-[0.98]"
              >
                <span data-riquadro={i === 0 ? '' : undefined} className="relative block aspect-4/5 overflow-hidden rounded-card border border-grigio bg-nero">
                  <Copertina progetto={p} prima={i === 0} sizes="100vw" />
                </span>
                <span data-didascalia={i === 0 ? '' : undefined} aria-hidden="true" className="flex min-h-12 items-baseline justify-between gap-3 pt-3 text-etichetta cifre-tabellari">
                  <span className="truncate">{p.titolo}</span>
                  <span className="flex shrink-0 gap-3">
                    <span>{p.discipline.join(', ')}</span>
                    <span>{p.anno}</span>
                  </span>
                </span>
                <span className="sr-only">{testoCard(p)}</span>
              </Link>
            </div>
          </div>
        </li>
      ))}
    </ul>
  )
}
