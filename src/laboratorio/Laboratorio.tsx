// pagina di prova, solo in sviluppo (/laboratorio): stati e animazioni del volto e del cursore.
// non finisce nel sito pubblicato.
import { lazy, Suspense, useEffect, useRef, useState } from 'react'
import type { Controllo3D } from '@/components/volto/Volto3D'
import { Volto, type ManigliaVolto, type StatoVolto } from '@/components/volto/Volto'
import { useVolto } from '@/components/volto/VoltoContext'
import { gsap } from '@/lib/gsap'

const Volto3D = lazy(() => import('@/components/volto/Volto3D'))

const STATI: (StatoVolto | 'automatico')[] = ['automatico', 'dorme', 'naturale', 'sveglio', 'occhiolino', 'sorride']
const CURSORI = ['apri', 'sfoglia', 'ruota', 'play', 'pausa', 'chiudi', 'tieni premuto']

const pulsante = 'min-h-12 rounded-pillola border border-grigio px-5 text-etichetta transition-colors hover:border-bianco'
const attivo = 'bg-bianco text-nero border-bianco'

export default function Laboratorio() {
  const { umore, azione } = useVolto()
  const volto = useRef<ManigliaVolto>(null)
  const bersaglio = useRef<HTMLDivElement>(null)
  const [stato, setStato] = useState<StatoVolto | 'automatico'>('automatico')
  const [disegno, setDisegno] = useState(1)
  const [dimensione, setDimensione] = useState(40)
  const [guardaBersaglio, setGuardaBersaglio] = useState(false)
  const riquadro = useRef<HTMLDivElement>(null)
  const controllo = useRef<Controllo3D>({ rotazione: 0, scala: 1, luce: 0.3, inclinazione: 0 })
  const [vista3d, setVista3d] = useState<'no' | 'sovrapposto' | 'solo'>('no')
  const [rotazione, setRotazione] = useState(0)
  useEffect(() => {
    controllo.current.rotazione = rotazione
  }, [rotazione])

  return (
    <main className="min-h-svh px-4 py-8 md:px-8">
      <h1 className="text-etichetta text-grigio">laboratorio · solo in sviluppo</h1>

      <div className="relative z-10 mt-8 grid gap-12 lg:grid-cols-[1fr_22rem]">
        {vista3d !== 'no' && (
          <div className="pointer-events-none fixed inset-0 z-0">
            <Suspense fallback={null}>
              <Volto3D riferimento={riquadro} controllo={controllo} attivo mobile={false} />
            </Suspense>
          </div>
        )}
        <div className="flex min-h-[60svh] items-center justify-center">
          <div ref={riquadro} className="inline-block" style={{ opacity: vista3d === 'solo' ? 0 : vista3d === 'sovrapposto' ? 0.5 : 1 }}>
          <Volto
            ref={volto}
            stato={stato === 'automatico' ? undefined : stato}
            disegno={disegno}
            dimensione={`${dimensione}vmin`}
            guarda={guardaBersaglio ? bersaglio : undefined}
            etichetta="logo di alessandro bottone"
          />
          </div>
        </div>

        <div className="flex flex-col gap-8 text-etichetta">
          <fieldset className="flex flex-col gap-3">
            <legend className="mb-3 text-grigio">stato · umore globale: {umore}</legend>
            <div className="flex flex-wrap gap-2">
              {STATI.map((s) => (
                <button key={s} type="button" className={`${pulsante} ${stato === s ? attivo : ''}`} onClick={() => setStato(s)}>
                  {s}
                </button>
              ))}
            </div>
          </fieldset>

          <fieldset className="flex flex-col gap-3">
            <legend className="mb-3 text-grigio">azioni (su tutti i volti)</legend>
            <div className="flex flex-wrap gap-2">
              <button type="button" className={pulsante} onClick={() => azione('battito')}>
                battito
              </button>
              <button type="button" className={pulsante} onClick={() => azione('occhiolino')}>
                occhiolino
              </button>
              <button type="button" className={pulsante} onClick={() => azione('sorriso')}>
                sorriso
              </button>
            </div>
          </fieldset>

          <label className="flex flex-col gap-3">
            <span className="text-grigio">disegno · {disegno.toFixed(2)}</span>
            <input type="range" min={0} max={1} step={0.01} value={disegno} onChange={(e) => setDisegno(Number(e.target.value))} className="accent-bianco" />
          </label>
          <button
            type="button"
            className={pulsante}
            onClick={() => {
              // disegno animato da 0 a 1, come nel preloader
              const p = { v: 0 }
              gsap.to(p, { v: 1, duration: 2.4, ease: 'power1.inOut', onUpdate: () => volto.current?.disegna(p.v), onComplete: () => setDisegno(1) })
            }}
          >
            ridisegna
          </button>

          <label className="flex flex-col gap-3">
            <span className="text-grigio">dimensione · {dimensione}vmin</span>
            <input type="range" min={6} max={70} value={dimensione} onChange={(e) => setDimensione(Number(e.target.value))} className="accent-bianco" />
          </label>

          <fieldset className="flex flex-col gap-3">
            <legend className="mb-3 text-grigio">3d</legend>
            <div className="flex flex-wrap gap-2">
              {(['no', 'sovrapposto', 'solo'] as const).map((v) => (
                <button key={v} type="button" className={`${pulsante} ${vista3d === v ? attivo : ''}`} onClick={() => setVista3d(v)}>
                  {v}
                </button>
              ))}
            </div>
            <label className="flex flex-col gap-3">
              <span className="text-grigio">rotazione · {rotazione}°</span>
              <input type="range" min={-60} max={60} value={rotazione} onChange={(e) => setRotazione(Number(e.target.value))} className="accent-bianco" />
            </label>
          </fieldset>

          <fieldset className="flex flex-col gap-3">
            <legend className="mb-3 text-grigio">sguardo</legend>
            <div className="flex flex-wrap items-center gap-2">
              <button type="button" className={`${pulsante} ${!guardaBersaglio ? attivo : ''}`} onClick={() => setGuardaBersaglio(false)}>
                segue il cursore
              </button>
              <button type="button" className={`${pulsante} ${guardaBersaglio ? attivo : ''}`} onClick={() => setGuardaBersaglio(true)}>
                guarda il cerchio
              </button>
              <div ref={bersaglio} className="size-6 rounded-full border border-bianco" />
            </div>
          </fieldset>

          <fieldset className="flex flex-col gap-3">
            <legend className="mb-3 text-grigio">cursore: passa sopra</legend>
            <div className="flex flex-wrap gap-2">
              {CURSORI.map((c) => (
                <div key={c} data-cursore={c} className="flex min-h-12 items-center rounded-card border border-dashed border-grigio px-4 text-grigio">
                  {c}
                </div>
              ))}
              <a href="#" className={pulsante + ' flex items-center'}>
                un link
              </a>
            </div>
          </fieldset>

          <div className="flex gap-6">
            <Volto dimensione="4rem" />
            <Volto dimensione="4rem" stato="sveglio" />
            <Volto dimensione="4rem" stato="dorme" />
          </div>
          <p className="text-grigio">
            prova anche: resta fermo 8 secondi (si addormenta), cambia scheda (titolo e favicon), clicca il volto (occhiolino).
          </p>
        </div>
      </div>
    </main>
  )
}
