// header “dal segno al volume” (claude.md §6.2): sezione bloccata, una sola timeline guidata dallo scroll,
// quattro fasi che raccontano le discipline attraverso il volto.
import { Component, lazy, Suspense, useEffect, useRef, useState, type ReactNode } from 'react'
import { useAvvio } from '@/components/preloader/AvvioContext'
import { NomePesoVariabile } from '@/components/testo/NomePesoVariabile'
import { TestoCheRotola } from '@/components/testo/TestoCheRotola'
import { Volto } from '@/components/volto/Volto'
import type { Controllo3D } from '@/components/volto/Volto3D'
import { media, movimento, volto as misure } from '@/config/movimento'
import { sito } from '@/config/sito'
import { gsap, useGSAP } from '@/lib/gsap'
import { progetti } from '@/lib/progetti'
import { CARTA, FINESTRA, ID_MATITA } from './misure'
import { Tavola } from './Tavola'

const Volto3D = lazy(() => import('@/components/volto/Volto3D'))

const FASI = ['01 illustrazione', '02 branding', '03 3d', '04 web design']

/** se il 3d non si carica (rete, webgl assente) il resto del sito continua a funzionare */
class Senza3D extends Component<{ children: ReactNode }, { rotto: boolean }> {
  state = { rotto: false }
  static getDerivedStateFromError() {
    return { rotto: true }
  }
  componentDidCatch(errore: unknown) {
    console.warn('volto 3d non disponibile:', errore)
  }
  render() {
    return this.state.rotto ? null : this.props.children
  }
}

