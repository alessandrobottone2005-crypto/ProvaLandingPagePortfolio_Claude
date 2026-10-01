// Portfolio: dopo l’header la camera scende verso il computer a terra, fino allo schermo, che si accende e si usa.
// Nessun pin: lo scroll avanza sempre; durante la sosta la camera resta ferma davanti allo schermo.
// Con movimento ridotto: scena ferma sul computer già acceso.
import { lazy, Suspense, useEffect, useRef } from 'react'
import { media, movimento } from '@/config/movimento'
import { sito } from '@/config/sito'
import { gsap, ScrollTrigger, useGSAP } from '@/lib/gsap'
import { useMediaQuery } from '@/lib/useMediaQuery'
import { latiDisponibili, percorso, type Lato } from '@/components/volto/percorso'
import { useVolto, type Azione } from '@/components/volto/VoltoContext'
import { accendi, spegni } from '@/components/computer/stato'
import { useAvvio } from '@/components/preloader/AvvioContext'
import { getLenis } from '@/lib/scroll'

// three.js, il modello e l’interfaccia arrivano dopo il preloader: il bundle iniziale resta leggero
const ScenaRidotta = lazy(() => import('@/components/volto/ScenaRidotta'))
const Interfaccia = lazy(() => import('@/components/computer/Interfaccia'))
const C = movimento.computer

export function Portfolio() {
  const ridotto = useMediaQuery(media.ridotto)
  const { pronto } = useAvvio()

  // il modello si scarica dopo il preloader, senza rallentarlo
  useEffect(() => {
    if (pronto) void import('@/components/volto/modelloComputer').then((m) => m.caricaComputer())
  }, [pronto])

  // Cambiando la preferenza di movimento, le posizioni di scroll vanno ricalcolate.
  useEffect(() => {
    const id = requestAnimationFrame(() => ScrollTrigger.refresh())
    return () => cancelAnimationFrame(id)
  }, [ridotto])

  return (
    <section
      id="portfolio"
      aria-labelledby="titolo-portfolio"
      className={`relative z-20 ${ridotto ? '' : '-mt-[100svh]'}`}
    >
      <h2 id="titolo-portfolio" className="sr-only">
        {sito.sezioni.portfolio}
      </h2>
      {ridotto ? <ComputerFermo /> : <ComputerNelPercorso />}
    </section>
  )
}

function ComputerNelPercorso() {
  const palco = useRef<HTMLDivElement>(null)
  useNascondino()

  useGSAP(
    () => {
      const stato = percorso.computer
      const vh = () => innerHeight / 100
      gsap.set(stato, { vicino: 0 })
      // acceso/spento dipende sempre dalla posa reale: ScrollTrigger, nei refresh (resize, ricarica a metà
      // pagina, link diretto), porta la timeline alla posizione sopprimendo gli onUpdate. Per questo il
      // controllo gira anche sul ticker (costa un confronto; accendi/spegni non fanno nulla se lo stato è già quello)
      const controlla = () => {
        if (stato.vicino >= C.accendiDa) accendi()
        else if (stato.vicino < C.spegniSotto) spegni()
      }
      gsap.ticker.add(controlla)
      const tl = gsap.timeline({
        defaults: { ease: 'none' },
        scrollTrigger: {
          id: 'portfolio-computer',
          refreshPriority: 20,
          trigger: palco.current,
          start: 'top top',
          end: () => `+=${(C.avvicinamento + C.sosta) * vh()}`,
          scrub: innerWidth < 768 ? movimento.scrub.mobile : movimento.scrub.desktop,
          invalidateOnRefresh: true,
        },
      })
      tl.to(stato, { vicino: 1, duration: C.avvicinamento, onUpdate: controlla }, 0)
      // la sosta: la camera resta ferma davanti allo schermo
      tl.to({}, { duration: C.sosta }, C.avvicinamento)

      // resize e rotazione: le altezze delle sezioni cambiano ma lo scroll resta allo stesso pixel. Chi stava
      // usando il computer resta nella sosta, nello stesso punto (anche con un progetto aperto).
      // La posizione si legge al primo evento resize, prima che i matchMedia dell’header rifacciano il pin
      // (dopo, scrollY è già falsato); negli altri refresh (font, sezioni) basta leggerla al refreshInit.
      let ancora: number | null = null
      let inResize = false
      let scadenza = 0
      const segna = () => {
        const st = tl.scrollTrigger
        ancora = null
        if (!st || st.end <= st.start) return
        const p = (scrollY - st.start) / (st.end - st.start)
        if (p >= C.avvicinamento / (C.avvicinamento + C.sosta) && p <= 1) ancora = p
      }
      const alResize = () => {
        clearTimeout(scadenza)
        // se non segue nessun refresh (piccoli cambi d’altezza su mobile) la posizione non vale più
        scadenza = window.setTimeout(() => {
          inResize = false
          ancora = null
        }, 1500)
        if (inResize) return
        inResize = true
        segna()
      }
      const primaDelRefresh = () => {
        if (!inResize) segna()
      }
      const dopoIlRefresh = () => {
        const st = tl.scrollTrigger
        const p = ancora
        inResize = false
        ancora = null
        if (p === null || !st) return
        const y = Math.round(st.start + (st.end - st.start) * p)
        if (Math.abs(y - scrollY) < 2) return
        const lenis = getLenis()
        if (lenis) {
          lenis.resize()
          lenis.scrollTo(y, { immediate: true, force: true })
        } else scrollTo(0, y)
        st.update()
        st.getTween()?.progress(1)
      }
      addEventListener('resize', alResize, { passive: true })
      ScrollTrigger.addEventListener('refreshInit', primaDelRefresh)
      ScrollTrigger.addEventListener('refresh', dopoIlRefresh)
      return () => {
        clearTimeout(scadenza)
        removeEventListener('resize', alResize)
        ScrollTrigger.removeEventListener('refreshInit', primaDelRefresh)
        ScrollTrigger.removeEventListener('refresh', dopoIlRefresh)
        gsap.ticker.remove(controlla)
        spegni()
        gsap.set(stato, { vicino: 0 })
      }
    },
    { scope: palco },
  )

  return (
    // spazio di scroll: avvicinamento e sosta, più uno schermo prima che arrivi la biografia
    <div ref={palco} className="pointer-events-none" style={{ height: `calc(${C.avvicinamento + C.sosta}svh + 100svh)` }}>
      <div className="pointer-events-auto">
        <Suspense fallback={null}>
          <Interfaccia modo="percorso" />
        </Suspense>
      </div>
    </div>
  )
}

