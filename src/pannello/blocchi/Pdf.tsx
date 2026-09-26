// blocco pdf (claude.md §6.5): il pdf si sfoglia come un libro.
// react-pdf disegna le pagine, page-flip le fa girare (react-pageflip non supporta react 19: uso page-flip direttamente).
// page-flip sposta i nodi delle pagine nel suo contenitore: per non litigare con react, creo io quei nodi
// e ci disegno dentro le pagine con dei portali. le pagine si disegnano man mano (solo quelle vicine).
// desktop: doppia pagina; mobile: una pagina, si gira con uno swipe.
import { ChevronLeft, ChevronRight, Maximize2, Minimize2 } from 'lucide-react'
import { PageFlip } from 'page-flip/dist/js/page-flip.module.js'
import 'page-flip/src/Style/stPageFlip.css'
import workerUrl from 'pdfjs-dist/build/pdf.worker.min.mjs?url'
import { memo, useCallback, useEffect, useLayoutEffect, useMemo, useRef, useState } from 'react'
import { createPortal } from 'react-dom'
import { Document, Page, pdfjs } from 'react-pdf'
import { Magnetico } from '@/components/interazioni/Magnetico'
import { media, movimento } from '@/config/movimento'
import { sito } from '@/config/sito'

pdfjs.GlobalWorkerOptions.workerSrc = workerUrl

// quante pagine prima e dopo quella aperta vengono disegnate in anticipo
const VICINE = 3

type Misure = { w: number; h: number; doppia: boolean }

// tre stati: a riposo, al passaggio (attratto dal cursore, un po’ più grande, icona che si sposta), premuto
const pulsante =
  'group flex size-12 items-center justify-center rounded-pillola border border-grigio text-bianco transition-[transform,opacity] duration-300 ease-entrata hover:scale-105 focus-visible:scale-105 active:scale-95 disabled:opacity-30 disabled:hover:scale-100'
const MAGNETE = 6
const icona = { size: 18, strokeWidth: 1.5, 'aria-hidden': true } as const

