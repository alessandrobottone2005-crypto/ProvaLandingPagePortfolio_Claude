// animazioni di apertura e chiusura del pannello (claude.md §6.5).
// - la pagina sotto (main) arretra a scala 0,96 mentre il pannello è aperto
// - la copertina vola dalla card cliccata alla testata del pannello (clone assoluto, rettangolo → rettangolo)
import { movimento } from '@/config/movimento'
import { gsap } from '@/lib/gsap'

export type Rettangolo = { x: number; y: number; w: number; h: number }

/** true se l’elemento (o un suo antenato dentro main) è fissato allo schermo, come le sezioni bloccate da scrolltrigger */
function dentroElementoFisso(el: Element, main: HTMLElement) {
  for (let n: Element | null = el; n && n !== main; n = n.parentElement) {
    if (getComputedStyle(n).position === 'fixed') return true
  }
  return false
}

// stato della pagina che arretra: uno solo alla volta, e sopravvive allo smontaggio del pannello
// (con il tasto indietro il pannello sparisce subito, ma la pagina torna al suo posto con calma)
let arretrata: { main: HTMLElement; tween?: gsap.core.Tween; applica: (k: number) => void; k: { v: number } } | null = null

/**
 * fa arretrare la pagina sotto il pannello. tocca solo `transform` e `transform-origin` di main.
 * attenzione: una trasformazione su main sposta gli elementi `position: fixed` al suo interno
 * (le sezioni bloccate). se al centro dello schermo c’è una sezione bloccata, compenso lo spostamento
 * perché resti ferma dov’è; altrimenti scalo attorno al centro dello schermo.
 */
export function arretraPagina() {
  const main = document.querySelector('main')
  if (!main) return
  arretrata?.tween?.kill()

  const r = main.getBoundingClientRect()
  const cx = innerWidth / 2
  const cy = innerHeight / 2
  const fisso = document.elementsFromPoint(cx, cy).some((el) => main.contains(el) && dentroElementoFisso(el, main))

  const applica = (k: number) => {
    if (fisso) {
      // gli elementi fissi si posizionano rispetto a main: li riporto sullo schermo e scalo attorno al centro
      main.style.transformOrigin = '0 0'
      main.style.transform = `translate3d(${(1 - k) * cx - r.left}px, ${(1 - k) * cy - r.top}px, 0) scale(${k})`
    } else {
      main.style.transformOrigin = `${cx - r.left}px ${cy - r.top}px`
      main.style.transform = `scale(${k})`
    }
  }

  const k = { v: 1 }
  applica(1)
  arretrata = { main, applica, k }
  arretrata.tween = gsap.to(k, {
    v: movimento.pannello.scalaPagina,
    duration: movimento.durata.standard,
    ease: movimento.ease.entrata,
    onUpdate: () => applica(k.v),
  })
}

/** riporta la pagina al suo posto e toglie la trasformazione da main */
export function ripristinaPagina(anima = true) {
  const stato = arretrata
  if (!stato) return
  stato.tween?.kill()
  const fine = () => {
    stato.main.style.transform = ''
    stato.main.style.transformOrigin = ''
    if (arretrata === stato) arretrata = null
  }
  if (!anima) return fine()
  stato.tween = gsap.to(stato.k, {
    v: 1,
    duration: movimento.pannello.uscita + 0.15,
    ease: movimento.ease.transizione,
    onUpdate: () => stato.applica(stato.k.v),
    onComplete: fine,
  })
}

/**
 * clone della copertina che vola dal rettangolo della card a quello della testata.
 * il clone ha già la misura finale: all’inizio è rimpicciolito (scale) e ritagliato (clip-path)
 * sulla forma della card, così si animano solo transform e clip-path, senza deformare l’immagine.
 */
export function volaCopertina(src: string, da: Rettangolo, a: DOMRect, alArrivo: () => void) {
  const clone = document.createElement('img')
  clone.src = src
  clone.alt = ''
  clone.setAttribute('aria-hidden', 'true')
  Object.assign(clone.style, {
    position: 'fixed',
    left: `${a.left}px`,
    top: `${a.top}px`,
    width: `${a.width}px`,
    height: `${a.height}px`,
    objectFit: 'cover',
    zIndex: '55',
    pointerEvents: 'none',
    willChange: 'transform, clip-path',
  })
  document.body.appendChild(clone)

  // scala minima perché il clone copra la card, poi ritaglio sulla sua forma
  const s = Math.max(da.w / a.width, da.h / a.height)
  const insX = Math.max(0, (a.width - da.w / s) / 2)
  const insY = Math.max(0, (a.height - da.h / s) / 2)
  const raggio = 16

  const tl = gsap.timeline({
    onComplete: () => {
      alArrivo()
      clone.remove()
    },
  })
  tl.fromTo(
    clone,
    {
      x: da.x + da.w / 2 - (a.left + a.width / 2),
      y: da.y + da.h / 2 - (a.top + a.height / 2),
      scale: s,
      clipPath: `inset(${insY}px ${insX}px ${insY}px ${insX}px round ${raggio / s}px)`,
    },
    {
      x: 0,
      y: 0,
      scale: 1,
      clipPath: `inset(0px 0px 0px 0px round ${raggio}px)`,
      duration: movimento.pannello.volo,
      ease: movimento.ease.transizione,
    },
  )
  return () => {
    tl.kill()
    clone.remove()
  }
}
