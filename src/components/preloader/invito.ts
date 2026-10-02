// avanzamento delle lettere di «scorri per esplorare» nel preloader
import { gsap } from '@/lib/gsap'

/** lettere visibili in proporzione al disegno del volto (0–1) */
export function scriviInvito(radice: Element | null, p: number) {
  const lettere = radice?.querySelectorAll('[data-invito-lettera]')
  if (!lettere) return
  const n = lettere.length
  lettere.forEach((l, i) => {
    const t = gsap.utils.clamp(0, 1, (p - (i / n) * 0.8) / 0.2)
    gsap.set(l, { yPercent: 110 * (1 - gsap.parseEase('power3.out')(t)) })
  })
}
