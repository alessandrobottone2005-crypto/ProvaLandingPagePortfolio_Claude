// portfolio su desktop e tablet (claude.md §6.3–6.4): le card su un anello 3d fatto in css.
// gsap guida tutto ciò che dipende dallo scroll (pin, disposizione delle card, rotazione, inclinazione da velocità);
// motion guida solo la micro-interazione della card frontale (inclinazione sotto il cursore, zoom della copertina),
// su un elemento interno: mai gsap e motion sulla stessa proprietà dello stesso elemento.
import { motion, useSpring } from 'motion/react'
import { useEffect, useRef, useState, type KeyboardEvent, type MouseEvent, type PointerEvent } from 'react'
import { Link } from 'react-router'
import { TestoCheRotola } from '@/components/testo/TestoCheRotola'
import { movimento } from '@/config/movimento'
import { gsap, ScrollTrigger, useGSAP } from '@/lib/gsap'
import { progetti, type Progetto } from '@/lib/progetti'
import { getLenis } from '@/lib/scroll'
import { cartaAltezza, cartaLarghezza, cartaScostamentoY, doppie, testoCard, useApriProgetto } from './carta'
import { Copertina } from './Copertina'

const P = movimento.portfolio
const n = progetti.length
const ALFA = 360 / Math.max(n, 1)

const limita = (v: number, min = 0, max = 1) => Math.min(max, Math.max(min, v))
/** distanza “con segno” della card i dalla posizione frontale, sempre dal lato più corto: da -n/2 a n/2 */
const distanza = (i: number, giro: number) => ((((i - giro) % n) + n + n / 2) % n) - n / 2

const scrollAttuale = () => getLenis()?.scroll ?? scrollY
const scorriA = (y: number, durata: number = P.aggancio) => {
  const lenis = getLenis()
  if (lenis) lenis.scrollTo(y, { duration: durata, easing: (t) => 1 - Math.pow(1 - t, 3), force: true })
  else scrollTo({ top: y, behavior: 'smooth' })
}

