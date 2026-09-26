// chi sono (claude.md §6.6): solo la foto e il testo, che si “accende” parola per parola con lo scroll.
// gsap comanda tutto (entrata della foto, accensione del testo, pin, disegno della firma).
import { useRef } from 'react'
import { Volto, type ManigliaVolto } from '@/components/volto/Volto'
import { foto } from '@/config/foto'
import { media, movimento } from '@/config/movimento'
import { sito } from '@/config/sito'
import { gsap, ScrollTrigger, SplitText, useGSAP } from '@/lib/gsap'
// la foto: ritaglio a mezzobusto di foto-mia.jpg, convertito con `npm run foto-palette -- src/assets/foto/foto-mia-mezzobusto.jpg`.
// per cambiarla: nuova foto in src/assets/foto/, rilancia lo script, cambia questa riga e regola src/config/foto.ts
import immagine from '@/assets/foto/foto-mia-mezzobusto-palette.webp'

// colore della firma sopra la foto (classi scritte per intero, così tailwind le trova)
const COLORE_FIRMA = { nero: 'text-nero', grigio: 'text-grigio', bianco: 'text-bianco' } as const

// opacità delle parole non ancora accese: il bianco al 31% sul nero dà proprio il grigio #4d4b4a
const SPENTO = 0.315