export default function Pdf({ file, titolo }: { file: string; titolo: string }) {
  const figura = useRef<HTMLElement>(null)
  const area = useRef<HTMLDivElement>(null)
  const ospite = useRef<HTMLDivElement>(null)
  const libro = useRef<PageFlip | null>(null)
  const [totale, setTotale] = useState(0)
  const [proporzione, setProporzione] = useState(0) // larghezza / altezza della prima pagina
  const [pagina, setPagina] = useState(0)
  const [nodi, setNodi] = useState<HTMLElement[]>([])
  const [larghezza, setLarghezza] = useState(0)
  const [pieno, setPieno] = useState(false) // schermo intero
  const [errore, setErrore] = useState(false)
  const ridotto = useMemo(() => matchMedia(media.ridotto).matches, [])

  // larghezza disponibile, aggiornata quando cambia la finestra o si entra nello schermo intero
  useEffect(() => {
    const ro = new ResizeObserver(([e]) => setLarghezza(Math.floor(e.contentRect.width)))
    ro.observe(area.current!)
    return () => ro.disconnect()
  }, [])

  useEffect(() => {
    const cambio = () => setPieno(document.fullscreenElement === figura.current)
    document.addEventListener('fullscreenchange', cambio)
    return () => document.removeEventListener('fullscreenchange', cambio)
  }, [])

  // misura delle pagine: doppia pagina da tablet in su, altezza massima entro lo schermo
  const misure = useMemo<Misure | null>(() => {
    if (!proporzione || !larghezza) return null
    const doppia = larghezza >= 700
    const altezzaMax = pieno ? innerHeight - 120 : innerHeight * 0.72
    let w = doppia ? larghezza / 2 : larghezza
    let h = w / proporzione
    if (h > altezzaMax) {
      h = altezzaMax
      w = h * proporzione
    }
    return { w: Math.floor(w), h: Math.floor(h), doppia }
  }, [proporzione, larghezza, pieno])

  // crea il libro (e lo ricrea se cambiano le misure, restando sulla stessa pagina)
  const paginaRef = useRef(0)
  useLayoutEffect(() => {
    paginaRef.current = pagina
  }, [pagina])
  useEffect(() => {
    if (!misure || !totale || !ospite.current) return
    const radice = document.createElement('div')
    ospite.current.appendChild(radice)
    const pagine = Array.from({ length: totale }, () => {
      const d = document.createElement('div')
      d.className = 'overflow-hidden bg-bianco'
      return d
    })
    const pf = new PageFlip(radice, {
      width: misure.w,
      height: misure.h,
      size: 'fixed',
      autoSize: true,
      usePortrait: true,
      showCover: true,
      drawShadow: !ridotto,
      maxShadowOpacity: 0.35,
      flippingTime: ridotto ? 1 : movimento.pannello.giroPagina * 1000,
      mobileScrollSupport: true,
      showPageCorners: !ridotto,
      startPage: Math.min(paginaRef.current, totale - 1),
      swipeDistance: 30,
      disableFlipByClick: false,
    })
    pf.loadFromHTML(pagine)
    pf.on('flip', (e) => setPagina(Number(e.data)))
    libro.current = pf
    setNodi(pagine)
    return () => {
      libro.current = null
      pf.destroy()
      radice.remove()
    }
  }, [misure, totale, ridotto])

  const precedente = useCallback(() => {
    const pf = libro.current
    if (!pf) return
    if (ridotto) pf.turnToPage(Math.max(0, pf.getCurrentPageIndex() - (misure?.doppia ? 2 : 1)))
    else pf.flipPrev()
    if (ridotto) setPagina(pf.getCurrentPageIndex())
  }, [ridotto, misure])
  const successiva = useCallback(() => {
    const pf = libro.current
    if (!pf) return
    if (ridotto) pf.turnToPage(Math.min(totale - 1, pf.getCurrentPageIndex() + (misure?.doppia ? 2 : 1)))
    else pf.flipNext()
    if (ridotto) setPagina(pf.getCurrentPageIndex())
  }, [ridotto, misure, totale])

  const alternaSchermoIntero = () => {
    const el = figura.current
    if (!el) return
    if (document.fullscreenElement) void document.exitFullscreen()
    else if (el.requestFullscreen) el.requestFullscreen().catch(() => setPieno((p) => !p))
    // safari ios non ha lo schermo intero sugli elementi: il libro occupa tutta la finestra
    else setPieno((p) => !p)
  }

  // numero della pagina aperta: in doppia pagina conta la pagina di destra (dopo la copertina)
  const numero = Math.min(totale, pagina + 1)

  if (errore) return null

  return (
    <figure
      ref={figura}
      aria-label={sito.pannello.pdf(titolo)}
      className={
        pieno && !document.fullscreenElement
          ? 'fixed inset-0 z-[70] flex flex-col justify-center gap-4 bg-nero p-4'
          : 'flex flex-col gap-4 data-[pieno]:justify-center data-[pieno]:bg-nero data-[pieno]:p-6'
      }
      data-pieno={pieno || undefined}
      data-no-trascina
    >
      <div ref={area} className="w-full" style={{ minHeight: misure ? misure.h : undefined }}>
        <Document
          file={file}
          onLoadSuccess={async (pdf) => {
            const prima = await pdf.getPage(1)
            const v = prima.getViewport({ scale: 1 })
            setProporzione(v.width / v.height)
            setTotale(pdf.numPages)
          }}
          onLoadError={(e) => {
            console.warn(`${sito.pannello.pdfErrore}: ${file}`, e)
            setErrore(true)
          }}
          loading={<div aria-hidden="true" className="aspect-[4/3] w-full animate-pulse rounded-card border border-grigio motion-reduce:animate-none" />}
          error={null}
          noData={null}
        >
          <div ref={ospite} data-cursore="sfoglia" className="mx-auto" style={{ maxWidth: misure ? (misure.doppia ? misure.w * 2 : misure.w) : undefined }} />
          {misure &&
            nodi.map((nodo, i) =>
              createPortal(<PaginaPdf numero={i + 1} larghezza={misure.w} vicina={Math.abs(i - pagina) <= VICINE} />, nodo, String(i)),
            )}
        </Document>
      </div>

      {totale > 0 && (
        <div className="flex items-center justify-center gap-3">
          <Magnetico massimo={MAGNETE}>
            <button type="button" className={pulsante} onClick={precedente} disabled={pagina <= 0} aria-label={sito.pannello.paginaPrecedente}>
              <ChevronLeft {...icona} className="transition-transform duration-300 ease-entrata group-enabled:group-hover:-translate-x-0.5" />
            </button>
          </Magnetico>
          <p className="min-w-20 text-center text-etichetta cifre-tabellari" aria-live="polite">
            {numero} / {totale}
          </p>
          <Magnetico massimo={MAGNETE}>
            <button type="button" className={pulsante} onClick={successiva} disabled={pagina >= totale - 1} aria-label={sito.pannello.paginaSuccessiva}>
              <ChevronRight {...icona} className="transition-transform duration-300 ease-entrata group-enabled:group-hover:translate-x-0.5" />
            </button>
          </Magnetico>
          <Magnetico massimo={MAGNETE} className="ml-2">
            <button
              type="button"
              className={pulsante}
              onClick={alternaSchermoIntero}
              aria-label={pieno ? sito.pannello.esciSchermoIntero : sito.pannello.schermoIntero}
            >
              {pieno ? <Minimize2 {...icona} /> : <Maximize2 {...icona} />}
            </button>
          </Magnetico>
        </div>
      )}
    </figure>
  )
}

/** una pagina del pdf: si disegna quando è vicina a quella aperta, poi resta disegnata */
const PaginaPdf = memo(function PaginaPdf({ numero, larghezza, vicina }: { numero: number; larghezza: number; vicina: boolean }) {
  const [vista, setVista] = useState(vicina)
  if (vicina && !vista) setVista(true)
  if (!vista) return null
  return (
    <Page
      pageNumber={numero}
      width={larghezza}
      devicePixelRatio={Math.min(devicePixelRatio, 2)}
      renderTextLayer={false}
      renderAnnotationLayer={false}
      loading={null}
      error={null}
    />
  )
})
