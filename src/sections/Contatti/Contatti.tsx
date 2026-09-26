// contatti (claude.md §6.7): solo il volto e tre pulsanti. la pagina finisce qui.
// gsap: entrata legata allo scroll (disegno del volto, pulsanti sfalsati) sui contenitori esterni.
// motion: stati dei pulsanti (riempimento, testo che rotola, magnetismo) sugli elementi interni.
import { ArrowUpRight, Check, Copy } from 'lucide-react'
import { AnimatePresence, motion, useInView, useReducedMotion } from 'motion/react'
import { useEffect, useId, useRef, useState, type FocusEvent, type PointerEvent, type ReactNode, type RefObject } from 'react'
import { siBehance, siInstagram } from 'simple-icons'
import { Magnetico } from '@/components/interazioni/Magnetico'
import { RotolaAlPassaggio } from '@/components/testo/RotolaAlPassaggio'
import { Volto, type ManigliaVolto } from '@/components/volto/Volto'
import { media, movimento } from '@/config/movimento'
import { sito } from '@/config/sito'
import { copiaNegliAppunti } from '@/lib/appunti'
import { gsap, ScrollTrigger, useGSAP } from '@/lib/gsap'

type Bersaglio = RefObject<HTMLElement | null>

const ease = [0.16, 1, 0.3, 1] as const

function IconaMarchio({ path }: { path: string }) {
  return (
    <svg viewBox="0 0 24 24" className="size-[1.05em] shrink-0" fill="currentColor" aria-hidden="true">
      <path d={path} />
    </svg>
  )
}

export function Contatti() {
  const sezione = useRef<HTMLElement>(null)
  const volto = useRef<ManigliaVolto>(null)
  const [sveglio, setSveglio] = useState(false)
  const [guardato, setGuardato] = useState<Bersaglio | null>(null)
  const [copiata, setCopiata] = useState(false)
  const [annuncio, setAnnuncio] = useState('')
  const timer = useRef(0)

  useEffect(() => () => clearTimeout(timer.current), [])

  // entrata: il volto si disegna (addormentato) e poi si sveglia con un battito; i pulsanti salgono sfalsati
  useGSAP(
    () => {
      const q = gsap.utils.selector(sezione)
      const mm = gsap.matchMedia()
      mm.add({ ridotto: media.ridotto, normale: media.normale }, (ctx) => {
        const { ridotto } = ctx.conditions as Record<string, boolean>
        const pulsanti = q('[data-entrata]')

        if (ridotto) {
          volto.current?.disegna(1)
          setSveglio(true)
          gsap.set(pulsanti, { opacity: 0 })
          ScrollTrigger.create({
            trigger: sezione.current,
            start: 'top 70%',
            once: true,
            onEnter: () => gsap.to(pulsanti, { opacity: 1, duration: movimento.durata.ridotta }),
          })
          return
        }

        const tratto = { p: 0 }
        const disegna = () => volto.current?.disegna(tratto.p)
        disegna()
        setSveglio(false)
        gsap.set(pulsanti, { opacity: 0, y: 32 })

        const entrata = gsap
          .timeline({ paused: true })
          .to(tratto, { p: 1, duration: 1.6, ease: 'power1.inOut', onUpdate: disegna })
          .add(() => {
            // a disegno finito si sveglia (anche tornando indietro nella timeline si riaddormenta)
            const avanti = !entrata.reversed()
            setSveglio(avanti)
            if (avanti) gsap.delayedCall(0.4, () => volto.current?.battito())
          })
          .to(pulsanti, { opacity: 1, y: 0, duration: movimento.durata.standard, ease: movimento.ease.entrata, stagger: 0.08 }, 0.7)

        ScrollTrigger.create({
          trigger: sezione.current,
          start: 'top 55%',
          onEnter: () => entrata.timeScale(1).play(),
          onLeaveBack: () => entrata.timeScale(2).reverse(),
        })
      })
      return () => mm.revert()
    },
    { scope: sezione },
  )

  const copia = async () => {
    const riuscito = await copiaNegliAppunti(sito.email)
    // ultima riserva: se non si può copiare, si apre il programma di posta
    if (!riuscito) {
      location.href = `mailto:${sito.email}`
      return
    }
    setCopiata(true)
    setAnnuncio(sito.etichette.emailCopiata)
    volto.current?.occhiolino()
    volto.current?.sorridi()
    clearTimeout(timer.current)
    timer.current = window.setTimeout(() => {
      setCopiata(false)
      setAnnuncio('')
    }, 2000)
  }

  return (
    <section
      id="contatti"
      ref={sezione}
      aria-labelledby="titolo-contatti"
      className="relative flex min-h-svh flex-col items-center justify-center gap-[max(3rem,9svh)] px-4 pt-24 pb-[max(3rem,env(safe-area-inset-bottom))] md:px-8"
    >
      <h2 id="titolo-contatti" className="sr-only">
        {sito.sezioni.contatti}
      </h2>

      <div className="text-bianco">
        <Volto ref={volto} stato={sveglio ? undefined : 'dorme'} guarda={guardato ?? undefined} dimensione="max(36vmin, 9rem)" />
      </div>

      <ul className="flex w-full flex-col gap-3 md:w-auto md:flex-row md:gap-4">
        <li data-entrata className="w-full md:w-auto">
          <Pillola
            href={sito.link.instagram}
            testo={sito.contatti.instagram}
            icona={<IconaMarchio path={siInstagram.path} />}
            onSopra={setGuardato}
          />
        </li>
        <li data-entrata className="w-full md:w-auto">
          <Pillola
            href={sito.link.behance}
            testo={sito.contatti.behance}
            icona={<IconaMarchio path={siBehance.path} />}
            onSopra={setGuardato}
          />
        </li>
        <li data-entrata className="w-full md:w-auto">
          <Pillola
            testo={copiata ? sito.etichette.copiata : sito.contatti.email}
            icona={copiata ? <Check className="size-[1.1em] shrink-0" strokeWidth={1.5} aria-hidden="true" /> : <Copy className="size-[1.1em] shrink-0" strokeWidth={1.5} aria-hidden="true" />}
            suggerimento={sito.email}
            onClick={copia}
            onSopra={setGuardato}
          />
        </li>
      </ul>

      {/* annuncio per gli screen reader quando l’email è copiata */}
      <p role="status" aria-live="polite" className="sr-only">
        {annuncio}
      </p>
    </section>
  )
}

