// il protagonista del sito: il volto, vivo (claude.md §5).
// un solo componente svg riusato ovunque. gsap comanda tutto ciò che succede dentro l’svg
// (palpebre, pupille, disegno dei tratti, sorriso); chi lo usa può animare solo il contenitore esterno.
import { useImperativeHandle, useId, useLayoutEffect, useRef, type Ref, type RefObject } from 'react'
import { media, movimento } from '@/config/movimento'
import { gsap, useGSAP } from '@/lib/gsap'
import {
  APERTURA,
  ASSE,
  LENTE,
  NASO,
  palpebra,
  PONTE,
  PUPILLA,
  SGUARDO_MAX,
  SORRISO,
  SORRISO_AMPIO,
  SPESSORE,
  sottoPalpebra,
  VIEWBOX,
} from './geometria'
import { sguardo, type Punto } from './sguardo'
import { useVolto, type Azione } from './VoltoContext'

export type StatoVolto = 'dorme' | 'naturale' | 'sveglio' | 'occhiolino' | 'sorride'

export type ManigliaVolto = {
  /** disegna i tratti da 0 (niente) a 1 (completo), senza passare da react: utile con lo scroll */
  disegna: (p: number) => void
  battito: () => void
  occhiolino: () => void
  sorridi: () => void
  svg: SVGSVGElement | null
}

type Props = {
  /** se manca, segue l’umore globale (sveglio o addormentato) */
  stato?: StatoVolto
  /** un punto dello schermo o un elemento da guardare; se manca, segue il cursore (o l’ultimo tocco) */
  guarda?: Punto | RefObject<Element | null> | null
  /** quanto è disegnato, da 0 a 1 */
  disegno?: number
  /** larghezza (es. "26vmin" o 200) */
  dimensione?: string | number
  /** se presente il volto è un’immagine con questa descrizione; altrimenti è decorativo */
  etichetta?: string
  /** clic o tap: occhiolino */
  interattivo?: boolean
  /** id di un filtro svg (es. il tratto “a matita” dell’header) */
  filtro?: string
  className?: string
  ref?: Ref<ManigliaVolto>
}

// occhio 0 = sinistro sullo schermo, 1 = destro (disegnato a specchio)
type Occhio = { apertura: number; chiusura: number }

