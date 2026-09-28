import { AnimatePresence, motion, useReducedMotion } from 'motion/react'
import { useId, useRef } from 'react'
import { Bottone } from '@/components/bottoni/Bottone'
import { movimento } from '@/config/movimento'
import { sito } from '@/config/sito'
import type { Progetto } from '@/lib/progetti'
import { testoCard, useApriProgetto } from './carta'
import { CardCopertina } from './CardCopertina'

type Props = {
  progetto: Progetto
  prima: boolean
  aperta: boolean
  onToggle: () => void
  onChiudi: () => void
  onDimensioni: () => void
}

export function CardProgetto({ progetto, prima, aperta, onToggle, onChiudi, onDimensioni }: Props) {
  const id = useId()
  const copertina = useRef<HTMLButtonElement>(null)
  const apri = useApriProgetto()
  const ridotto = useReducedMotion()

  const chiudi = () => {
    onChiudi()
    copertina.current?.focus({ preventScroll: true })
  }

  return (
    <article
      className="scheda-progetto"
      data-state={aperta ? 'tapped' : 'default'}
      onKeyDown={(e) => {
        if (e.key !== 'Escape' || !aperta) return
        e.preventDefault()
        e.stopPropagation()
        chiudi()
      }}
    >
      <div className="card-progetto">
        <button
          ref={copertina}
          type="button"
          data-card-slug={progetto.slug}
          data-cursore={aperta ? sito.etichette.chiudi : sito.portfolio.info}
          aria-label={testoCard(progetto)}
          aria-expanded={aperta}
          aria-controls={id}
          onClick={onToggle}
          className="card-progetto-apertura"
        >
          <CardCopertina progetto={progetto} prima={prima} sizes="(min-width: 1702px) 514px, (min-width: 1024px) 33vw, (min-width: 768px) 50vw, 100vw" />
        </button>

        {/* L’involucro resta montato per escludere dalla tastiera anche i controlli in uscita. */}
        <div id={id} inert={!aperta} aria-hidden={!aperta}>
          <AnimatePresence initial={false}>
            {aperta && (
              <motion.div
                key="informazioni"
                className="card-info-rivelazione"
                initial={{ height: 0, opacity: 0, marginTop: 0 }}
                animate={{ height: 'auto', opacity: 1, marginTop: '-3.89105cqw' }}
                exit={{ height: 0, opacity: 0, marginTop: 0 }}
                transition={{
                  duration: ridotto ? 0 : movimento.durata.standard,
                  ease: [0.16, 1, 0.3, 1],
                  opacity: { duration: ridotto ? movimento.durata.ridotta : movimento.durata.standard },
                }}
                onAnimationComplete={onDimensioni}
              >
                <div className="card-informazioni">
                  <div>
                    <h3 className="card-titolo">{progetto.titolo}</h3>
                    <div className="card-meta">
                      <p>{progetto.discipline.join(', ')}</p>
                      <p className="cifre-tabellari">{progetto.anno}</p>
                    </div>
                  </div>
                  <p className="card-descrizione">{progetto.descrizione}</p>
                  <div className="card-azioni">
                    <Bottone testo={sito.portfolio.esplora} magnete={4} onClick={() => apri(null, progetto.slug, copertina.current)} />
                    <Bottone testo={sito.etichette.chiudi} magnete={4} onClick={chiudi} />
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>
    </article>
  )
}