type PropsPillola = {
  testo: string
  icona: ReactNode
  /** link esterno (nuova scheda); se manca è un pulsante */
  href?: string
  onClick?: () => void
  /** piccolo suggerimento che compare al passaggio (l’indirizzo email) */
  suggerimento?: string
  /** avvisa quale pulsante ha il mouse (o il focus) sopra, così il volto lo guarda */
  onSopra: (bersaglio: Bersaglio | null) => void
}

// pulsante a pillola: al passaggio un riempimento bianco entra dal lato da cui arriva il cursore,
// il testo diventa nero (è una seconda copia, ritagliata dal riempimento) e rotola.
function Pillola({ testo, icona, href, onClick, suggerimento, onSopra }: PropsPillola) {
  const ridotto = useReducedMotion()
  const el = useRef<HTMLElement>(null)
  const [attivo, setAttivo] = useState(false)
  const [origine, setOrigine] = useState({ x: 50, y: 50 })
  // su touch non c’è passaggio del mouse: il valore non cambia durante la visita
  const [tocco] = useState(() => !matchMedia(media.mouse).matches)
  const inVista = useInView(el, { once: true, amount: 0.8 })
  const idSuggerimento = useId()

  // punto d’ingresso (o d’uscita) del cursore, in percentuale del pulsante
  const punto = (e: PointerEvent) => {
    const r = e.currentTarget.getBoundingClientRect()
    setOrigine({ x: ((e.clientX - r.left) / r.width) * 100, y: ((e.clientY - r.top) / r.height) * 100 })
  }
  const accendi = (si: boolean) => {
    setAttivo(si)
    onSopra(si ? el : null)
  }

  const eventi = {
    onPointerEnter: (e: PointerEvent) => {
      if (e.pointerType !== 'mouse') return
      punto(e)
      accendi(true)
    },
    onPointerLeave: (e: PointerEvent) => {
      if (e.pointerType !== 'mouse') return
      punto(e)
      accendi(false)
    },
    // su touch: il riempimento entra dal punto toccato ed esce poco dopo
    onPointerDown: (e: PointerEvent) => {
      if (e.pointerType === 'mouse') return
      punto(e)
      accendi(true)
      setTimeout(() => accendi(false), 450)
    },
    onFocus: (e: FocusEvent<HTMLElement>) => {
      if (!e.currentTarget.matches(':focus-visible')) return
      setOrigine({ x: 50, y: 50 })
      accendi(true)
    },
    onBlur: () => accendi(false),
  }

  // su touch il testo rotola una volta quando il pulsante entra in vista
  const rotola = attivo || (tocco && inVista)
  const riempimento = ridotto
    ? { opacity: attivo ? 1 : 0 }
    : { clipPath: `circle(${attivo ? 150 : 0}% at ${origine.x}% ${origine.y}%)` }

  // due copie del contenuto: bianca sotto, nera dentro il riempimento (rotolano insieme)
  const contenuto = (nero: boolean) => (
    <span className="relative flex items-center justify-center gap-2.5" aria-hidden={nero || undefined}>
      <span className="relative inline-flex overflow-hidden py-[0.1em]">
        <AnimatePresence initial={false} mode="popLayout">
          <motion.span
            key={testo}
            className="inline-flex items-center gap-2.5"
            initial={ridotto ? { opacity: 0 } : { y: '110%' }}
            animate={ridotto ? { opacity: 1 } : { y: '0%' }}
            exit={ridotto ? { opacity: 0 } : { y: '-110%' }}
            transition={{ duration: ridotto ? movimento.durata.ridotta : 0.5, ease }}
          >
            {icona}
            <RotolaAlPassaggio testo={testo} attivo={rotola} />
          </motion.span>
        </AnimatePresence>
      </span>
      {href && <ArrowUpRight className="size-[1.1em] shrink-0" strokeWidth={1.5} aria-hidden="true" />}
    </span>
  )

  const classi =
    'relative isolate flex min-h-14 w-full items-center justify-center overflow-hidden rounded-pillola border border-grigio px-8 text-corrente text-bianco md:w-auto md:min-w-44'

  const interno = (
    <>
      {contenuto(false)}
      <motion.span
        aria-hidden="true"
        className="pointer-events-none absolute inset-0 flex items-center justify-center rounded-pillola bg-bianco px-8 text-nero"
        initial={false}
        animate={riempimento}
        transition={{ duration: ridotto ? movimento.durata.ridotta : 0.55, ease }}
      >
        {contenuto(true)}
      </motion.span>
    </>
  )

  return (
    <Magnetico className="relative w-full md:w-auto">
      {href ? (
        <a ref={el as RefObject<HTMLAnchorElement>} href={href} target="_blank" rel="noopener noreferrer" className={classi} {...eventi}>
          {interno}
        </a>
      ) : (
        <button
          ref={el as RefObject<HTMLButtonElement>}
          type="button"
          onClick={onClick}
          aria-describedby={suggerimento ? idSuggerimento : undefined}
          className={classi}
          {...eventi}
        >
          {interno}
        </button>
      )}

      {/* suggerimento con l’indirizzo: compare al passaggio del mouse o con il focus da tastiera */}
      {suggerimento && (
        <motion.span
          id={idSuggerimento}
          role="tooltip"
          className="pointer-events-none absolute bottom-full left-1/2 mb-3 -translate-x-1/2 rounded-pillola bg-bianco px-3 py-1.5 text-etichetta whitespace-nowrap text-nero"
          initial={false}
          animate={{ opacity: attivo && !tocco ? 1 : 0, y: attivo && !tocco ? 0 : 6 }}
          transition={{ duration: movimento.durata.micro, ease }}
        >
          {suggerimento}
        </motion.span>
      )}
    </Magnetico>
  )
}
