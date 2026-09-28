// scroll fluido: una sola istanza di lenis, sincronizzata con il ticker di gsap (claude.md §3).
import Lenis from 'lenis'
import { media, movimento } from '@/config/movimento'
import { gsap, ScrollTrigger } from './gsap'

let lenis: Lenis | null = null

export function avviaScroll() {
  if ('scrollRestoration' in history) history.scrollRestoration = 'manual'
  const mq = matchMedia(media.ridotto)
  const tick = (time: number) => lenis?.raf(time * 1000)
  const spegni = () => {
    gsap.ticker.remove(tick)
    lenis?.destroy()
    lenis = null
  }
  const aggiorna = () => {
    spegni()
    if (mq.matches) return
    lenis = new Lenis({ lerp: movimento.lenis.lerp, smoothWheel: true, syncTouch: false })
    lenis.on('scroll', ScrollTrigger.update)
    if (document.documentElement.classList.contains('scroll-fermo')) lenis.stop()
    gsap.ticker.add(tick)
    gsap.ticker.lagSmoothing(0)
  }
  aggiorna()
  mq.addEventListener('change', aggiorna)
  return () => {
    mq.removeEventListener('change', aggiorna)
    spegni()
  }
}

/** blocca lo scroll della pagina (preloader, pannello aperto) */
export function fermaScroll() {
  lenis?.stop()
  document.documentElement.classList.add('scroll-fermo')
}

export function riprendiScroll() {
  document.documentElement.classList.remove('scroll-fermo')
  lenis?.start()
}

export function getLenis() {
  return lenis
}

/** ricalcola le posizioni di scroll quando font e immagini sono pronti */
export function aggiornaDopoCaricamento() {
  document.fonts.ready.then(() => ScrollTrigger.refresh())
  if (document.readyState === 'complete') ScrollTrigger.refresh()
  else addEventListener('load', () => ScrollTrigger.refresh(), { once: true })
}
