// geometria del volto, ricostruita a tratti (stroke) dal logo originale sorgenti/Logo.svg.
// il file originale ha le forme espanse (riempimenti): qui ogni parte è una linea centrale
// con il suo spessore, così si può disegnare (drawsvg), animare e trasformare.
// coordinate nello stesso sistema dell’originale (247.41 × 176.88), con un po’ di spazio sotto per il sorriso.

export const VIEWBOX = { larghezza: 247.41, altezza: 180 } as const
/** ingombro del logo originale, senza lo spazio in più sotto: è la misura del modello 3d */
export const INGOMBRO = { larghezza: 247.41, altezza: 176.88 } as const

export const SPESSORE = {
  occhio: 13.6,
  naso: 15.3,
  sorriso: 12.1,
} as const

/** asse di simmetria: l’occhio destro è lo specchio del sinistro */
export const ASSE = VIEWBOX.larghezza / 2

export const LENTE = { cx: 50.55, cy: 60.6, rx: 43.6, ry: 44.4 } as const

/** pupilla: anello ellittico; la parte alta è nascosta dalla palpebra */
export const PUPILLA = { cx: 50.55, cy: 47.85, rx: 19.38, ry: 24.24 } as const

/** spostamento massimo della pupilla (≈ 20% del raggio della lente) */
export const SGUARDO_MAX = LENTE.rx * 0.2

export const PONTE = 'M96.57,60.67 H150.85'
export const NASO = 'M122.65,0 V112.87 H142.13'

export const SORRISO = 'M95.44,157.96 C104,167 116,170.8 128.53,170.8 C141,170.8 153,167 161.7,157.96'
export const SORRISO_AMPIO = 'M90.5,153.5 C100.5,166.5 113.5,173 128.53,173 C143.5,173 156.5,166.5 166.5,153.5'

// ------------------------------------------------------------------
// palpebra: un arco tra due punti fissi sulla lente.
// “apertura” va da 0 (chiusa, arco verso il basso) a 1 (spalancata);
// 0.5 è la palpebra semichiusa del logo.
// ------------------------------------------------------------------

type Punti = [number, number, number, number, number, number, number, number, number, number, number, number, number, number]

// [x0,y0, c1x,c1y, c2x,c2y, x3,y3, c4x,c4y, c5x,c5y, x6,y6]
const CHIUSA: Punti = [10.08, 57, 22, 69, 36, 76, 51.7, 76, 67, 76, 81, 70, 92.54, 58.66]
const NATURALE: Punti = [10.08, 57, 22, 45, 36, 41.8, 51.7, 41.8, 67, 41.8, 81, 46, 92.54, 58.66]
const APERTA: Punti = [10.08, 57, 18.25, 42.3, 33.15, 34.12, 51.36, 34.12, 69.28, 34.12, 84.6, 43, 92.54, 58.66]

export const APERTURA = {
  dorme: 0,
  sorride: 0.42,
  naturale: 0.5,
  sveglio: 1,
} as const

function puntiPalpebra(apertura: number): Punti {
  const a = Math.min(1, Math.max(0, apertura))
  const [da, verso, t] = a < 0.5 ? [CHIUSA, NATURALE, a / 0.5] : [NATURALE, APERTA, (a - 0.5) / 0.5]
  return da.map((v, i) => v + (verso[i] - v) * t) as Punti
}

const n = (v: number) => Math.round(v * 100) / 100

export function palpebra(apertura: number) {
  const p = puntiPalpebra(apertura).map(n)
  return `M${p[0]},${p[1]} C${p[2]},${p[3]} ${p[4]},${p[5]} ${p[6]},${p[7]} C${p[8]},${p[9]} ${p[10]},${p[11]} ${p[12]},${p[13]}`
}

/** zona sotto la palpebra: la pupilla si vede solo qui */
export function sottoPalpebra(apertura: number) {
  return `${palpebra(apertura)} L${n(LENTE.cx + LENTE.rx + 10)},130 L${n(LENTE.cx - LENTE.rx - 10)},130 Z`
}

// ------------------------------------------------------------------
// versione statica (favicon, og, anteprime): stringa svg completa
// ------------------------------------------------------------------

export function svgStatico({ apertura = APERTURA.naturale, colore = '#c9c5c0', sfondo }: { apertura?: number; colore?: string; sfondo?: string } = {}) {
  const margine = 14
  const lato = VIEWBOX.larghezza + margine * 2
  const y0 = (lato - VIEWBOX.altezza) / 2
  const occhio = (id: string) => `
    <g clip-path="url(#lente)">
      <g clip-path="url(#${id})"><ellipse cx="${PUPILLA.cx}" cy="${PUPILLA.cy}" rx="${PUPILLA.rx}" ry="${PUPILLA.ry}"/></g>
      <path d="${palpebra(apertura)}"/>
    </g>
    <ellipse cx="${LENTE.cx}" cy="${LENTE.cy}" rx="${LENTE.rx}" ry="${LENTE.ry}"/>`
  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="${-margine} ${-y0} ${lato} ${lato}">
  ${sfondo ? `<rect x="${-margine}" y="${-y0}" width="${lato}" height="${lato}" rx="${lato * 0.22}" fill="${sfondo}"/>` : ''}
  <defs>
    <clipPath id="lente"><ellipse cx="${LENTE.cx}" cy="${LENTE.cy}" rx="${LENTE.rx}" ry="${LENTE.ry}"/></clipPath>
    <clipPath id="palpebra"><path d="${sottoPalpebra(apertura)}"/></clipPath>
  </defs>
  <g fill="none" stroke="${colore}" stroke-width="${SPESSORE.occhio}">
    ${occhio('palpebra')}
    <g transform="translate(${VIEWBOX.larghezza} 0) scale(-1 1)">${occhio('palpebra')}</g>
    <path d="${PONTE}" stroke-width="${SPESSORE.naso}"/>
    <path d="${NASO}" stroke-width="${SPESSORE.naso}"/>
    <path d="${SORRISO}" stroke-width="${SPESSORE.sorriso}"/>
  </g>
</svg>
`
}
