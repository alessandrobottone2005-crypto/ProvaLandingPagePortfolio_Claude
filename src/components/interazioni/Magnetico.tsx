// involucro “magnetico”: il contenuto è attratto dal cursore quando ci passa sopra (claude.md §8).
// motion anima solo lo spostamento (x, y) di questo involucro: se il figlio è già animato da gsap
// o da motion su altre proprietà, non ci sono conflitti.
// solo con il mouse; con movimento ridotto resta fermo.
import { motion, useMotionValue, useReducedMotion, useSpring } from 'motion/react'
import { useEffect, useRef, useState, type PointerEvent, type ReactNode } from 'react'
import { media, movimento } from '@/config/movimento'

type Props = {
  children: ReactNode
  /** spostamento massimo in pixel */
  massimo?: number
  /** quanto segue il cursore, da 0 a 1 (frazione della distanza dal centro) */
  forza?: number
  className?: string
}

const molla = { stiffness: 220, damping: 18, mass: 0.6 }

export function Magnetico({ children, massimo = movimento.magnetismo.pulsanti, forza = 0.35, className }: Props) {
  const ridotto = useReducedMotion()
  const [mouse, setMouse] = useState(false)
  const box = useRef<HTMLDivElement>(null)
  const x = useSpring(useMotionValue(0), molla)
  const y = useSpring(useMotionValue(0), molla)

  useEffect(() => {
    const mq = matchMedia(media.mouse)
    const aggiorna = () => setMouse(mq.matches)
    aggiorna()
    mq.addEventListener('change', aggiorna)
    return () => mq.removeEventListener('change', aggiorna)
  }, [])

  const attivo = mouse && !ridotto

  const muovi = (e: PointerEvent) => {
    if (!attivo || e.pointerType !== 'mouse' || !box.current) return
    const r = box.current.getBoundingClientRect()
    // centro “a riposo”: si toglie lo spostamento già applicato
    const cx = r.left + r.width / 2 - x.get()
    const cy = r.top + r.height / 2 - y.get()
    const limita = (v: number) => Math.max(-massimo, Math.min(massimo, v))
    x.set(limita((e.clientX - cx) * forza))
    y.set(limita((e.clientY - cy) * forza))
  }
  const lascia = () => {
    x.set(0)
    y.set(0)
  }

  return (
    <motion.div ref={box} className={className} style={attivo ? { x, y } : undefined} onPointerMove={muovi} onPointerLeave={lascia}>
      {children}
    </motion.div>
  )
}
