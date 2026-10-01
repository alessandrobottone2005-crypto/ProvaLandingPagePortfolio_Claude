// Icone 1-bit su griglia 32×32, disegnate a pixel come quelle del Finder 1984.
import { useVoltoPixel } from './voltoPixel'

const pixel = { shapeRendering: 'crispEdges' as const }

export function IconaCartella() {
  return (
    <svg viewBox="0 0 32 32" aria-hidden="true" style={pixel}>
      <path d="M1 7H12L14 9H31V28H1Z" fill="#000" />
      <path d="M2 8H11.6L13.6 10H30V27H2Z" fill="#fff" />
      <rect x="2" y="11" width="28" height="1" fill="#000" />
    </svg>
  )
}

/** documento con l’angolo piegato; dentro, la copertina del progetto a colori */
export function IconaDocumento({ copertina }: { copertina?: string }) {
  return (
    <svg viewBox="0 0 32 32" aria-hidden="true" style={pixel}>
      <path d="M5 1H21L28 8V31H5Z" fill="#000" />
      <path d="M6 2H20V9H27V30H6Z" fill="#fff" />
      <path d="M21 2.5L26.5 8H21Z" fill="#fff" />
      {copertina && <image href={copertina} x="8" y="11" width="17" height="17" preserveAspectRatio="xMidYMid slice" />}
    </svg>
  )
}

/** il «mac felice» dell’avvio: un computer compatto con il volto sullo schermo */
export function MacFelice() {
  const volto = useVoltoPixel(18)
  return (
    <svg viewBox="0 0 32 42" aria-hidden="true" style={pixel} className="mac-felice">
      <rect x="2" y="1" width="28" height="35" fill="#000" />
      <rect x="3" y="2" width="26" height="33" fill="#fff" />
      <rect x="6" y="5" width="20" height="17" fill="#000" />
      <rect x="7" y="6" width="18" height="15" fill="#fff" />
      {volto && <image href={volto} x="7" y="5" width="18" height="18" style={{ imageRendering: 'pixelated' }} />}
      <rect x="16" y="28" width="9" height="1" fill="#000" />
      <rect x="2" y="36" width="28" height="5" fill="#000" />
      <rect x="3" y="36" width="26" height="4" fill="#fff" />
    </svg>
  )
}
