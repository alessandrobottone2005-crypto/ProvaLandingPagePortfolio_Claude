// testo che “rotola”: quando cambia, le lettere vecchie salgono e quelle nuove arrivano dal basso.
// usato per le etichette che cambiano (fasi dell’header, contatori, titoli sotto l’anello).
import { AnimatePresence, motion, useReducedMotion } from 'motion/react'

type Props = { testo: string; className?: string }

const ease = [0.16, 1, 0.3, 1] as const

export function TestoCheRotola({ testo, className }: Props) {
  const ridotto = useReducedMotion()
  return (
    <span className={`relative inline-flex overflow-hidden align-bottom ${className ?? ''}`}>
      {/* testo vero per gli screen reader; le lettere animate sono solo decorative */}
      <span className="sr-only">{testo}</span>
      <AnimatePresence mode="popLayout" initial={false}>
        <motion.span key={testo} aria-hidden="true" className="inline-flex whitespace-pre">
          {[...testo].map((lettera, i) => (
            <motion.span
              key={i}
              className="inline-block"
              initial={ridotto ? { opacity: 0 } : { y: '110%' }}
              animate={ridotto ? { opacity: 1 } : { y: '0%' }}
              exit={ridotto ? { opacity: 0 } : { y: '-110%' }}
              transition={{ duration: ridotto ? 0.2 : 0.5, ease, delay: ridotto ? 0 : i * 0.018 }}
            >
              {lettera}
            </motion.span>
          ))}
        </motion.span>
      </AnimatePresence>
    </span>
  )
}
