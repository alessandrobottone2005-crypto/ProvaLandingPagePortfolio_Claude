// scroll fluido: una sola istanza di lenis, sincronizzata con il ticker di gsap (claude.md §3).
import Lenis from 'lenis'
import { media, movimento } from '@/config/movimento'
import { gsap, ScrollTrigger } from './gsap'

let lenis: Lenis | null = null
// creata al caricamento del modulo: tra le liste di media query è la prima a ricevere il cambio di
// preferenza, quindi legge la posizione prima che le sezioni rifacciano pin e altezze
const mqRidotto = typeof matchMedia === 'function' ? matchMedia(media.ridotto) : null

/** la sezione in vista (e, nel portfolio, se si sta usando il computer) */
function sezioneInVista() {
  const computer = ScrollTrigger.getById('portfolio-computer')
  if (computer && scrollY >= computer.start && scrollY <= computer.end) return 'portfolio'
  let trovata = 'header'
  for (const id of ['header', 'portfolio', 'chi-sono', 'contatti']) {
    const el = document.getElementById(id)
    if (el && el.getBoundingClientRect().top <= innerHeight / 2) trovata = id
  }
  return trovata
}

/** riporta alla sezione dopo che pin e altezze sono stati ricalcolati */
function tornaA(id: string) {
  let y = 0
  const computer = mqRidotto?.matches ? undefined : ScrollTrigger.getById('portfolio-computer')
  // il palco del computer (inizio della discesa) misurato nel DOM: vale anche prima che ScrollTrigger ricalcoli
  const palco = document.querySelector('#portfolio > div')
  if (id === 'portfolio' && computer && palco) {
    // con il movimento pieno: davanti allo schermo acceso, a metà della sosta (come il link diretto)
    const { avvicinamento, sosta } = movimento.computer
    y = palco.getBoundingClientRect().top + scrollY + (avvicinamento + sosta / 2) * (innerHeight / 100)
  } else if (id === 'contatti') y = document.documentElement.scrollHeight - innerHeight
  else if (id !== 'header') y = (document.getElementById(id)?.getBoundingClientRect().top ?? 0) + scrollY
  y = Math.max(0, Math.round(y))
  if (lenis) {
    // lenis aggiorna l’altezza della pagina in ritardo: senza questo taglierebbe il salto alla vecchia misura
    lenis.resize()
    lenis.scrollTo(y, { immediate: true, force: true })
  } else scrollTo(0, y)
  if (id === 'portfolio' && computer) {
    computer.update()
    computer.getTween()?.progress(1)
  }
}

export function avviaScroll() {
  if ('scrollRestoration' in history) history.scrollRestoration = 'manual'
  const mq = mqRidotto ?? matchMedia(media.ridotto)
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
  // cambiando la preferenza a sito aperto le sezioni cambiano forma: si resta nella stessa sezione
  // (le sezioni si rimontano e le scene arrivano in modo pigro: per un attimo si riporta a ogni refresh e a ogni
  // cambio d’altezza della pagina)
  let meta: string | null = null
  let scadenza = 0
  const riporta = () => {
    if (meta) tornaA(meta)
  }
  const osserva = new ResizeObserver(riporta)
  const smetti = () => {
    clearTimeout(scadenza)
    ScrollTrigger.removeEventListener('refresh', riporta)
    osserva.disconnect()
    meta = null
  }
  const cambia = () => {
    smetti()
    if (!document.documentElement.classList.contains('scroll-fermo')) {
      meta = sezioneInVista()
      scadenza = window.setTimeout(smetti, 1500)
      ScrollTrigger.addEventListener('refresh', riporta)
      osserva.observe(document.body)
    }
    aggiorna()
  }
  aggiorna()
  mq.addEventListener('change', cambia)
  return () => {
    mq.removeEventListener('change', cambia)
    smetti()
    spegni()
  }
}

/** blocca lo scroll della pagina (preloader) */
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