export function Anello() {
  const palco = useRef<HTMLDivElement>(null)
  const rotore = useRef<HTMLUListElement>(null)
  const links = useRef<(HTMLAnchorElement | null)[]>([])
  const [frontale, setFrontale] = useState(0)
  const frontaleRef = useRef(0)
  // “tieni premuto”: il suggerimento del cursore compare solo al primo passaggio
  const [suggerimento, setSuggerimento] = useState(true)
  // azioni create dentro useGSAP (servono lo scrolltrigger e le misure)
  const vai = useRef<(k: number) => void>(() => {})
  const tenuto = useRef(false)
  const apri = useApriProgetto()

  useGSAP(
    () => {
      const el = palco.current!
      const q = gsap.utils.selector(el)
      const card = q<HTMLElement>('[data-card-anello]')
      const colore = card.map((c) => c.querySelector<HTMLElement>('[data-colore]')!)
      const scuro = card.map((c) => c.querySelector<HTMLElement>('[data-scuro]')!)
      const tocco = card.map((c) => c.firstElementChild as HTMLElement)
      const vh = () => innerHeight / 100
      const rotazione = (n - 1) * P.perProgetto
      const lunghezza = P.disposizione + rotazione + P.coda

      const stato = { giro: 0, apertura: 0, inclina: 0 }
      let raggio = 0

      // raggio calcolato da numero e larghezza delle card, così non si sovrappongono mai
      const misura = () => {
        const w = card[0]?.offsetWidth ?? 0
        raggio = n < 2 ? 0 : Math.max(w * 0.9, w / 2 / Math.tan(Math.PI / n) + w * P.spazioCard)
      }

      const applica = () => {
        rotore.current!.style.transform = `translate3d(0,0,${-raggio}px)`
        for (let i = 0; i < n; i++) {
          const d = distanza(i, stato.giro)
          const angolo = d * ALFA * stato.apertura
          const assoluto = Math.abs(angolo)
          // le card di spalle spariscono; all’inizio compaiono mentre si allargano dalla prima
          const dietro = 1 - limita((assoluto - 95) / 35)
          const comparsa = Math.abs(d) < 0.5 ? 1 : limita((stato.apertura - 0.1) / 0.4)
          const opacita = dietro * comparsa
          const c = card[i]
          c.style.transform = `rotateY(${angolo}deg) translate3d(0,0,${raggio}px) skewX(${stato.inclina}deg)`
          // opacità 1 = nessun valore: così la card frontale non “appiattisce” la sua inclinazione 3d
          c.style.opacity = opacita > 0.999 ? '' : String(opacita)
          tocco[i].style.pointerEvents = opacita > 0.5 ? 'auto' : 'none'
          // solo la frontale è a colori; le altre in grigio e più scure con l’angolo
          colore[i].style.opacity = String(limita(1 - Math.abs(d) * 1.6))
          scuro[i].style.opacity = String(Math.min(0.8, (assoluto / 120) * 0.8))
        }
        const f = ((Math.round(stato.giro) % n) + n) % n
        if (f !== frontaleRef.current) {
          frontaleRef.current = f
          setFrontale(f)
        }
      }

      misura()
      applica()
      gsap.set(q('[data-info]'), { opacity: 0, y: 16 })

      // inclinazione dalla velocità dello scroll: segue con inerzia e torna dritta quando ci si ferma
      const inclinaA = gsap.quickTo(stato, 'inclina', { duration: 0.6, ease: 'power3.out', onUpdate: applica })
      const raddrizza = gsap.delayedCall(0.12, () => inclinaA(0)).pause()

      const tl = gsap.timeline({
        defaults: { ease: 'none' },
        scrollTrigger: {
          trigger: el,
          pin: true,
          start: 'top top',
          end: () => `+=${lunghezza * vh()}`,
          scrub: movimento.scrub.desktop,
          invalidateOnRefresh: true,
          onRefresh: () => {
            misura()
            applica()
          },
          onUpdate: (st) => {
            const max = P.inclinazioneVelocita
            inclinaA(limita(-st.getVelocity() / 400, -max, max))
            raddrizza.restart(true)
          },
        },
      })

      // unità della timeline: vh di scroll
      tl.to(stato, { apertura: 1, duration: P.disposizione, ease: 'power2.out', onUpdate: applica }, 0)
      tl.to(q('[data-info]'), { opacity: 1, y: 0, duration: P.disposizione * 0.5, ease: 'power2.out' }, P.disposizione * 0.5)
      tl.to(stato, { giro: n - 1, duration: Math.max(rotazione, 0.001), onUpdate: applica }, P.disposizione)
      tl.to({}, { duration: P.coda }, P.disposizione + rotazione)

      const st = tl.scrollTrigger!
      const posizioneDi = (k: number) => st.start + (P.disposizione + limita(k, 0, n - 1) * P.perProgetto) * vh()
      vai.current = (k: number) => scorriA(posizioneDi(k))

      // a fine scroll si aggancia alla card più vicina
      let premuto = false
      const aggancia = () => {
        if (premuto || document.documentElement.classList.contains('scroll-fermo')) return
        const y = scrollAttuale()
        if (y < st.start || y > st.end) return
        const pos = (y - st.start) / vh() - P.disposizione
        // nella prima parte (card che si dispongono) e nella coda si lascia libero lo scroll
        if (pos < -P.disposizione * 0.4 || pos > rotazione + P.perProgetto * 0.25) return
        const k = limita(Math.round(pos / P.perProgetto), 0, n - 1)
        const meta = posizioneDi(k)
        if (Math.abs(meta - y) > 2) scorriA(meta)
      }
      ScrollTrigger.addEventListener('scrollEnd', aggancia)

      // tieni premuto sull’anello: gira veloce; al rilascio si aggancia (come “hold to skim” di pxpush)
      let attesa = 0
      let y = 0
      const gira = (_: number, delta: number) => {
        y = Math.min(y + (P.tieniPremutoVelocita * P.perProgetto * vh() * delta) / 1000, posizioneDi(n - 1))
        const lenis = getLenis()
        if (lenis) lenis.scrollTo(y, { immediate: true, force: true })
        else scrollTo(0, y)
      }
      const giu = (e: globalThis.PointerEvent) => {
        if (e.pointerType === 'touch' || e.button !== 0) return
        tenuto.current = false
        clearTimeout(attesa)
        attesa = window.setTimeout(() => {
          premuto = true
          tenuto.current = true
          // se si parte da prima dell’anello, si comincia dalla prima card
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
      el.addEventListener('pointerdown', giu)
      addEventListener('pointerup', su)
      addEventListener('pointercancel', su)
      addEventListener('blur', su)

      return () => {
        ScrollTrigger.removeEventListener('scrollEnd', aggancia)
        clearTimeout(attesa)
        gsap.ticker.remove(gira)
        el.removeEventListener('pointerdown', giu)
        removeEventListener('pointerup', su)
        removeEventListener('pointercancel', su)
        removeEventListener('blur', su)
        raddrizza.kill()
      }
    },
    { scope: palco },
  )

  const clic = (e: MouseEvent<HTMLAnchorElement>, i: number, slug: string) => {
    // dopo un “tieni premuto” il rilascio non apre il progetto
    if (tenuto.current) {
      e.preventDefault()
      tenuto.current = false
      return
    }
    // clic su una card laterale: prima la porta davanti
    if (i !== frontaleRef.current) {
      e.preventDefault()
      vai.current(i)
      return
    }
    apri(e, slug, links.current[i])
  }

  // tastiera: frecce ← → per ruotare, invio per aprire (è il clic del link)
  const tasti = (e: KeyboardEvent<HTMLUListElement>) => {
    if (e.key !== 'ArrowRight' && e.key !== 'ArrowLeft') return
    e.preventDefault()
    const k = limita(frontaleRef.current + (e.key === 'ArrowRight' ? 1 : -1), 0, n - 1)
    vai.current(k)
    links.current[k]?.focus({ preventScroll: true })
  }

  const p = progetti[frontale]

  return (
    <div
      ref={palco}
      data-cursore={suggerimento ? 'tieni premuto' : undefined}
      onMouseLeave={() => setSuggerimento(false)}
      className="relative h-svh touch-pan-y overflow-hidden bg-nero select-none"
    >
      {/* la scena: il suo centro coincide con il centro della card finale dell’header */}
      <div className="absolute top-1/2 left-1/2" style={{ perspective: `${P.prospettiva}px`, transform: `translateY(${cartaScostamentoY})` }}>
        <ul ref={rotore} onKeyDown={tasti} className="relative" style={{ transformStyle: 'preserve-3d' }}>
          {progetti.map((progetto, i) => (
            <CardAnello
              key={progetto.slug}
              progetto={progetto}
              indice={i}
              frontale={i === frontale}
              refLink={(a) => {
                links.current[i] = a
              }}
              onClick={(e) => clic(e, i, progetto.slug)}
              // col tab la card che riceve il focus viene portata davanti
              onFocus={() => i !== frontaleRef.current && vai.current(i)}
            />
          ))}
        </ul>
      </div>

      {/* sotto l’anello: contatore, titolo, discipline e anno della card frontale */}
      {p && (
        <div
          data-info
          aria-hidden="true"
          className="pointer-events-none absolute inset-x-4 flex flex-col items-center gap-3 text-center md:inset-x-8"
          style={{ top: `calc(50% + ${cartaScostamentoY} + ${cartaAltezza} / 2 + clamp(1.25rem, 3svh, 2.5rem))` }}
        >
          <TestoCheRotola testo={p.titolo} className="text-titolo font-light" />
          <div className="flex items-baseline gap-6 text-etichetta cifre-tabellari">
            <TestoCheRotola testo={`${doppie(frontale + 1)} / ${doppie(n)}`} />
            <TestoCheRotola testo={p.discipline.join(', ')} />
            <TestoCheRotola testo={String(p.anno)} />
          </div>
        </div>
      )}
    </div>
  )
}

type PropsCard = {
  progetto: Progetto
  indice: number
  frontale: boolean
  refLink: (a: HTMLAnchorElement | null) => void
  onClick: (e: MouseEvent<HTMLAnchorElement>) => void
  onFocus: () => void
}

const molla = { stiffness: 180, damping: 22, mass: 0.6 }

function CardAnello({ progetto, indice, frontale, refLink, onClick, onFocus }: PropsCard) {
  const rx = useSpring(0, molla)
  const ry = useSpring(0, molla)
  const [sopra, setSopra] = useState(false)
  const max = P.inclinazioneHover

  // quando la card non è più davanti torna dritta (e la copertina torna alla misura normale)
  useEffect(() => {
    if (frontale) return
    rx.set(0)
    ry.set(0)
  }, [frontale, rx, ry])
  const ingrandita = sopra && frontale

  const muovi = (e: PointerEvent<HTMLDivElement>) => {
    if (!frontale || e.pointerType !== 'mouse') return
    const r = e.currentTarget.getBoundingClientRect()
    ry.set(((e.clientX - r.left) / r.width - 0.5) * 2 * max)
    rx.set(-((e.clientY - r.top) / r.height - 0.5) * 2 * max)
    setSopra(true)
  }
  const esci = () => {
    rx.set(0)
    ry.set(0)
    setSopra(false)
  }

  return (
    <li
      data-card-anello
      // il li non riceve il puntatore: lo riceve la card dentro, anche quando è inclinata in 3d
      className="pointer-events-none absolute"
      style={{
        width: cartaLarghezza,
        height: cartaAltezza,
        left: `calc(${cartaLarghezza} / -2)`,
        top: `calc(${cartaAltezza} / -2)`,
        transformStyle: 'preserve-3d',
        backfaceVisibility: 'hidden',
      }}
    >
      {/* inclinazione sotto il cursore: motion, su un elemento diverso da quello che muove gsap */}
      <motion.div className="h-full w-full" style={{ rotateX: rx, rotateY: ry }} onPointerMove={muovi} onPointerLeave={esci}>
        <Link
          ref={refLink}
          to={`/progetti/${progetto.slug}`}
          data-card-slug={progetto.slug}
          data-cursore={frontale ? 'apri' : undefined}
          onClick={onClick}
          onFocus={onFocus}
          draggable={false}
          className="relative block h-full w-full overflow-hidden rounded-card border border-grigio bg-nero transition-transform duration-300 ease-entrata active:scale-[0.97]"
        >
          <motion.span
            className="absolute inset-0 block"
            initial={false}
            animate={{ scale: ingrandita ? 1.04 : 1 }}
            transition={{ duration: movimento.durata.standard, ease: [0.16, 1, 0.3, 1] }}
          >
            <Copertina progetto={progetto} prima={indice === 0} sizes="360px" />
          </motion.span>
          <span className="sr-only">{testoCard(progetto)}</span>
        </Link>
      </motion.div>
    </li>
  )
}