export function Header() {
  const { pronto, voltoHeader } = useAvvio()
  const sezione = useRef<HTMLElement>(null)
  const palco = useRef<HTMLDivElement>(null)
  const controllo = useRef<Controllo3D>({ rotazione: 0, scala: 1, luce: 0, inclinazione: 0 })
  const [fase, setFase] = useState(-1)
  const [attivo3D, setAttivo3D] = useState(false)
  const [mobile, setMobile] = useState(() => matchMedia(media.mobile).matches)
  const [ridotto] = useState(() => matchMedia(media.ridotto).matches)
  const [guardaGiu, setGuardaGiu] = useState(false)

  useEffect(() => {
    const mq = matchMedia(media.mobile)
    const cambia = () => setMobile(mq.matches)
    mq.addEventListener('change', cambia)
    return () => mq.removeEventListener('change', cambia)
  }, [])

  // invito a scorrere, senza parole: ogni tanto il volto guarda in basso
  useEffect(() => {
    if (!pronto || ridotto) return
    let ritorno = 0
    const id = setInterval(() => {
      if (scrollY > 10) return
      setGuardaGiu(true)
      ritorno = window.setTimeout(() => setGuardaGiu(false), 1400)
    }, 5200)
    return () => {
      clearInterval(id)
      clearTimeout(ritorno)
      setGuardaGiu(false)
    }
  }, [pronto, ridotto])

  // lettere del nome nascoste finché il preloader non finisce, poi salgono una a una
  // (y: 0 sempre esplicito: gsap non deve scambiare lo spostamento in percentuale per pixel)
  useGSAP(
    () => {
      const lettere = gsap.utils.toArray<HTMLElement>('[data-nome] [data-lettera]')
      if (ridotto) return
      if (!pronto) {
        gsap.set(lettere, { yPercent: 140, y: 0 })
        gsap.set('[data-volto-svg]', { opacity: 0 })
        return
      }
      gsap.set('[data-volto-svg]', { opacity: 1 })
      gsap.to(lettere, { yPercent: 0, y: 0, duration: movimento.durata.grande, ease: movimento.ease.entrata, stagger: 0.035 })
    },
    { dependencies: [pronto], scope: palco },
  )

  // la timeline delle quattro fasi
  useGSAP(
    () => {
      const mm = gsap.matchMedia()
      mm.add({ mobile: media.mobile, desktop: media.anello, ridotto: media.ridotto }, (ctx) => {
        const { mobile: suMobile, ridotto: conRidotto } = ctx.conditions as Record<string, boolean>
        if (conRidotto) return

        const q = gsap.utils.selector(palco)
        const spostamento = q('[data-spostamento]')[0]
        const rumore = q('[data-rumore]')[0]
        const voltoSvg = q('[data-volto-svg]')
        const box = q('[data-volto-box]')
        const logotipo = q('[data-logotipo]')
        const tela = q('[data-tela]')
        const c = controllo.current

        gsap.set(q('[data-schizzi] [data-disegna], [data-griglia] [data-disegna], [data-finestra] [data-disegna]'), { drawSVG: '0%' })
        gsap.set(q('[data-cornice]'), { drawSVG: '0%' })
        gsap.set(q('[data-campione]'), { scale: 0, transformOrigin: '50% 50%' })
        gsap.set(q('[data-logotipo] [data-lettera]'), { yPercent: 140 })
        gsap.set(tela, { opacity: 0 })

        // il tratto “trema” come una matita: il disegno del rumore cambia a scatti
        let seme = 3
        const tremolio = setInterval(() => {
          if (Number(spostamento.getAttribute('scale')) > 0.3) rumore.setAttribute('seed', String((seme = (seme % 9) + 1)))
        }, 120)

        const aggiornaFiltro = () => {
          const attivo = Number(spostamento.getAttribute('scale')) > 0.05
          q('[data-volto-svg] svg > g, [data-schizzi]').forEach((el) =>
            attivo ? el.setAttribute('filter', `url(#${ID_MATITA})`) : el.removeAttribute('filter'),
          )
        }

        const tl = gsap.timeline({
          defaults: { ease: 'none' },
          scrollTrigger: {
            trigger: palco.current,
            pin: true,
            start: 'top top',
            end: `+=${suMobile ? movimento.header.pinMobile : movimento.header.pinDesktop}%`,
            scrub: suMobile ? movimento.scrub.mobile : movimento.scrub.desktop,
            invalidateOnRefresh: true,
            onUpdate: (st) => {
              const p = st.progress
              setFase(p < 0.012 ? -1 : Math.min(3, Math.floor(p * 4)))
              setAttivo3D(st.isActive && p > 0.45)
            },
            onToggle: (st) => !st.isActive && setAttivo3D(false),
          },
        })

        // unità della timeline: da 0 a 100, come la percentuale di scroll
        tl.addLabel('illustrazione', 0).addLabel('branding', 25).addLabel('3d', 50).addLabel('web design', 75)

        // interfaccia: invito a scorrere via, etichetta e trattini dentro
        tl.to(q('[data-invito]'), { opacity: 0, duration: 2 }, 0)
        tl.fromTo(q('[data-interfaccia]'), { opacity: 0 }, { opacity: 1, duration: 2, immediateRender: false }, 0.5)
        q('[data-trattino]').forEach((t, i) => tl.fromTo(t, { scaleX: 0 }, { scaleX: 1, duration: 25 }, i * 25))

        // --- 01 illustrazione ---
        tl.fromTo(q('[data-nome] [data-lettera]'), { yPercent: 0, y: 0 }, { yPercent: -140, y: 0, duration: 6, stagger: 0.25, immediateRender: false }, 0)
        tl.to(spostamento, { attr: { scale: 6 }, duration: 12, onUpdate: aggiornaFiltro }, 3)
        tl.to(q('[data-schizzi] [data-disegna]'), { drawSVG: '100%', duration: 6, stagger: 0.8 }, 4)

        // --- 02 branding ---
        tl.to(spostamento, { attr: { scale: 0 }, duration: 6, onUpdate: aggiornaFiltro }, 25)
        tl.to(q('[data-schizzi]'), { opacity: 0, duration: 6 }, 26)
        tl.to(q('[data-griglia] [data-disegna]'), { drawSVG: '100%', duration: 6, stagger: 0.5 }, 28)
        tl.to(q('[data-rispetto]'), { opacity: 1, duration: 4 }, 36)
        tl.to(
          box,
          suMobile
            ? { y: () => -innerHeight * 0.08, duration: 8, ease: 'power1.inOut' }
            : { x: () => -((logotipo[0]?.offsetWidth ?? 0) + innerWidth * 0.04) / 2, duration: 8, ease: 'power1.inOut' },
          31,
        )
        tl.to(q('[data-logotipo] [data-lettera]'), { yPercent: 0, duration: 5, stagger: 0.2 }, 35)
        tl.to(q('[data-campione]'), { scale: 1, duration: 3, stagger: 1, ease: 'back.out(2)' }, 39)

        // --- 03 3d ---
        tl.to([q('[data-griglia]'), q('[data-campioni]'), logotipo], { opacity: 0, duration: 4 }, 50)
        tl.to(box, { x: 0, y: 0, duration: 6, ease: 'power1.inOut' }, 50)
        tl.to(tela, { opacity: 1, duration: 4 }, 56)
        tl.to(voltoSvg, { opacity: 0, duration: 4 }, 58)
        tl.to(c, { inclinazione: 1, duration: 4 }, 58)
        tl.to(c, { rotazione: -35, duration: 12, ease: 'power1.inOut' }, 60)
        tl.to(c, { luce: 1, duration: 16 }, 58)

        // --- 04 web design ---
        tl.to(c, { rotazione: -12, scala: 0.6, duration: 8, ease: 'power1.inOut' }, 75)
        tl.to(q('[data-cornice]'), { drawSVG: '100%', duration: 5 }, 78)
        tl.to(q('[data-finestra] [data-contenuto-finestra] [data-disegna]'), { drawSVG: '100%', duration: 3, stagger: 0.4 }, 80)
        const pulsante = { x: FINESTRA.x + FINESTRA.w - 52, y: FINESTRA.y + FINESTRA.h - 27 }
        tl.fromTo(q('[data-puntatore]'), { opacity: 0, x: pulsante.x - 70, y: pulsante.y - 50 }, { opacity: 1, x: pulsante.x, y: pulsante.y, duration: 4, ease: 'power2.out', immediateRender: false }, 84)
        tl.to(q('[data-puntatore]'), { scale: 0.8, duration: 0.6, yoyo: true, repeat: 1, transformOrigin: '0 0' }, 88.5)
        tl.to(q('[data-pulsante]'), { fillOpacity: 1, duration: 0.6, yoyo: true, repeat: 1 }, 88.5)
        tl.to(q('[data-contenuto-finestra]'), { opacity: 0, duration: 2 }, 91)
        const carta = { x: CARTA.x, y: CARTA.y, width: CARTA.w, height: CARTA.h, rx: CARTA.r }
        tl.to(q('[data-cornice]'), { attr: carta, duration: 5, ease: 'power2.inOut' }, 92)
        tl.to(c, { scala: 0.42, duration: 5, ease: 'power2.inOut' }, 92)
        tl.to(tela, { opacity: 0, duration: 4 }, 95)
        tl.to(q('[data-copertina]'), { opacity: 1, duration: 4 }, 95)
        // il bordo passa dal bianco al grigio: bianco al 31,5% sul nero = #4d4b4a, così anche i passaggi restano nella palette
        tl.to(q('[data-cornice]'), { strokeOpacity: 0.315, duration: 3 }, 97)
        // resta solo la card: da qui la prende il portfolio (claude.md §6.3)
        tl.to(q('[data-interfaccia]'), { opacity: 0, duration: 2 }, 97)
        tl.to({}, { duration: 1 }, 99)

        return () => clearInterval(tremolio)
      })
      return () => mm.revert()
    },
    { scope: palco },
  )

  const copertina = progetti[0]?.copertinaCard ?? progetti[0]?.copertina

  return (
    <section id="header" ref={sezione} aria-label={sito.sezioni.header} className="relative">
      <div ref={palco} className="relative h-svh overflow-hidden">
        {/* il volto 3d: una sola scena, dietro a tutto, attiva solo nelle fasi che la usano */}
        {!ridotto && (
          <div data-tela className="pointer-events-none absolute inset-0 z-0">
            {pronto && (
              <Senza3D>
                <Suspense fallback={null}>
                  <Volto3D riferimento={voltoHeader} controllo={controllo} attivo={attivo3D} mobile={mobile} />
                </Suspense>
              </Senza3D>
            )}
          </div>
        )}

        <h1 data-nome aria-label={`${sito.nome} ${sito.cognome}`} className="pointer-events-none absolute inset-0 z-10 flex flex-col justify-between px-4 pt-6 pb-8 text-nome md:px-8 md:pt-8">
          <NomePesoVariabile testo={sito.nome} className="pointer-events-auto block text-center md:text-left" />
          <NomePesoVariabile testo={sito.cognome} className="pointer-events-auto block text-center md:text-right" />
        </h1>

        <div className="absolute inset-0 z-10 flex items-center justify-center">
          <div data-volto-box className="relative flex items-center max-md:flex-col">
            <div ref={voltoHeader} className="relative">
              <div data-volto-svg>
                <Volto dimensione={misure.header} etichetta={sito.etichette.logo} guarda={guardaGiu ? { x: innerWidth / 2, y: innerHeight * 1.2 } : undefined} />
              </div>
              {!ridotto && <Tavola copertina={copertina} className="pointer-events-none absolute inset-0 h-full w-full" />}
            </div>
            {/* il nome composto accanto al volto come logotipo (fase branding) */}
            {!ridotto && (
            <p
              data-logotipo
              aria-hidden="true"
              className="pointer-events-none absolute left-full ml-[4vw] text-[clamp(1.5rem,3.4vw,3.25rem)] leading-[0.9] font-light tracking-[-0.03em] whitespace-nowrap max-md:top-full max-md:left-1/2 max-md:mt-16 max-md:ml-0 max-md:-translate-x-1/2 max-md:text-center"
            >
              <NomePesoVariabile testo={sito.nome} className="block" pesoMax={300} />
              <NomePesoVariabile testo={sito.cognome} className="block" pesoMax={300} />
            </p>
            )}
          </div>
        </div>

        {/* etichetta della fase e avanzamento */}
        <div data-interfaccia aria-hidden={fase < 0} className="pointer-events-none absolute inset-x-4 bottom-6 z-10 flex items-end justify-between text-etichetta cifre-tabellari opacity-0 md:inset-x-8 md:bottom-8">
          <TestoCheRotola testo={fase >= 0 ? FASI[fase] : ''} />
          <div className="flex gap-1.5" aria-hidden="true">
            {FASI.map((f) => (
              <span key={f} className="relative h-px w-6 overflow-hidden bg-grigio">
                <span data-trattino className="absolute inset-0 origin-left bg-bianco" />
              </span>
            ))}
          </div>
        </div>

        {/* invito a scorrere: una linea sottile che pulsa */}
        {!ridotto && (
          <div data-invito aria-hidden="true" className="pointer-events-none absolute bottom-0 left-1/2 z-10 h-14 w-px -translate-x-1/2 overflow-hidden">
            <span className="invito-linea absolute inset-0 bg-bianco" />
          </div>
        )}
      </div>
    </section>
  )
}
