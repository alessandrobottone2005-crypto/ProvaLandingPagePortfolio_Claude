// blocco video (claude.md §6.5):
// - file mp4 con poster e controlli personalizzati (play/pausa, barra, audio, schermo intero)
// - oppure link vimeo/youtube (youtube-nocookie), caricato solo al clic
// - "autoplay": parte muto e in loop quando è in vista; mai audio automatico
import { Maximize2, Pause, Play, Volume2, VolumeX } from 'lucide-react'
import { useEffect, useRef, useState, type KeyboardEvent, type PointerEvent } from 'react'
import { Magnetico } from '@/components/interazioni/Magnetico'
import { sito } from '@/config/sito'
import type { Blocco } from '@/lib/progetti'

type BloccoVideo = Extract<Blocco, { tipo: 'video' }>

// tre stati: a riposo, al passaggio (attratto dal cursore e un po’ più grande), premuto
const pulsante =
  'flex size-12 shrink-0 items-center justify-center rounded-pillola border border-grigio bg-nero text-bianco transition-transform duration-300 ease-entrata hover:scale-105 focus-visible:scale-105 active:scale-95'
const MAGNETE = 4
const icona = { size: 18, strokeWidth: 1.5, 'aria-hidden': true } as const

export default function Video({ blocco, titolo }: { blocco: BloccoVideo; titolo: string }) {
  if (blocco.file) return <VideoFile file={blocco.file} poster={blocco.poster} autoplay={blocco.autoplay} titolo={titolo} />
  if (blocco.url) return <VideoIncorporato url={blocco.url} poster={blocco.poster} titolo={titolo} />
  return null
}

/** schermo intero sull’elemento; su safari ios (che non lo permette) passa al lettore del sistema */
function schermoIntero(contenitore: HTMLElement | null, video: HTMLVideoElement | null) {
  if (document.fullscreenElement) return void document.exitFullscreen()
  if (contenitore?.requestFullscreen) return void contenitore.requestFullscreen().catch(() => {})
  const v = video as (HTMLVideoElement & { webkitEnterFullscreen?: () => void }) | null
  v?.webkitEnterFullscreen?.()
}

function VideoFile({ file, poster, autoplay, titolo }: { file: string; poster?: string; autoplay: boolean; titolo: string }) {
  const contenitore = useRef<HTMLDivElement>(null)
  const video = useRef<HTMLVideoElement>(null)
  const riempimento = useRef<HTMLDivElement>(null)
  const [inRiproduzione, setInRiproduzione] = useState(false)
  const [muto, setMuto] = useState(autoplay)
  const [avanzamento, setAvanzamento] = useState(0)

  // la barra si aggiorna a ogni fotogramma mentre il video scorre (solo transform, niente re-render)
  useEffect(() => {
    const v = video.current!
    let id = 0
    const passo = () => {
      const p = v.duration ? v.currentTime / v.duration : 0
      if (riempimento.current) riempimento.current.style.transform = `scaleX(${p})`
      id = requestAnimationFrame(passo)
    }
    const via = () => {
      cancelAnimationFrame(id)
      id = requestAnimationFrame(passo)
    }
    const ferma = () => cancelAnimationFrame(id)
    // valore per gli screen reader: basta aggiornarlo qualche volta al secondo
    const annuncia = () => setAvanzamento(v.duration ? Math.round((v.currentTime / v.duration) * 100) : 0)
    v.addEventListener('play', via)
    v.addEventListener('pause', ferma)
    v.addEventListener('timeupdate', annuncia)
    return () => {
      cancelAnimationFrame(id)
      v.removeEventListener('play', via)
      v.removeEventListener('pause', ferma)
      v.removeEventListener('timeupdate', annuncia)
    }
  }, [])

  // autoplay: parte solo quando è in vista, si ferma quando esce
  useEffect(() => {
    if (!autoplay) return
    const v = video.current!
    const io = new IntersectionObserver(([e]) => {
      if (e.isIntersecting) v.play().catch(() => {})
      else v.pause()
    }, { threshold: 0.25 })
    io.observe(v)
    return () => io.disconnect()
  }, [autoplay])

  const alterna = () => {
    const v = video.current!
    if (v.paused) v.play().catch(() => {})
    else v.pause()
  }
  const vaiA = (frazione: number) => {
    const v = video.current!
    if (!v.duration) return
    v.currentTime = Math.min(1, Math.max(0, frazione)) * v.duration
    if (riempimento.current) riempimento.current.style.transform = `scaleX(${v.currentTime / v.duration})`
  }
  const trascina = (e: PointerEvent<HTMLDivElement>) => {
    if (e.type === 'pointerdown') e.currentTarget.setPointerCapture(e.pointerId)
    else if (!e.currentTarget.hasPointerCapture(e.pointerId)) return
    const r = e.currentTarget.getBoundingClientRect()
    vaiA((e.clientX - r.left) / r.width)
  }
  const tasti = (e: KeyboardEvent<HTMLDivElement>) => {
    const v = video.current!
    if (!v.duration) return
    const passi: Record<string, number> = { ArrowRight: 5, ArrowUp: 5, ArrowLeft: -5, ArrowDown: -5 }
    if (e.key in passi) vaiA((v.currentTime + passi[e.key]) / v.duration)
    else if (e.key === 'Home') vaiA(0)
    else if (e.key === 'End') vaiA(1)
    else return
    e.preventDefault()
  }

  return (
    <div ref={contenitore} className="relative overflow-hidden rounded-card border border-grigio bg-nero" data-no-trascina>
      <video
        ref={video}
        src={file}
        poster={poster}
        muted={muto}
        loop={autoplay}
        playsInline
        preload={autoplay ? 'auto' : 'metadata'}
        aria-label={sito.blocchi.video(titolo)}
        onClick={alterna}
        onPlay={() => setInRiproduzione(true)}
        onPause={() => setInRiproduzione(false)}
        onVolumeChange={(e) => setMuto(e.currentTarget.muted)}
        data-cursore={inRiproduzione ? 'pausa' : 'play'}
        className="aspect-video w-full object-contain"
      />

      <div className="absolute inset-x-3 bottom-3 flex items-center gap-2 rounded-pillola bg-nero/60 p-1 md:inset-x-4 md:bottom-4 md:gap-3">
        <Magnetico massimo={MAGNETE} className="shrink-0">
          <button type="button" className={pulsante} onClick={alterna} aria-label={inRiproduzione ? sito.blocchi.pausa : sito.blocchi.riproduci}>
            {inRiproduzione ? <Pause {...icona} /> : <Play {...icona} />}
          </button>
        </Magnetico>

        <div
          role="slider"
          tabIndex={0}
          aria-label={sito.blocchi.avanzamento}
          aria-valuemin={0}
          aria-valuemax={100}
          aria-valuenow={avanzamento}
          aria-valuetext={`${avanzamento}%`}
          onPointerDown={trascina}
          onPointerMove={trascina}
          onKeyDown={tasti}
          className="group flex h-12 min-w-0 flex-1 touch-none items-center rounded-pillola px-2"
        >
          <div className="relative h-0.5 w-full overflow-hidden rounded-pillola bg-grigio transition-transform duration-300 ease-entrata group-hover:scale-y-200 group-focus-visible:scale-y-200 group-active:scale-y-300">
            <div ref={riempimento} className="absolute inset-0 origin-left bg-bianco" style={{ transform: 'scaleX(0)' }} />
          </div>
        </div>

        <Magnetico massimo={MAGNETE} className="shrink-0">
          <button
            type="button"
            className={pulsante}
            onClick={() => {
              const v = video.current!
              v.muted = !v.muted
            }}
            aria-label={muto ? sito.blocchi.audioSi : sito.blocchi.audioNo}
          >
            {muto ? <VolumeX {...icona} /> : <Volume2 {...icona} />}
          </button>
        </Magnetico>
        <Magnetico massimo={MAGNETE} className="shrink-0">
          <button type="button" className={pulsante} onClick={() => schermoIntero(contenitore.current, video.current)} aria-label={sito.blocchi.schermoIntero}>
            <Maximize2 {...icona} />
          </button>
        </Magnetico>
      </div>
    </div>
  )
}

