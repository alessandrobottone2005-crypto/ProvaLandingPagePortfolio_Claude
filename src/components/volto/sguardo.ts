// dove guardano i volti: un unico ascoltatore globale per il puntatore e lo scroll,
// condiviso da tutte le istanze di <Volto />.

export type Punto = { x: number; y: number }

type Stato = {
  /** ultima posizione del mouse o dell’ultimo tocco (coordinate dello schermo) */
  punto: Punto | null
  /** true mentre la pagina sta scorrendo */
  scorre: boolean
  /** true se l’ultimo input è stato un tocco (telefono, tablet) */
  tocco: boolean
}

const stato: Stato = { punto: null, scorre: false, tocco: false }
const ascoltatori = new Set<() => void>()
const avvisa = () => ascoltatori.forEach((fn) => fn())

let attivo = false

export function avviaSguardo() {
  if (attivo) return () => {}
  attivo = true
  let timerScroll = 0

  const muovi = (e: PointerEvent) => {
    // su touch conta solo il tocco, non il trascinamento dello scroll
    if (e.pointerType !== 'mouse' && e.type === 'pointermove') return
    stato.punto = { x: e.clientX, y: e.clientY }
    stato.tocco = e.pointerType !== 'mouse'
    avvisa()
  }
  const scorri = () => {
    stato.scorre = true
    clearTimeout(timerScroll)
    timerScroll = window.setTimeout(() => {
      stato.scorre = false
      avvisa()
    }, 200)
    avvisa()
  }

  addEventListener('pointermove', muovi, { passive: true })
  addEventListener('pointerdown', muovi, { passive: true })
  addEventListener('scroll', scorri, { passive: true })
  addEventListener('resize', avvisa, { passive: true })

  return () => {
    attivo = false
    clearTimeout(timerScroll)
    removeEventListener('pointermove', muovi)
    removeEventListener('pointerdown', muovi)
    removeEventListener('scroll', scorri)
    removeEventListener('resize', avvisa)
  }
}

export const sguardo = {
  get: () => stato,
  ascolta(fn: () => void) {
    ascoltatori.add(fn)
    return () => void ascoltatori.delete(fn)
  },
}
