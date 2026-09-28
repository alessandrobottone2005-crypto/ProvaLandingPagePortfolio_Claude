// pannello del progetto, aperto sopra la home come rotta modale (claude.md §6.5).
// - la home resta montata sotto: chiudendo si torna esattamente dove si era
// - apertura: la copertina vola dalla card alla testata, la pagina sotto si scurisce e arretra
// - chiusura: pulsante, esc, clic fuori, tasto indietro, trascinamento in giù su mobile
// - radix dialog: focus intrappolato, aria-modal, focus restituito alla card
// gsap anima pannello, velo e pagina; motion solo le micro-interazioni dei pulsanti.
import { ArrowUpRight, X } from 'lucide-react'
import { Dialog as DialogPrimitive } from 'radix-ui'
import { useCallback, useEffect, useLayoutEffect, useRef, useState } from 'react'
import { Link, Navigate, useLocation, useNavigate, useParams, type Location } from 'react-router'
import { Magnetico } from '@/components/interazioni/Magnetico'
import { RotolaAlPassaggio } from '@/components/testo/RotolaAlPassaggio'
import { Dialog, DialogPortal } from '@/components/ui/dialog'
import { media, movimento } from '@/config/movimento'
import { sito } from '@/config/sito'
import { gsap } from '@/lib/gsap'
import { progettoSuccessivo, trovaProgetto } from '@/lib/progetti'
import { fermaScroll, riprendiScroll } from '@/lib/scroll'
import { useMediaQuery } from '@/lib/useMediaQuery'
import { Blocchi } from './Blocchi'
import { arretraPagina, ripristinaPagina, volaCopertina, type Rettangolo } from './transizioni'

/** stato di navigazione passato dalle card: la pagina sotto e il rettangolo della copertina cliccata */
type StatoNavigazione = { sfondo?: Location; origine?: Rettangolo } | null

export default function Pannello() {
  const { slug } = useParams()
  const location = useLocation()
  const progetto = trovaProgetto(slug)
  // slug inesistente → home
  if (!progetto) return <Navigate to="/" replace />
  return <PannelloAperto key="pannello" slug={progetto.slug} stato={location.state as StatoNavigazione} />
}

