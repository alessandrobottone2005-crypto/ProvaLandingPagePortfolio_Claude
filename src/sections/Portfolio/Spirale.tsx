// Spirale elicoidale su ogni schermo: apertura, rotazione, pausa, passaggio alla griglia.
// La spirale è decorativa; le card diventano interattive solo nelle posizioni 2d finali.
import { useRef, useState, type KeyboardEvent } from 'react'
import { movimento } from '@/config/movimento'
import { sito } from '@/config/sito'
import { gsap, ScrollTrigger, useGSAP } from '@/lib/gsap'
import { progetti } from '@/lib/progetti'
import { getLenis } from '@/lib/scroll'
import { percorso } from '@/components/volto/percorso'
import { cardImmersive, fasiSpirale } from '@/components/volto/cardImmersive'
import { CardCopertina } from './CardCopertina'
import { Griglia } from './Griglia'

const P = movimento.portfolio
const n = progetti.length
const ALFA = 360 / Math.min(5, Math.max(n, 1))
const limita = (v: number, min = 0, max = 1) => Math.min(max, Math.max(min, v))
const interpola = (a: number, b: number, p: number) => a + (b - a) * p
const distanza = (i: number, giro: number) => ((((i - giro) % n) + n + n / 2) % n) - n / 2
const scrollAttuale = () => getLenis()?.scroll ?? scrollY

function scorriA(y: number) {
  const lenis = getLenis()
  if (lenis) lenis.scrollTo(y, { duration: P.aggancio, easing: (t) => 1 - Math.pow(1 - t, 3), force: true })
  else scrollTo({ top: y, behavior: 'smooth' })
}

