// scroll fluido: una sola istanza di lenis, sincronizzata con il ticker di gsap (claude.md §3).
import Lenis from 'lenis'
import { media, movimento } from '@/config/movimento'
import { gsap, ScrollTrigger } from './gsap'

let lenis: Lenis | null = null

export function avviaScroll() {
  if ('scrollRestoration' in history) history.scrollRestoration = 'manual'

  // con movimento ridotto niente lenis: scroll nativo del browser
  if (matchMedia(media.ridotto).matches) return () => {}

  lenis = new Lenis({ lerp: movimento.lenis.lerp, smoothWheel: true, syncTouch: false })
  lenis.on('scroll', ScrollTrigger.update)
  // se lo scroll era già stato fermato (il preloader parte prima di lenis), resta fermo
  if (document.documentElement.classList.contains('scroll-fermo')) lenis.stop()
  const tick = (time: number) => lenis?.raf(time * 1000)
  gsap.ticker.add(tick)
  gsap.ticker.lagSmoothing(0)

  return () => {
    gsap.ticker.remove(tick)
    lenis?.destroy()
    lenis = null
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
