// L’interfaccia del computer è DOM vero, posato sul vetro 3d con una matrix3d calcolata dai suoi quattro angoli.
// Resta nitida, cliccabile e leggibile da tastiera e screen reader. Su telefono, arrivati davanti
// allo schermo, la camera supera la cornice e l’interfaccia occupa tutta la vista.
import { useCallback, useEffect, useLayoutEffect, useRef, useState } from 'react'
import { movimento } from '@/config/movimento'
import { sito } from '@/config/sito'
import { gsap } from '@/lib/gsap'
import { percorso } from '@/components/volto/percorso'
import { ricalcolaCursore } from '@/components/cursore/ricalcola'
import { misuraSosta, omografia, proiettaSchermo, telefono } from './inquadratura'
import { aggancio, fineAvvio, giaAvviato, useFaseComputer } from './stato'
import { Finder } from './Finder'
import { MacFelice } from './icone'
import './computer.css'

const liscio = (t: number) => {
  const v = Math.min(1, Math.max(0, t))
  return v * v * (3 - 2 * v)
}

type Misura = { larghezza: number; altezza: number; telefono: boolean }

/**
 * `percorso`: sovrapposta alla scena principale, segue lo scroll (fixed).
 * `ridotto`: movimento ridotto, dentro la sezione sopra una scena ferma (absolute).
 */
export default function Interfaccia({ modo }: { modo: 'percorso' | 'ridotto' }) {
  const fase = useFaseComputer()
  const radice = useRef<HTMLDivElement>(null)
  const [misura, setMisura] = useState<Misura>({ larghezza: 640, altezza: 540, telefono: false })
  const [attiva, setAttiva] = useState(modo === 'ridotto')
  const [finderMontato, setFinderMontato] = useState(false)
  const angoli = useRef<number[]>([])
  const misuraRef = useRef(misura)

  // risoluzione dell’interfaccia = misura in pixel del vetro nella sosta (su telefono, la vista intera)
  useLayoutEffect(() => {
    const contenitore = () => (modo === 'ridotto' ? radice.current?.parentElement : null)
    const misura = () => {
      const box = contenitore()?.getBoundingClientRect()
      const w = box?.width ?? document.documentElement.clientWidth
      const h = box?.height ?? innerHeight
      const tel = modo === 'percorso' && telefono(w)
      const m = tel ? { larghezza: w, altezza: h, telefono: true } : { ...misuraSosta(w, h), telefono: false }
      misuraRef.current = m
      setMisura(m)
    }
    misura()
    addEventListener('resize', misura)
    return () => removeEventListener('resize', misura)
  }, [modo])

  const aggiorna = useCallback(() => {
    const el = radice.current
    if (!el) return
    const box = modo === 'ridotto' ? el.parentElement!.getBoundingClientRect() : null
    const w = box?.width ?? document.documentElement.clientWidth
    const h = box?.height ?? innerHeight
    const s = modo === 'ridotto' ? 1 : percorso.stazione
    const m = misuraRef.current
    const q = angoli.current
    const vicino = s > 0.5 && s < 1.8 && proiettaSchermo(s, w, h, q)
    let opacita = vicino ? 1 : 0
    if (vicino && m.telefono) {
      // dentro lo schermo: dal vetro alla vista intera, solo nell’ultimo tratto
      const t = s <= 1 ? liscio((s - 0.82) / 0.18) : 1 - liscio((s - 1) / 0.2)
      const pieno = [0, 0, w, 0, w, h, 0, h]
      for (let i = 0; i < 8; i++) q[i] += (pieno[i] - q[i]) * t
      opacita = t
    }
    const visibilita = opacita > 0.001 ? 'visible' : 'hidden'
    // lo schermo compare o sparisce sotto un mouse fermo: il cursore del sito deve saperlo
    if (el.style.visibility !== visibilita) requestAnimationFrame(ricalcolaCursore)
    el.style.visibility = visibilita
    el.style.opacity = String(opacita)
    if (vicino) el.style.transform = omografia(m.larghezza, m.altezza, q)
    const ora = modo === 'ridotto' || (s > 0.995 && s < 1.02)
    setAttiva((a) => (a === ora ? a : ora))
  }, [modo])

  // la scena 3d chiama `aggiorna` prima di disegnare; senza scena ci pensa il ticker
  useEffect(() => {
    aggancio.aggiorna = aggiorna
    const tick = () => {
      if (performance.now() - aggancio.ultimo > 120) aggiorna()
    }
    gsap.ticker.add(tick)
    return () => {
      gsap.ticker.remove(tick)
      if (aggancio.aggiorna === aggiorna) aggancio.aggiorna = null
    }
  }, [aggiorna])
  useLayoutEffect(aggiorna, [aggiorna, misura])

  // diventando interattivo (o tornando inerte) cambia ciò che il cursore ha sotto
  const interattiva = attiva && fase === 'acceso'
  useEffect(() => {
    const id = requestAnimationFrame(ricalcolaCursore)
    return () => cancelAnimationFrame(id)
  }, [interattiva])

  // il finder resta montato dopo il primo avvio: tornando indietro e riaccendendo, le finestre restano dove erano
  if (fase === 'acceso' && !finderMontato) setFinderMontato(true)

  const scala = useCallback(() => {
    const el = radice.current
    if (!el) return 1
    return el.getBoundingClientRect().width / misuraRef.current.larghezza
  }, [])

  return (
    <div
      ref={radice}
      data-mac
      data-fase={fase}
      data-telefono={misura.telefono || undefined}
      role="region"
      aria-label={sito.computer.schermo}
      inert={!attiva || fase !== 'acceso'}
      className={`mac-schermo ${modo === 'ridotto' ? 'absolute' : 'fixed'}`}
      style={{ width: misura.larghezza, height: misura.altezza, visibility: 'hidden' }}
    >
      <div className="mac-vetro">
        {finderMontato && <Finder larghezza={misura.larghezza} altezza={misura.altezza} telefono={misura.telefono} scala={scala} />}
        {fase === 'avvio' && <Avvio />}
      </div>
      <div aria-hidden="true" className="mac-crt" />
    </div>
  )
}

/** trama grigia, poi il volto sul piccolo computer, poi la scrivania */
function Avvio() {
  const breve = giaAvviato()
  useEffect(() => {
    const id = window.setTimeout(fineAvvio, (breve ? movimento.computer.avvioBreve : movimento.computer.avvio) * 1000)
    return () => clearTimeout(id)
  }, [breve])
  return (
    <div className="mac-avvio" data-breve={breve || undefined} role="status" aria-label={sito.computer.avvio}>
      <MacFelice />
    </div>
  )
}