export function Spirale() {
  const palco = useRef<HTMLDivElement>(null)
  const scena = useRef<HTMLDivElement>(null)
  const rotore = useRef<HTMLUListElement>(null)
  const griglia = useRef<HTMLDivElement>(null)
  const [pronta, setPronta] = useState(false)
  const [aperta, setAperta] = useState<string | null>(null)
  const prontaRef = useRef(false)
  const [suggerimento, setSuggerimento] = useState(true)
  const frontale = useRef(0)
  const vai = useRef<(k: number) => void>(() => {})

  useGSAP(
    () => {
      if (!n) return
      const el = palco.current!
      const q = gsap.utils.selector(el)
      const card = q<HTMLElement>('[data-card-anello]')
      const destinazioni = [...griglia.current!.querySelectorAll<HTMLElement>('[data-card-visuale]')]
      const vh = () => innerHeight / 100
      const rotazione = (n - 1) * P.perProgetto
      const inizioGriglia = P.disposizione + rotazione + P.coda
      const lunghezza = inizioGriglia + P.versoGriglia
      const stato = { giro: 0, apertura: 0, inclina: 0, piatta: 0 }
      let raggio = 0
      let w = 0
      let passo = 0
      let profondita = 0
      let ricalcolo = false
      let mete: { x: number; y: number; scala: number }[] = []

      // La griglia vera occupa già spazio, anche quando è invisibile.
      // Le sue misure sono le mete delle card animate: al termine non c’è salto di layout.
      const misura = () => {
        w = parseFloat(getComputedStyle(card[0]).width)
        raggio = Math.min(innerWidth * 0.46, innerHeight * 0.55)
        profondita = innerHeight * P.spirale3d.profondita
        passo = w * P.spirale3d.passo
        const base = el.getBoundingClientRect()
        mete = destinazioni.map((c) => {
          const r = c.getBoundingClientRect()
          return {
            x: r.left - base.left + r.width / 2 - base.width / 2,
            y: r.top - base.top + r.height / 2 - innerHeight / 2,
            scala: r.width / w,
          }
        })
      }

      const applica = () => {
        // Durante refresh GSAP riporta temporaneamente la timeline a zero per misurare il pin.
        // Quel passaggio tecnico non deve richiudere la card scelta né mostrare la spirale.
        if (ricalcolo) return
        const p = stato.piatta
        Object.assign(percorso.spirale, { piatta: p, apertura: stato.apertura, giro: stato.giro })
        const { ritiro, distensione: distesa } = fasiSpirale(p)
        rotore.current!.style.transform = 'translate3d(0,0,0)'
        for (let i = 0; i < n; i++) {
          const d = distanza(i, stato.giro)
          const angolo = ((d * ALFA + 90) * Math.PI) / 180
          const x = (Math.sin(angolo) * raggio + d * passo * 0.06) * stato.apertura * interpola(1, P.spirale3d.raggioRitiro, ritiro)
          const y = (d * passo - Math.sin(angolo) * raggio * 0.13) * stato.apertura * interpola(1, P.spirale3d.passoRitiro, ritiro)
          // L’elica attraversa il piano del volto: alcune card sono davanti, altre dietro.
          const z = Math.cos(angolo) * profondita * stato.apertura
          // Le card si raddrizzano prima di raggiungere le righe, evitando incroci di facce inclinate.
          const rotazioneResidua = 1 - limita(distesa / 0.7)
          const volume = stato.apertura * rotazioneResidua * rotazioneResidua
          const rx = (-8 + Math.cos(angolo) * 12) * volume
          const ry = Math.sin(angolo) * 108 * volume
          const rz = (-10 + Math.sin(angolo) * 7 + stato.inclina * 0.4) * volume
          const meta = mete[i]
          const c = card[i]
          const scala = interpola(0.3 + 0.7 * stato.apertura, meta.scala, distesa)
          const px = interpola(x, meta.x, distesa)
          const py = interpola(y, meta.y, distesa)
          const pz = z * (1 - distesa)
          c.style.transform = `translate3d(${px}px,${py}px,${pz}px) rotateZ(${rz}deg) rotateY(${ry}deg) rotateX(${rx}deg) scale(${scala})`
          const bordo = n > 2 ? limita((n / 2 - Math.abs(d)) / 0.8) : 1
          const opacity = interpola(limita(stato.apertura * 2) * bordo, 1, ritiro)
          c.style.opacity = String(opacity)
          cardImmersive[i] = {
            x: px, y: py, z: pz, rx, ry, rz,
            larghezza: w * scala, opacity,
          }
        }
        frontale.current = limita(Math.round(stato.giro), 0, n - 1)
        const finale = p >= 0.99999
        // Scambio nello stesso fotogramma: grafica identica, DOM finale in flusso normale.
        scena.current!.style.visibility = finale ? 'hidden' : 'visible'
        griglia.current!.style.visibility = finale ? 'visible' : 'hidden'
        if (finale !== prontaRef.current) {
          prontaRef.current = finale
          setPronta(finale)
          if (!finale) setAperta(null)
        }
        el.dataset.fase = finale ? 'griglia' : p > 0 ? 'transizione' : 'spirale'
      }

      misura()
      applica()
      const iniziaRicalcolo = () => {
        ricalcolo = true
      }
      const finisciRicalcolo = () => {
        misura()
        ricalcolo = false
        applica()
      }
      ScrollTrigger.addEventListener('refreshInit', iniziaRicalcolo)
      ScrollTrigger.addEventListener('refresh', finisciRicalcolo)
      const inclinaA = gsap.quickTo(stato, 'inclina', { duration: 0.6, ease: 'power3.out', onUpdate: applica })
      const raddrizza = gsap.delayedCall(0.12, () => inclinaA(0)).pause()
      const tl = gsap.timeline({
        defaults: { ease: 'none' },
        scrollTrigger: {
          id: 'portfolio-anello',
          refreshPriority: 20,
          trigger: el,
          pin: true,
          start: 'top top',
          end: () => `+=${lunghezza * vh()}`,
          scrub: innerWidth < 768 ? movimento.scrub.mobile : movimento.scrub.desktop,
          invalidateOnRefresh: true,
          onRefresh: (st) => {
            st.getTween()?.duration(innerWidth < 768 ? movimento.scrub.mobile : movimento.scrub.desktop)
            misura()
            applica()
          },
          onUpdate: (st) => {
            inclinaA(limita(-st.getVelocity() / 400, -P.inclinazioneVelocita, P.inclinazioneVelocita))
            raddrizza.restart(true)
          },
        },
      })
      tl.to(stato, { apertura: 1, duration: P.disposizione, ease: 'power2.out', onUpdate: applica }, 0)
      tl.to(stato, { giro: n - 1, duration: Math.max(rotazione, 0.001), onUpdate: applica }, P.disposizione)
      tl.to(stato, { piatta: 1, duration: P.versoGriglia, ease: 'none', onUpdate: applica }, inizioGriglia)

      const st = tl.scrollTrigger!
      const posizioneDi = (k: number) => st.start + (P.disposizione + limita(k, 0, n - 1) * P.perProgetto) * vh()
      vai.current = (k) => scorriA(posizioneDi(k))
      let premuto = false
      const aggancia = () => {
        if (innerWidth < 768) return
        if (premuto || document.documentElement.classList.contains('scroll-fermo')) return
        const y = scrollAttuale()
        const pos = (y - st.start) / vh() - P.disposizione
        if (pos < -P.disposizione * 0.4 || pos > rotazione + P.perProgetto * 0.25) return
        const k = limita(Math.round(pos / P.perProgetto), 0, n - 1)
        const meta = posizioneDi(k)
        if (Math.abs(meta - y) > 2) scorriA(meta)
      }
      ScrollTrigger.addEventListener('scrollEnd', aggancia)

      let attesa = 0
      let y = 0
      const gira = (_: number, delta: number) => {
        y = Math.min(y + (P.tieniPremutoVelocita * P.perProgetto * vh() * delta) / 1000, posizioneDi(n - 1))
        const lenis = getLenis()
        if (lenis) lenis.scrollTo(y, { immediate: true, force: true })
        else scrollTo(0, y)
      }
      const giu = (e: globalThis.PointerEvent) => {
        if (e.pointerType === 'touch' || e.button !== 0 || stato.piatta > 0 || scrollAttuale() > posizioneDi(n - 1))
          return
        clearTimeout(attesa)
        attesa = window.setTimeout(() => {
          premuto = true
          y = Math.max(scrollAttuale(), posizioneDi(0))
          gsap.ticker.add(gira)
        }, P.tieniPremutoDopo * 1000)
      }
      const su = () => {
        clearTimeout(attesa)
        if (!premuto) return
        premuto = false
        gsap.ticker.remove(gira)
        aggancia()
      }
      scena.current!.addEventListener('pointerdown', giu)
      addEventListener('pointerup', su)
      addEventListener('pointercancel', su)
      addEventListener('blur', su)

      return () => {
        cardImmersive.length = 0
        ScrollTrigger.removeEventListener('refreshInit', iniziaRicalcolo)
        ScrollTrigger.removeEventListener('refresh', finisciRicalcolo)
        ScrollTrigger.removeEventListener('scrollEnd', aggancia)
        clearTimeout(attesa)
        gsap.ticker.remove(gira)
        scena.current?.removeEventListener('pointerdown', giu)
        removeEventListener('pointerup', su)
        removeEventListener('pointercancel', su)
        removeEventListener('blur', su)
        raddrizza.kill()
        gsap.killTweensOf(stato)
        vai.current = () => {}
      }
    },
    { scope: palco },
  )

  const tasti = (e: KeyboardEvent<HTMLDivElement>) => {
    if (pronta || (e.key !== 'ArrowRight' && e.key !== 'ArrowLeft')) return
    e.preventDefault()
    vai.current(frontale.current + (e.key === 'ArrowRight' ? 1 : -1))
  }

  return (
    <div ref={palco} data-palco-spirale className="relative min-h-svh">
      <div
        ref={scena}
        aria-hidden={pronta}
        role="group"
        aria-label={sito.portfolio.animazione}
        tabIndex={pronta ? -1 : 0}
        onKeyDown={tasti}
        data-cursore={!pronta && suggerimento ? 'tieni premuto' : undefined}
        onMouseLeave={() => setSuggerimento(false)}
        className="absolute inset-0 touch-pan-y overflow-hidden select-none"
      >
        <div className="absolute left-1/2 top-[50svh]" style={{ perspective: `${P.prospettiva}px` }}>
          <ul ref={rotore} aria-hidden="true" className="relative" style={{ transformStyle: 'preserve-3d' }}>
            {progetti.map((progetto, i) => (
              <li
                key={progetto.slug}
                data-card-anello
                className="pointer-events-none absolute"
                style={{
                  width: 'min(27svh, 38vw, 300px)',
                  left: 'calc(min(27svh, 38vw, 300px) / -2)',
                  top: 'calc(min(27svh, 38vw, 300px) * 600 / 514 / -2)',
                  transformStyle: 'preserve-3d',
                }}
              >
                <div className="scheda-progetto">
                  <CardCopertina progetto={progetto} prima={i === 0} sizes="(min-width: 1024px) 33vw, 50vw" />
                </div>
              </li>
            ))}
          </ul>
        </div>
      </div>
      <div ref={griglia} style={{ visibility: 'hidden' }}>
        <Griglia abilitata={pronta} aperta={aperta} onAperta={setAperta} />
      </div>
    </div>
  )
}