function PannelloAperto({ slug, stato }: { slug: string; stato: StatoNavigazione }) {
  const navigate = useNavigate()
  const progetto = trovaProgetto(slug)!
  const successivo = progettoSuccessivo(slug)
  const sfondo = stato?.sfondo

  const velo = useRef<HTMLDivElement>(null)
  const foglio = useRef<HTMLDivElement>(null)
  // il portale di radix monta il contenuto un giro dopo: le animazioni partono quando il foglio esiste davvero
  const [montato, setMontato] = useState(false)
  const refFoglio = useCallback((el: HTMLDivElement | null) => {
    foglio.current = el
    if (el) setMontato(true)
  }, [])
  const scorrimento = useRef<HTMLDivElement>(null)
  const testata = useRef<HTMLDivElement>(null)
  const articolo = useRef<HTMLElement>(null)
  const uscendo = useRef(false)
  const chiusura = useRef<gsap.core.Timeline | null>(null)
  const primoSlug = useRef(slug)
  const ultimoSlug = useRef(slug)

  const ridotto = useMediaQuery(media.ridotto)
  const mobile = useMediaQuery(media.mobile)
  const preferenza = useRef(ridotto)
  useEffect(() => { preferenza.current = ridotto }, [ridotto])

  // scroll della pagina fermo mentre il pannello è aperto; la pagina torna al suo posto alla chiusura
  // (anche con il tasto indietro del browser, che smonta il pannello di colpo)
  useEffect(() => {
    fermaScroll()
    return () => {
      // Indietro o cambio rotta annulla anche la navigazione differita della chiusura.
      chiusura.current?.kill()
      ripristinaPagina(!preferenza.current)
      riprendiScroll()
    }
  }, [])

  // entrata
  useLayoutEffect(() => {
    if (!montato || uscendo.current) return
    const origine = stato?.origine
    const destinazione = testata.current!.getBoundingClientRect()
    // Se la preferenza cambia durante il volo, la copertina torna subito visibile.
    const immagine = testata.current!.querySelector('img')!
    immagine.style.opacity = ''
    const ctx = gsap.context(() => {
      if (ridotto) {
        ripristinaPagina(false)
        gsap.fromTo([velo.current, foglio.current], { opacity: 0 }, { opacity: 1, duration: movimento.durata.ridotta, ease: 'none' })
        return
      }
      arretraPagina()
      gsap.fromTo(velo.current, { opacity: 0 }, { opacity: 1, duration: movimento.durata.standard, ease: 'power2.out' })
      if (mobile) {
        // foglio che sale dal basso
        gsap.fromTo(foglio.current, { yPercent: 100 }, { yPercent: 0, duration: movimento.pannello.entrata, ease: movimento.ease.entrata, clearProps: 'transform' })
      } else {
        gsap.fromTo(
          foglio.current,
          { opacity: 0, y: 48 },
          { opacity: 1, y: 0, duration: movimento.pannello.entrata, ease: movimento.ease.entrata, delay: origine ? 0.15 : 0, clearProps: 'transform' },
        )
      }
      // contenuti sfalsati
      gsap.from(articolo.current!.querySelectorAll(':scope > [data-entra]'), {
        opacity: 0,
        y: 24,
        duration: movimento.durata.standard,
        ease: movimento.ease.entrata,
        stagger: 0.06,
        delay: 0.2,
      })
    })

    // la copertina vola dalla card alla testata (solo se si arriva da una card)
    let annullaVolo: (() => void) | undefined
    if (origine && !ridotto && destinazione.width > 0) {
      const img = testata.current!.querySelector('img')!
      img.style.opacity = '0'
      annullaVolo = volaCopertina(progetto.copertina, origine, destinazione, () => (img.style.opacity = ''))
    }
    return () => {
      annullaVolo?.()
      ctx.revert()
    }
    // Apertura e cambio della preferenza di movimento; il resize aggiorna soltanto interazioni e chiusura.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [montato, ridotto])

  // passando al progetto successivo: torno in cima e il nuovo contenuto entra in dissolvenza
  useLayoutEffect(() => {
    if (slug === ultimoSlug.current || !articolo.current) return
    ultimoSlug.current = slug
    scorrimento.current?.scrollTo({ top: 0 })
    const tw = gsap.from(articolo.current.querySelectorAll(':scope > [data-entra]'), {
      opacity: 0,
      y: ridotto ? 0 : 24,
      duration: ridotto ? movimento.durata.ridotta : movimento.durata.standard,
      ease: movimento.ease.entrata,
      stagger: ridotto ? 0 : 0.06,
    })
    return () => {
      tw.revert()
    }
  }, [slug, ridotto])

  // chiusura animata, poi la rotta si smonta
  const chiudi = useCallback(() => {
    if (uscendo.current) return
    uscendo.current = true
    const vai = () => (sfondo ? navigate(-1) : navigate('/', { replace: true }))
    const d = ridotto ? movimento.durata.ridotta : movimento.pannello.uscita
    if (!ridotto) ripristinaPagina(true)
    const tl = gsap.timeline({ onComplete: vai })
    chiusura.current = tl
    tl.to(velo.current, { opacity: 0, duration: d, ease: ridotto ? 'none' : 'power2.in' }, 0)
    tl.to(
      foglio.current,
      ridotto
        ? { opacity: 0, duration: d, ease: 'none' }
        : mobile
          ? { yPercent: 100, duration: d, ease: 'power3.in' }
          : { opacity: 0, y: 32, duration: d, ease: 'power3.in' },
      0,
    )
  }, [navigate, sfondo, ridotto, mobile])

  // mobile: trascinando il foglio in giù (quando è in cima) si chiude
  useEffect(() => {
    if (!mobile || ridotto || !montato) return
    const el = foglio.current!
    const sc = scorrimento.current!
    let inizio: { x: number; y: number; t: number } | null = null
    let trascino = false
    let dy = 0

    const giu = (e: TouchEvent) => {
      const bersaglio = e.target as Element
      if (sc.scrollTop > 0 || bersaglio.closest('[data-no-trascina]') || uscendo.current) return (inizio = null)
      const t = e.touches[0]
      inizio = { x: t.clientX, y: t.clientY, t: performance.now() }
      trascino = false
      dy = 0
    }
    const muovi = (e: TouchEvent) => {
      if (!inizio) return
      const t = e.touches[0]
      const nx = t.clientX - inizio.x
      dy = t.clientY - inizio.y
      if (!trascino) {
        // si trascina solo se il gesto è verso il basso e più verticale che orizzontale
        if (dy > 6 && dy > Math.abs(nx)) trascino = true
        else if (dy < -2 || Math.abs(nx) > 6) return (inizio = null)
        else return
      }
      e.preventDefault()
      gsap.set(el, { y: Math.max(0, dy) })
    }
    const su = () => {
      if (!inizio || !trascino) return (inizio = null)
      const velocita = dy / Math.max(1, performance.now() - inizio.t)
      inizio = null
      if (dy > movimento.pannello.trascinaPerChiudere || velocita > 0.6) chiudi()
      else gsap.to(el, { y: 0, duration: movimento.durata.micro + 0.1, ease: movimento.ease.entrata })
    }
    el.addEventListener('touchstart', giu, { passive: true })
    el.addEventListener('touchmove', muovi, { passive: false })
    el.addEventListener('touchend', su)
    el.addEventListener('touchcancel', su)
    return () => {
      el.removeEventListener('touchstart', giu)
      el.removeEventListener('touchmove', muovi)
      el.removeEventListener('touchend', su)
      el.removeEventListener('touchcancel', su)
    }
  }, [mobile, ridotto, chiudi, montato])

  // alla chiusura il focus torna alla card: quella dell’ultimo progetto visto, altrimenti del primo aperto
  const restituisciFocus = (e: Event) => {
    e.preventDefault()
    const card = (s: string) => document.querySelector<HTMLElement>(`[data-card-slug="${CSS.escape(s)}"]`)
    const el = card(ultimoSlug.current) ?? card(primoSlug.current)
    el?.focus({ preventScroll: true })
  }

  const meta = [progetto.discipline.join(', '), progetto.anno, progetto.cliente].filter(Boolean).join(' · ')

  return (
    <Dialog open onOpenChange={(aperto) => !aperto && chiudi()}>
      <DialogPortal>
        <DialogPrimitive.Overlay ref={velo} data-cursore={sito.etichette.chiudi} className="fixed inset-0 z-50 bg-nero/70" />
        <DialogPrimitive.Content
          ref={refFoglio}
          aria-modal="true"
          onEscapeKeyDown={(e) => {
            e.preventDefault()
            chiudi()
          }}
          onPointerDownOutside={(e) => {
            e.preventDefault()
            chiudi()
          }}
          onCloseAutoFocus={restituisciFocus}
          className="fixed inset-0 z-50 flex flex-col overflow-hidden bg-nero text-bianco outline-none max-md:rounded-t-card max-md:pt-[env(safe-area-inset-top)] md:inset-6 md:rounded-card md:border md:border-grigio lg:inset-8"
        >
          <div ref={scorrimento} data-lenis-prevent className="relative h-full overflow-y-auto overscroll-contain">
            {/* maniglia del foglio su mobile (solo decorativa) */}
            <div aria-hidden="true" className="absolute top-2 left-1/2 h-1 w-10 -translate-x-1/2 rounded-pillola bg-grigio md:hidden" />

            <div className="pointer-events-none sticky top-0 z-10 flex justify-end p-3 md:p-4">
              {/* tre stati: a riposo, al passaggio (attratto dal cursore, testo che rotola, icona che gira), premuto */}
              <Magnetico className="pointer-events-auto">
                <button
                  type="button"
                  onClick={chiudi}
                  className="group flex min-h-12 items-center gap-2 rounded-pillola border border-grigio bg-nero/80 px-5 text-etichetta transition-transform duration-300 ease-entrata active:scale-95"
                >
                  <X aria-hidden="true" size={16} strokeWidth={1.5} className="transition-transform duration-500 ease-entrata group-hover:rotate-90 group-focus-visible:rotate-90" />
                  <RotolaAlPassaggio testo={sito.etichette.chiudi} />
                </button>
              </Magnetico>
            </div>

            <article
              ref={articolo}
              key={slug}
              className="mx-auto flex w-full max-w-6xl flex-col gap-10 px-4 pb-[calc(4rem+env(safe-area-inset-bottom))] md:gap-14 md:px-10 md:pb-24"
            >
              <div ref={testata} className="-mt-2 aspect-4/5 overflow-hidden rounded-card md:aspect-video">
                <img src={progetto.copertina} alt={sito.pannello.copertina(progetto.titolo)} className="size-full object-cover" />
              </div>

              <header data-entra className="flex flex-col gap-6">
                <DialogPrimitive.Title className="text-titolo font-light">{progetto.titolo}</DialogPrimitive.Title>
                <DialogPrimitive.Description className="max-w-2xl text-corrente text-bianco">{progetto.descrizione}</DialogPrimitive.Description>
                <p className="text-etichetta cifre-tabellari text-bianco">{meta}</p>
              </header>

              <div data-entra className="flex flex-col gap-10 md:gap-14">
                <Blocchi blocchi={progetto.blocchi} titolo={progetto.titolo} />
              </div>

              {successivo && successivo.slug !== slug && (
                <Link
                  data-entra
                  to={`/progetti/${successivo.slug}`}
                  replace
                  state={{ sfondo } satisfies StatoNavigazione}
                  aria-label={`${sito.pannello.successivo}: ${successivo.titolo}`}
                  className="group mt-8 flex items-center gap-4 rounded-card border border-grigio p-3 transition-transform duration-300 ease-entrata active:scale-[0.98] md:gap-8 md:p-4"
                >
                  <span className="block w-20 shrink-0 overflow-hidden rounded-lg md:w-32">
                    <img
                      src={successivo.copertinaCard ?? successivo.copertina}
                      alt=""
                      loading="lazy"
                      className="aspect-4/5 w-full object-cover transition-transform duration-700 ease-entrata group-hover:scale-105 group-focus-visible:scale-105"
                    />
                  </span>
                  <span className="min-w-0 flex-1 text-titolo font-light break-words">{successivo.titolo}</span>
                  <ArrowUpRight
                    aria-hidden="true"
                    size={28}
                    strokeWidth={1.5}
                    className="mr-2 shrink-0 transition-transform duration-300 ease-entrata group-hover:translate-x-1 group-hover:-translate-y-1 group-focus-visible:translate-x-1 group-focus-visible:-translate-y-1"
                  />
                </Link>
              )}
            </article>
          </div>
        </DialogPrimitive.Content>
      </DialogPortal>
    </Dialog>
  )
}
