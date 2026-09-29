// Le timeline scrivono questi numeri; il Canvas unico li legge senza render React per fotogramma.
import { ScrollTrigger } from '@/lib/gsap'
import type { Punto } from './sguardo'
import { fasiSpirale } from './cardImmersive'

export const percorso = {
  header: { opacity: 0, rotazione: 0, scala: 1, luce: 0, inclinazione: 0 },
  spirale: { apertura: 0, giro: 0, piatta: 0 },
  biografia: { uscita: 0 },
  guarda: null as Punto | null,
  // 0 header → 1 spirale e griglia → 2 biografia → 3 contatti; scritto da leggiPosa.
  stazione: 0,
}

export const limita = (n: number) => Math.min(1, Math.max(0, n))
const mix = (a: number, b: number, t: number) => a + (b - a) * t
const morbido = (t: number) => t * t * (3 - 2 * t)
export const larghezzaLogoSpirale = () => Math.min(innerWidth * 0.42, innerHeight * 0.36, 380)
export const larghezzaLogoContatti = () => Math.min(innerWidth * 0.82, innerHeight * 0.76)

export function leggiPosa() {
  const w = document.documentElement.clientWidth,
    h = innerHeight
  const header = document.querySelector<HTMLElement>('[data-logo-header]')?.getBoundingClientRect()
  const c = percorso.header
  const posa = { x: w / 2, y: h / 2, larghezza: larghezzaLogoSpirale(), rotazione: -12, opacity: 1, fase: 'spirale' }
  const spirale = ScrollTrigger.getById('portfolio-anello')
  const inPortfolio = spirale && scrollY >= spirale.start - 1
  if (!inPortfolio) {
    percorso.stazione = 0
    if (!header) return { ...posa, opacity: 0 }
    return {
      x: header.left + header.width / 2,
      y: header.top + header.height / 2,
      larghezza: header.width * c.scala,
      rotazione: c.rotazione,
      opacity: c.opacity,
      fase: 'header',
    }
  }

  percorso.stazione = limita(percorso.spirale.apertura)
  const p = fasiSpirale(percorso.spirale.piatta).distensione
  const mobile = w < 768
  const lato = { x: mobile ? 38 : 62, y: mobile ? 38 : h / 2, larghezza: mobile ? 48 : 84 }
  posa.x = mix(posa.x, lato.x, p)
  posa.y = mix(posa.y, lato.y, p)
  posa.larghezza = mix(posa.larghezza, lato.larghezza, p)
  posa.rotazione = (-12 + percorso.spirale.giro * 8) * (1 - p)
  if (percorso.spirale.piatta > 0) posa.fase = percorso.spirale.piatta < 0.99999 ? 'verso-griglia' : 'griglia'

  const sezione = document.getElementById('chi-sono')?.getBoundingClientRect()
  const bio = document.querySelector<HTMLElement>('[data-logo-biografia]')?.getBoundingClientRect()
  if (sezione && bio && sezione.top < h && p >= 0.999) {
    const ingresso = morbido(limita((h - sezione.top) / h))
    posa.x = mix(lato.x, bio.left + bio.width / 2, ingresso)
    posa.y = mix(lato.y, h / 2, ingresso)
    posa.larghezza = mix(lato.larghezza, bio.width, ingresso)
    posa.rotazione = mix(0, -8, ingresso)
    posa.fase = 'biografia'
    const uscita = morbido(percorso.biografia.uscita)
    percorso.stazione = 1 + ingresso + uscita
    posa.x = mix(posa.x, w / 2, uscita)
    posa.y = mix(posa.y, h / 2, uscita)
    posa.larghezza = mix(posa.larghezza, larghezzaLogoContatti(), uscita)
    posa.rotazione *= 1 - uscita
    if (uscita > 0) posa.fase = 'verso-contatti'
    const contatti = document.querySelector<HTMLElement>('[data-logo-contatti]')?.getBoundingClientRect()
    if (uscita >= 0.999 && contatti) {
      posa.y = Math.min(h / 2, contatti.top + contatti.height / 2)
      posa.fase = 'contatti'
    }
  }
  return posa
}