/** indirizzo del lettore incorporato: youtube (senza cookie) o vimeo; null se il link non è riconosciuto */
function indirizzoIncorporato(url: string) {
  const yt = url.match(/(?:youtube\.com\/(?:watch\?(?:.*&)?v=|embed\/|shorts\/)|youtu\.be\/)([\w-]{11})/)
  if (yt) return `https://www.youtube-nocookie.com/embed/${yt[1]}?autoplay=1&rel=0&modestbranding=1&playsinline=1`
  const vimeo = url.match(/vimeo\.com\/(?:video\/)?(\d+)/)
  if (vimeo) return `https://player.vimeo.com/video/${vimeo[1]}?autoplay=1&dnt=1`
  return null
}

function VideoIncorporato({ url, poster, titolo }: { url: string; poster?: string; titolo: string }) {
  const [attivo, setAttivo] = useState(false)
  const src = indirizzoIncorporato(url)
  if (!src) {
    console.warn(`video non riconosciuto (usa un link vimeo o youtube): ${url}`)
    return null
  }

  return (
    <div className="relative aspect-video overflow-hidden rounded-card border border-grigio bg-nero" data-no-trascina>
      {attivo ? (
        <iframe
          src={src}
          title={sito.blocchi.video(titolo)}
          allow="autoplay; fullscreen; picture-in-picture; encrypted-media"
          allowFullScreen
          className="absolute inset-0 size-full"
        />
      ) : (
        // il lettore esterno si carica solo dopo il clic: niente cookie né peso finché non serve
        <button
          type="button"
          onClick={() => setAttivo(true)}
          aria-label={sito.blocchi.riproduci}
          data-cursore="play"
          className="group absolute inset-0 flex items-center justify-center"
        >
          {poster && <img src={poster} alt="" loading="lazy" className="absolute inset-0 size-full object-cover" />}
          <span className="relative flex size-20 items-center justify-center rounded-pillola border border-grigio bg-nero/70 transition-transform duration-300 ease-entrata group-hover:scale-110 group-focus-visible:scale-110 group-active:scale-95">
            <Play size={24} strokeWidth={1.5} aria-hidden="true" />
          </span>
        </button>
      )}
    </div>
  )
}