export function ChiSono() {
  const palco = useRef<HTMLDivElement>(null)
  const volto = useRef<ManigliaVolto>(null)
  // stato della firma, condiviso tra scroll e passaggio del mouse
  const firma = useRef({ p: 0, pronta: false, ridotto: false })
  // comandi della firma per gli eventi del mouse e del tocco (preparati dentro useGSAP)
  const comandi = useRef({ passaggio: () => {}, mostra: (_visibile: boolean) => {} })

  useGSAP(
    (_ctx, contextSafe) => {
      const q = gsap.utils.selector(palco)
      const maschera = q('[data-foto-maschera]')[0]
      const img = q('[data-foto-img]')[0]
      const strato = q('[data-firma]')[0]
      const f = firma.current
      const disegna = () => volto.current?.disegna(f.p)

      // la firma si disegna, resta un istante e si cancella
      const passaggio = contextSafe!(() => {
        if (!foto.firma) return
        if (f.ridotto) {
          gsap
            .timeline()
            .to(strato, { opacity: 1, duration: movimento.durata.ridotta, overwrite: true })
            .to(strato, { opacity: 0, duration: movimento.durata.ridotta }, `+=${foto.pausa + 0.6}`)
          return
        }
        gsap
          .timeline()
          .to(f, { p: 1, duration: 1.2, ease: 'none', overwrite: true, onUpdate: disegna })
          .to(f, { p: 0, duration: 0.8, ease: 'none', onUpdate: disegna }, `+=${foto.pausa}`)
      })

      // passaggio del mouse: la firma riappare e resta finché il mouse è sopra
      const mostra = contextSafe!((visibile: boolean) => {
        if (!foto.firma || !f.pronta) return
        if (f.ridotto) {
          gsap.to(strato, { opacity: visibile ? 1 : 0, duration: movimento.durata.ridotta, overwrite: true })
          return
        }
        gsap.to(f, { p: visibile ? 1 : 0, duration: visibile ? 1 : 0.7, ease: 'none', overwrite: true, onUpdate: disegna })
      })
      comandi.current = { passaggio, mostra }

      const mm = gsap.matchMedia()
      // tutte e tre le condizioni: gsap esegue la funzione solo se almeno una è vera
      // “grande” = da 768px in su e abbastanza alto da contenere tutto il testo durante il pin;
      // un telefono in orizzontale (largo ma basso) si comporta come il mobile: niente pin
      mm.add({ grande: media.chiSonoPin, basso: media.chiSonoBasso, mobile: media.mobile, ridotto: media.ridotto }, (ctx) => {
        const { grande, ridotto } = ctx.conditions as Record<string, boolean>
        f.ridotto = ridotto
        f.pronta = false

        // --- movimento ridotto: tutto bianco e fermo, la firma compare con una dissolvenza ---
        if (ridotto) {
          if (foto.firma && strato) {
            volto.current?.disegna(1)
            gsap.set(strato, { opacity: 0 })
            ScrollTrigger.create({
              trigger: maschera,
              start: 'top 70%',
              once: true,
              onEnter: () => {
                f.pronta = true
                passaggio()
              },
            })
          }
          return
        }

        // --- entrata della foto: maschera che si apre dal basso e zoom indietro ---
        f.p = 0
        volto.current?.disegna(0)
        gsap.set(maschera, { clipPath: 'inset(100% 0% 0% 0%)' })
        gsap.set(img, { scale: 1.15 })
        const entrata = gsap
          .timeline({
            paused: true,
            onComplete: () => {
              f.pronta = true
              passaggio()
            },
            onReverseComplete: () => void (f.pronta = false),
          })
          .to(maschera, { clipPath: 'inset(0% 0% 0% 0%)', duration: movimento.durata.grande, ease: movimento.ease.entrata })
          .to(img, { scale: 1, duration: movimento.durata.grande * 1.2, ease: movimento.ease.entrata }, 0)

        ScrollTrigger.create({
          trigger: maschera,
          start: 'top 80%',
          onEnter: () => entrata.play(),
          // tornando su, la foto si richiude e la firma si cancella
          onLeaveBack: () => {
            f.pronta = false
            gsap.to(f, { p: 0, duration: movimento.durata.micro, overwrite: true, onUpdate: disegna })
            entrata.reverse()
          },
          // ritornando dal basso, la firma si ripete (su touch è l’equivalente del passaggio del mouse)
          onEnterBack: () => f.pronta && passaggio(),
        })

        // --- il testo si accende parola per parola ---
        const split = SplitText.create(q('[data-paragrafo]'), { type: 'words', aria: 'none' })
        const accensione = gsap.timeline({
          defaults: { ease: 'none' },
          scrollTrigger: grande
            ? {
                // desktop e tablet: sezione bloccata mentre il testo si accende
                trigger: palco.current,
                pin: true,
                start: 'top top',
                end: `+=${movimento.chiSono.pin}%`,
                scrub: movimento.scrub.desktop,
                invalidateOnRefresh: true,
              }
            : {
                // mobile: niente pin, il testo si accende mentre attraversa lo schermo
                trigger: q('[data-testo]')[0],
                start: 'top 85%',
                end: 'bottom 55%',
                scrub: movimento.scrub.mobile,
              },
        })
        accensione.fromTo(split.words, { opacity: SPENTO }, { opacity: 1, duration: 0.3, stagger: 0.1 })
        // un attimo di respiro a testo tutto acceso, prima che la sezione riparta
        if (grande) accensione.to({}, { duration: 0.6 })

        return () => split.revert()
      })

      return () => mm.revert()
    },
    { scope: palco },
  )

  return (
    <section id="chi-sono" aria-labelledby="titolo-chi-sono" className="relative">
      <h2 id="titolo-chi-sono" className="sr-only">
        {sito.sezioni.chiSono}
      </h2>

      <div ref={palco} className="flex items-center px-4 py-24 md:min-h-svh md:px-8 md:py-0 lg:px-12">
        <div className="grid w-full items-center gap-12 md:grid-cols-12 md:gap-8">
          {/* la foto: 4:5, a sinistra su desktop, sopra su mobile */}
          <div
            className="relative w-full md:col-span-5 md:max-w-[64svh] md:justify-self-start"
            onPointerEnter={(e) => e.pointerType === 'mouse' && comandi.current.mostra(true)}
            onPointerLeave={(e) => e.pointerType === 'mouse' && comandi.current.mostra(false)}
            // su touch il tocco ripete la firma
            onPointerDown={(e) => e.pointerType !== 'mouse' && firma.current.pronta && comandi.current.passaggio()}
          >
            <div data-foto-maschera className="aspect-[4/5] overflow-hidden rounded-card">
              <img
                data-foto-img
                src={immagine}
                alt={sito.etichette.foto}
                width={960}
                height={1200}
                loading="lazy"
                decoding="async"
                className="size-full object-cover"
              />
            </div>

            {/* firma: i tratti del volto sopra il viso (posizione e scala in src/config/foto.ts) */}
            {foto.firma && (
              <div data-firma className={`pointer-events-none absolute inset-0 overflow-hidden rounded-card ${COLORE_FIRMA[foto.colore]}`}>
                <div
                  className="absolute"
                  style={{
                    left: `${foto.x}%`,
                    top: `${foto.y}%`,
                    width: `${foto.scala}%`,
                    // il punto di riferimento è a metà tra le lenti: la loro riga è al 33,7% dell’altezza del volto
                    transform: 'translate(-50%, -33.67%)',
                  }}
                >
                  <Volto ref={volto} dimensione="100%" interattivo={false} />
                </div>
              </div>
            )}
          </div>

          {/* il testo, riportato esattamente da src/config/sito.ts; su desktop la dimensione tiene conto anche dell’altezza dello schermo, così resta tutto visibile durante il pin */}
          <div data-testo className="flex flex-col gap-[1.1em] text-chisono font-light md:text-[length:clamp(1.125rem,min(2.6vw,3.5svh),2.5rem)] md:col-span-7 md:col-start-6 lg:col-span-6 lg:col-start-7">
            {sito.chiSono.map((paragrafo, i) => (
              // il testo vero per gli screen reader; le parole spezzate e animate sono solo per gli occhi
              <p key={i}>
                <span className="sr-only">{paragrafo}</span>
                <span data-paragrafo aria-hidden="true">
                  {paragrafo}
                </span>
              </p>
            ))}
          </div>
        </div>
      </div>
    </section>
  )
}