export function Volto({ stato, guarda, disegno, dimensione, etichetta, interattivo = true, filtro, className, ref }: Props) {
  const { umore, ascoltaAzioni } = useVolto()
  const id = useId().replace(/:/g, '')
  const svgRef = useRef<SVGSVGElement>(null)
  const palpebre = useRef<(SVGPathElement | null)[]>([])
  const clip = useRef<(SVGPathElement | null)[]>([])
  const pupille = useRef<(SVGEllipseElement | null)[]>([])
  const sorriso = useRef<SVGPathElement>(null)
  const occhi = useRef<Occhio[]>([
    { apertura: APERTURA.naturale, chiusura: 0 },
    { apertura: APERTURA.naturale, chiusura: 0 },
  ])
  const disegnoTl = useRef<gsap.core.Timeline | null>(null)
  const azioni = useRef<Record<Azione, () => void> | null>(null)
  const riallinea = useRef<() => void>(() => {})

  const effettivo: StatoVolto = stato ?? (umore === 'dorme' ? 'dorme' : 'naturale')
  const effettivoRef = useRef(effettivo)
  const guardaRef = useRef(guarda)
  useLayoutEffect(() => {
    effettivoRef.current = effettivo
    guardaRef.current = guarda
    riallinea.current()
  })

  const disegnaOcchi = () => {
    occhi.current.forEach((o, i) => {
      const a = o.apertura * (1 - o.chiusura)
      palpebre.current[i]?.setAttribute('d', palpebra(a))
      clip.current[i]?.setAttribute('d', sottoPalpebra(a))
    })
  }

  const { contextSafe } = useGSAP(
    () => {
      const ridotto = matchMedia(media.ridotto).matches
      const svg = svgRef.current!
      disegnaOcchi()

      // --- sguardo: pupille che seguono con inerzia ---
      const muovi = pupille.current.map((p) => ({
        x: gsap.quickTo(p, 'x', { duration: 0.6, ease: 'power3.out' }),
        y: gsap.quickTo(p, 'y', { duration: 0.6, ease: 'power3.out' }),
      }))

      const aggiornaSguardo = () => {
        if (ridotto) return
        const { punto, scorre, tocco } = sguardo.get()
        const box = svg.getBoundingClientRect()
        if (!box.width) return
        const scala = box.width / VIEWBOX.larghezza

        let bersaglio: Punto | null = punto
        const g = guardaRef.current
        if (g && 'current' in g) {
          const r = g.current?.getBoundingClientRect()
          if (r) bersaglio = { x: r.left + r.width / 2, y: r.top + r.height / 2 }
        } else if (g) bersaglio = g

        const addormentato = effettivoRef.current === 'dorme'
        ;[LENTE.cx, VIEWBOX.larghezza - LENTE.cx].forEach((cx, i) => {
          let dx = 0
          let dy = 0
          if (addormentato) {
            // occhi chiusi: pupille al centro
          } else if (tocco && scorre && !g) {
            // su mobile, mentre si scorre, guarda in basso
            dy = SGUARDO_MAX
          } else if (bersaglio) {
            const vx = bersaglio.x - (box.left + cx * scala)
            const vy = bersaglio.y - (box.top + LENTE.cy * scala)
            const distanza = Math.hypot(vx, vy) || 1
            const intensita = SGUARDO_MAX * Math.min(1, distanza / Math.max(box.width, 240))
            dx = (vx / distanza) * intensita
            dy = (vy / distanza) * intensita
          }
          // l’occhio destro è disegnato a specchio: la x va invertita
          muovi[i].x(i === 1 ? -dx : dx)
          muovi[i].y(dy)
        })
      }
      aggiornaSguardo()
      riallinea.current = aggiornaSguardo
      const smetti = sguardo.ascolta(aggiornaSguardo)

      // --- azioni ---
      const tutti = occhi.current
      const battito = () => {
        if (ridotto || effettivoRef.current === 'dorme' || effettivoRef.current === 'occhiolino') return
        gsap.to(tutti, { chiusura: 1, duration: 0.07, ease: 'power2.in', yoyo: true, repeat: 1, repeatDelay: 0.03, onUpdate: disegnaOcchi, overwrite: 'auto' })
      }
      const occhiolino = () => {
        if (effettivoRef.current === 'dorme') return
        gsap
          .timeline({ onUpdate: disegnaOcchi })
          .to(tutti[1], { chiusura: 1, duration: ridotto ? 0 : 0.1, ease: 'power2.in' })
          .to(tutti[1], { chiusura: 0, duration: ridotto ? 0 : 0.22, ease: 'power2.out' }, '+=0.35')
      }
      const sorridi = () => {
        const d = ridotto ? 0 : movimento.durata.micro
        gsap
          .timeline()
          .to(sorriso.current, { morphSVG: SORRISO_AMPIO, duration: d, ease: 'power2.out' })
          .to(sorriso.current, { morphSVG: SORRISO, duration: d * 2, ease: 'power2.inOut' }, '+=1.1')
      }
      azioni.current = { battito, occhiolino, sorriso: sorridi }
      const smettiAzioni = ascoltaAzioni((a) => azioni.current?.[a]())

      // --- battito di palpebre a intervalli casuali ---
      let prossimo: gsap.core.Tween | null = null
      const programma = () => {
        prossimo = gsap.delayedCall(gsap.utils.random(movimento.volto.battitoMin, movimento.volto.battitoMax), () => {
          battito()
          programma()
        })
      }
      if (!ridotto) programma()

      return () => {
        smetti()
        smettiAzioni()
        prossimo?.kill()
        // la timeline del disegno appartiene a questo contesto: al rimontaggio va ricreata
        disegnoTl.current = null
      }
    },
    { scope: svgRef },
  )

  // --- cambio di stato: palpebre e sorriso ---
  useGSAP(
    () => {
      const ridotto = matchMedia(media.ridotto).matches
      const [sx, dx] = occhi.current
      const addormenta = effettivo === 'dorme'
      const durata = ridotto ? 0 : addormenta ? 1.2 : 0.35
      const apertura = APERTURA[effettivo === 'occhiolino' ? 'naturale' : effettivo]

      gsap.to([sx, dx], { apertura, duration: durata, ease: addormenta ? 'power2.inOut' : 'power3.out', onUpdate: disegnaOcchi, overwrite: 'auto' })
      gsap.to(dx, { chiusura: effettivo === 'occhiolino' ? 1 : 0, duration: ridotto ? 0 : 0.15, onUpdate: disegnaOcchi })
      gsap.to(sorriso.current, { morphSVG: effettivo === 'sorride' ? SORRISO_AMPIO : SORRISO, duration: ridotto ? 0 : movimento.durata.micro, ease: 'power2.out' })
      riallinea.current()
    },
    { dependencies: [effettivo], scope: svgRef },
  )

  // --- disegno controllato dalla prop ---
  // la timeline si crea solo al primo uso, così un volto senza “disegno” è subito completo
  // (la funzione legge i ref solo quando viene chiamata, mai durante il disegno del componente)
  // oxlint-disable-next-line react/refs
  const disegna = contextSafe((p: number) => {
    if (!disegnoTl.current) {
      // ordine: lenti, ponte, naso, palpebre, pupille, sorriso
      const tratti = gsap.utils.toArray<SVGGeometryElement>('[data-tratto]', svgRef.current)
      const tl = gsap.timeline({ paused: true, defaults: { ease: 'power1.inOut', duration: 1 } })
      tratti.forEach((t) => tl.fromTo(t, { drawSVG: '0%' }, { drawSVG: '100%' }, Number(t.dataset.tratto) * 0.6))
      disegnoTl.current = tl
    }
    const tl = disegnoTl.current
    tl.progress(Math.min(1, Math.max(0, p)))
    // a disegno completo si tolgono i trattini, così le palpebre possono cambiare forma liberamente
    if (p >= 1) gsap.set(gsap.utils.toArray('[data-tratto]', svgRef.current), { clearProps: 'strokeDasharray,strokeDashoffset' })
  })
  useGSAP(() => {
    if (disegno !== undefined) disegna(disegno)
  }, { dependencies: [disegno], scope: svgRef })

  useImperativeHandle(ref, () => ({
    disegna,
    battito: () => azioni.current?.battito(),
    occhiolino: () => azioni.current?.occhiolino(),
    sorridi: () => azioni.current?.sorriso(),
    get svg() {
      return svgRef.current
    },
  }))

  // oxlint-disable-next-line react/refs -- come sopra: il ref si legge solo al clic
  const clic = contextSafe(() => {
    if (interattivo) azioni.current?.occhiolino()
  })

  const occhio = (i: 0 | 1) => (
    <g transform={i === 1 ? `translate(${ASSE * 2} 0) scale(-1 1)` : undefined}>
      <g clipPath={`url(#${id}-lente)`}>
        <g clipPath={`url(#${id}-sotto-${i})`}>
          <ellipse ref={(el) => void (pupille.current[i] = el)} data-tratto="4" cx={PUPILLA.cx} cy={PUPILLA.cy} rx={PUPILLA.rx} ry={PUPILLA.ry} />
        </g>
        <path ref={(el) => void (palpebre.current[i] = el)} data-tratto="3" d={palpebra(APERTURA.naturale)} />
      </g>
      <ellipse data-tratto="0" cx={LENTE.cx} cy={LENTE.cy} rx={LENTE.rx} ry={LENTE.ry} />
    </g>
  )

  return (
    <svg
      ref={svgRef}
      viewBox={`0 0 ${VIEWBOX.larghezza} ${VIEWBOX.altezza}`}
      className={className}
      style={{ width: dimensione, height: 'auto', overflow: 'visible' }}
      {...(etichetta ? { role: 'img', 'aria-label': etichetta } : { 'aria-hidden': true })}
      onClick={clic}
    >
      <defs>
        <clipPath id={`${id}-lente`}>
          <ellipse cx={LENTE.cx} cy={LENTE.cy} rx={LENTE.rx} ry={LENTE.ry} />
        </clipPath>
        {[0, 1].map((i) => (
          <clipPath key={i} id={`${id}-sotto-${i}`}>
            <path ref={(el) => void (clip.current[i] = el)} d={sottoPalpebra(APERTURA.naturale)} />
          </clipPath>
        ))}
      </defs>
      <g fill="none" stroke="currentColor" strokeWidth={SPESSORE.occhio} filter={filtro ? `url(#${filtro})` : undefined}>
        {occhio(0)}
        {occhio(1)}
        <path data-tratto="1" d={PONTE} strokeWidth={SPESSORE.naso} />
        <path data-tratto="2" d={NASO} strokeWidth={SPESSORE.naso} />
        <path ref={sorriso} data-tratto="5" d={SORRISO} strokeWidth={SPESSORE.sorriso} />
      </g>
    </svg>
  )
}
