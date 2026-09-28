// la “tavola” dell’header: tutto ciò che si disegna attorno al volto nelle quattro fasi.
// stesse coordinate del volto (vedi geometria.ts), così ogni linea cade al posto giusto.
// è decorativa: nessun testo, solo segni.
import { ASSE, LENTE, PUPILLA, SPESSORE, VIEWBOX } from '@/components/volto/geometria'
import { FINESTRA, ID_MATITA } from './misure'

const L = VIEWBOX.larghezza
const H_LOGO = 176.88
const CX = ASSE
const CY = 88
const DX = L - LENTE.cx // centro della lente destra


const colonne = Array.from({ length: 5 }, (_, i) => FINESTRA.x + ((i + 1) * FINESTRA.w) / 6)

// linee di schizzo: volutamente imprecise, come una pagina di sketchbook
const SCHIZZI = [
  'M-42,62 C40,57 180,64 292,58',
  'M-30,113 C60,116 170,111 281,116',
  'M-24,171 C70,168 180,173 272,167',
  'M123,-44 C124,40 122,130 125,218',
  'M-12,-22 C80,50 170,120 262,204',
  'M259,-20 C170,55 80,130 -9,206',
  'M84,148 Q128,199 173,149',
  'M-4,-6 C60,-12 190,-4 252,-10',
]
const SCHIZZI_CERCHI = [
  { cx: 48, cy: 62, rx: 53, ry: 49, r: -7 },
  { cx: 54, cy: 58, rx: 47, ry: 52, r: 5 },
  { cx: 199, cy: 61, rx: 52, ry: 50, r: 6 },
  { cx: 194, cy: 58, rx: 48, ry: 53, r: -4 },
  { cx: 51, cy: 49, rx: 22, ry: 27, r: 3 },
  { cx: 197, cy: 49, rx: 21, ry: 26, r: -5 },
]
const TRATTEGGIO = Array.from({ length: 7 }, (_, i) => `M${196 + i * 7},${-30} l${-14},${16}`)

type Props = { className?: string }