/**
 * Nascondino del volto dietro il monitor: esce da un lato, resta qualche secondo, rientra e cambia lato.
 * GSAP anima percorso.computer.sbircia, la scena lo legge per fotogramma (leggiPosa); fuori dalla sosta non si vede.
 * Aprendo o chiudendo un progetto, se è nascosto sbuca subito e ripete l’espressione quando è fuori.
 */
function useNascondino() {
  const { umore, azione, ascoltaAzioni } = useVolto()
  const dorme = useRef(false)
  useEffect(() => {
    dorme.current = umore === 'dorme'
  }, [umore])

  useEffect(() => {
    const S = movimento.computer.sbircia
    const sb = percorso.computer.sbircia
    const caso = (min: number, max: number) => min + Math.random() * (max - min)
    // fermi davanti allo schermo acceso (non durante la discesa né verso la biografia)
    const davanti = () => percorso.computer.vicino >= 0.999 && percorso.stazione < 1.001
    let attesa: gsap.core.Tween | null = null
    let giro: gsap.core.Timeline | null = null
    let ultimo: Lato | null = null
    let ripeto = false

    const aspetta = () => {
      attesa = gsap.delayedCall(caso(S.nascostoMin, S.nascostoMax), () => esci())
    }
    const esci = (poi?: () => void) => {
      attesa?.kill()
      const lati = latiDisponibili()
      const scelti = lati.length > 1 ? lati.filter((l) => l !== ultimo) : lati
      if (!scelti.length || dorme.current || !davanti()) return aspetta()
      ultimo = sb.lato = scelti[Math.floor(Math.random() * scelti.length)]
      giro = gsap
        .timeline({ onComplete: aspetta })
        .to(sb, { uscita: 1, duration: S.uscita, ease: 'back.out(1.4)', onComplete: poi })
        .to(sb, { uscita: 0, duration: S.rientro, ease: 'power2.in' }, `+=${caso(S.restaMin, S.restaMax)}`)
    }
    // reazioni del Finder: le vede solo chi sta davanti allo schermo
    const smetti = ascoltaAzioni((a: Azione) => {
      if (ripeto || a === 'battito' || !davanti() || giro?.isActive()) return
      esci(() => {
        ripeto = true
        azione(a)
        ripeto = false
      })
    })
    aspetta()
    return () => {
      smetti()
      attesa?.kill()
      giro?.kill()
      sb.uscita = 0
    }
  }, [azione, ascoltaAzioni])
}

function ComputerFermo() {
  useEffect(() => {
    accendi(true)
    return spegni
  }, [])
  return (
    <div className="relative h-svh min-h-[32rem] overflow-hidden">
      <Suspense fallback={null}>
        <ScenaRidotta />
      </Suspense>
      <Suspense fallback={null}>
        <Interfaccia modo="ridotto" />
      </Suspense>
    </div>
  )
}
