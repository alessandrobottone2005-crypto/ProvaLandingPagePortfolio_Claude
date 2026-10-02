// lettere che diventano più pesanti vicino al cursore (claude.md §8):
// l’asse “wght” di outfit va da 300 a circa 600 in base alla distanza.
// su touch succede lo stesso nel punto in cui si tocca.
import { useEffect, useRef } from 'react'
import { media } from '@/config/movimento'
import { gsap } from '@/lib/gsap'

type Props = {
  testo: string
  className?: string
  /** peso a riposo e peso massimo */
  pesoMin?: number
  pesoMax?: number
  /** classe per ogni lettera (serve per animarle da fuori) */
  classeLettera?: string
}

export function NomePesoVariabile({ testo, className, pesoMin = 300, pesoMax = 600, classeLettera = '' }: Props) {
  const radice = useRef<HTMLSpanElement>(null)

  useEffect(() => {
    // peso fisso (nome in metallo): niente effetto
    if (pesoMin === pesoMax) return
    const mm = gsap.matchMedia()
    mm.add(media.normale, () => {
      const lettere = gsap.utils.toArray<HTMLElement>('[data-lettera]', radice.current)
      const peso = lettere.map((l) => gsap.quickTo(l, 'fontWeight', { duration: 0.5, ease: 'power3.out' }))

      const muovi = (e: PointerEvent) => {
        const raggio = Math.max(innerWidth * 0.18, 140)
        lettere.forEach((l, i) => {
          const r = l.getBoundingClientRect()
          const d = Math.hypot(e.clientX - (r.left + r.width / 2), e.clientY - (r.top + r.height / 2))
          const t = Math.max(0, 1 - d / raggio)
          peso[i](pesoMin + (pesoMax - pesoMin) * t * t)
        })
      }
      const esci = () => peso.forEach((p) => p(pesoMin))
      const alzato = (e: PointerEvent) => e.pointerType !== 'mouse' && esci()

      addEventListener('pointermove', muovi, { passive: true })
      addEventListener('pointerdown', muovi, { passive: true })
      addEventListener('pointerup', alzato)
      document.documentElement.addEventListener('mouseleave', esci)
      return () => {
        removeEventListener('pointermove', muovi)
        removeEventListener('pointerdown', muovi)
        removeEventListener('pointerup', alzato)
        document.documentElement.removeEventListener('mouseleave', esci)
      }
    })
    return () => mm.revert()
  }, [pesoMin, pesoMax, testo])

  return (
    <span ref={radice} className={className}>
      {[...testo].map((l, i) => (
        // la maschera è un po’ più alta della riga, così le lettere non vengono tagliate
        <span key={i} className="-my-[0.15em] inline-block overflow-hidden py-[0.15em] align-top">
          <span data-lettera data-carattere={l} className={`inline-block ${classeLettera}`} style={{ fontWeight: pesoMin }}>
            {l}
            {/* segna la linea di base: il nome in metallo ci appoggia la sua lettera */}
            <i data-base className="inline-block h-0 w-0" />
          </span>
        </span>
      ))}
    </span>
  )
}