export function Tavola({ className }: Props) {
  const linea = { vectorEffect: 'non-scaling-stroke' as const }
  return (
    <svg viewBox={`0 0 ${L} ${VIEWBOX.altezza}`} className={className} aria-hidden="true" style={{ overflow: 'visible' }}>
      <defs>
        {/* tratto “a mano libera”: il rumore sposta le linee; la sua intensità la anima lo scroll */}
        <filter id={ID_MATITA} x="-20%" y="-20%" width="140%" height="140%">
          <feTurbulence data-rumore type="fractalNoise" baseFrequency="0.035" numOctaves={2} seed={3} result="rumore" />
          <feDisplacementMap data-spostamento in="SourceGraphic" in2="rumore" scale={0} xChannelSelector="R" yChannelSelector="G" />
        </filter>
      </defs>

      {/* 01 illustrazione: linee di costruzione a matita */}
      <g data-schizzi fill="none" stroke="var(--color-grigio)" strokeWidth={1.2} strokeLinecap="round" {...linea}>
        {SCHIZZI_CERCHI.map((c, i) => (
          <ellipse key={i} data-disegna cx={c.cx} cy={c.cy} rx={c.rx} ry={c.ry} transform={`rotate(${c.r} ${c.cx} ${c.cy})`} {...linea} />
        ))}
        {SCHIZZI.map((d, i) => (
          <path key={i} data-disegna d={d} {...linea} />
        ))}
        {TRATTEGGIO.map((d, i) => (
          <path key={i} data-disegna d={d} {...linea} />
        ))}
      </g>

      {/* 02 branding: griglia di costruzione rigorosa, quote senza numeri, area di rispetto */}
      <g data-griglia fill="none" stroke="var(--color-grigio)" strokeWidth={1}>
        <rect data-rispetto x={-40} y={-40} width={L + 80} height={H_LOGO + 80} strokeDasharray="3 5" opacity={0} {...linea} />
        <circle data-disegna cx={CX} cy={CY} r={134} {...linea} />
        {[LENTE.cx, DX].map((cx) => (
          <g key={cx}>
            <ellipse data-disegna cx={cx} cy={LENTE.cy} rx={LENTE.rx + SPESSORE.occhio / 2} ry={LENTE.ry + SPESSORE.occhio / 2} {...linea} />
            <ellipse data-disegna cx={cx} cy={LENTE.cy} rx={LENTE.rx - SPESSORE.occhio / 2} ry={LENTE.ry - SPESSORE.occhio / 2} {...linea} />
            <ellipse data-disegna cx={cx} cy={PUPILLA.cy} rx={PUPILLA.rx} ry={PUPILLA.ry} {...linea} />
          </g>
        ))}
        <path data-disegna d={`M${CX},-52 V${H_LOGO + 52}`} {...linea} />
        <path data-disegna d={`M-52,${LENTE.cy} H${L + 52}`} {...linea} />
        <path data-disegna d={`M-52,0 H${L + 52}`} {...linea} />
        <path data-disegna d={`M-52,${H_LOGO} H${L + 52}`} {...linea} />
        {/* quote grafiche */}
        <path data-disegna d={`M0,-24 H${L} M0,-30 V-18 M${L},-30 V-18`} stroke="var(--color-bianco)" strokeOpacity={0.55} {...linea} />
        <path data-disegna d={`M${L + 24},0 V${H_LOGO} M${L + 18},0 H${L + 30} M${L + 18},${H_LOGO} H${L + 30}`} stroke="var(--color-bianco)" strokeOpacity={0.55} {...linea} />
        <path
          data-disegna
          d={`M${LENTE.cx - LENTE.rx},${LENTE.cy + LENTE.ry + 20} H${LENTE.cx + LENTE.rx} M${LENTE.cx - LENTE.rx},${LENTE.cy + LENTE.ry + 15} v10 M${LENTE.cx + LENTE.rx},${LENTE.cy + LENTE.ry + 15} v10`}
          stroke="var(--color-bianco)"
          strokeOpacity={0.55}
          {...linea}
        />
      </g>

      {/* 02 branding: i tre colori della palette */}
      <g data-campioni>
        {['var(--color-nero)', 'var(--color-grigio)', 'var(--color-bianco)'].map((colore, i) => (
          <circle key={i} data-campione cx={CX + (i - 1) * 26} cy={H_LOGO + 44} r={9} fill={colore} stroke="var(--color-grigio)" strokeWidth={1} {...linea} />
        ))}
      </g>

      {/* 04 web design: finestra del browser attorno al logo */}
      <g data-finestra fill="none" stroke="var(--color-bianco)" strokeWidth={1}>
        <g data-contenuto-finestra>
          <path data-disegna d={`M${FINESTRA.x},${FINESTRA.y + 22} H${FINESTRA.x + FINESTRA.w}`} {...linea} />
          {[0, 1, 2].map((i) => (
            <circle key={i} data-disegna cx={FINESTRA.x + 12 + i * 10} cy={FINESTRA.y + 11} r={3} {...linea} />
          ))}
          <rect data-disegna x={CX - 64} y={FINESTRA.y + 5} width={128} height={12} rx={6} {...linea} />
          {colonne.map((x) => (
            <path key={x} data-disegna d={`M${x},${FINESTRA.y + 22} V${FINESTRA.y + FINESTRA.h}`} stroke="var(--color-grigio)" {...linea} />
          ))}
          <rect data-disegna data-pulsante fill="var(--color-bianco)" fillOpacity={0} x={FINESTRA.x + FINESTRA.w - 84} y={FINESTRA.y + FINESTRA.h - 36} width={64} height={18} rx={9} {...linea} />
          <path
            data-puntatore
            d="M0,0 L0,17 L4.5,12.5 L8,20 L11,18.6 L7.6,11.4 L13.5,11.4 Z"
            fill="var(--color-bianco)"
            stroke="var(--color-nero)"
            strokeWidth={1}
            opacity={0}
            {...linea}
          />
        </g>
        <rect data-cornice x={FINESTRA.x} y={FINESTRA.y} width={FINESTRA.w} height={FINESTRA.h} rx={FINESTRA.r} {...linea} />
      </g>
    </svg>
  )
}
