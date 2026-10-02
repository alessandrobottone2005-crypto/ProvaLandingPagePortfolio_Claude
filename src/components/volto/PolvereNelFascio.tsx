// Polvere che brilla nel fascio di sole della fessura (cinema.ts): punti instanziati nelle coordinate della sala
// (figli di Mondo), fluttuano lenti e scintillano; lontani dal fuoco si allargano in bokeh morbidi.
import { useFrame, useThree } from '@react-three/fiber'
import { useEffect, useMemo } from 'react'
import * as THREE from 'three'
import { COMPUTER } from '@/components/computer/inquadratura'
import { cinema } from './cinema'
import dati from './stazioniSala.json'
import { DIREZIONE_SOLE } from './luceSala'
import { scenaImmersiva } from './scenaImmersiva'

const vertice = /* glsl */ `
uniform float tempo;
uniform float scala;
uniform float misura;
uniform float fuoco;
uniform float scintillio;
attribute vec4 dati; // fase, luce (bordo del fascio), grandezza, velocità
varying float vAlfa;
void main() {
  float f = dati.x;
  vec3 p = position + vec3(
    sin(tempo * .11 * dati.w + f * 6.28) * .22,
    sin(tempo * .07 * dati.w + f * 11.3) * .35,
    cos(tempo * .09 * dati.w + f * 4.7) * .22);
  vec4 mv = modelViewMatrix * vec4(p, 1.);
  gl_Position = projectionMatrix * mv;
  float distanza = -mv.z;
  // cerchio di confusione: fuori fuoco il granello diventa un disco più grande e più tenue
  float coc = clamp(abs(distanza - fuoco) / max(fuoco, .001), 0., 1.);
  float lato = misura * dati.z * scala / distanza;
  gl_PointSize = clamp(lato + coc, 1., 2.5);
  float luccica = 1. - scintillio + scintillio * pow(.5 + .5 * sin(tempo * (1.3 + dati.w) + f * 40.), 10.) * 1.6;
  vAlfa = dati.y * luccica * clamp(lato / gl_PointSize, .25, 1.) * smoothstep(.4, 2.5, distanza);
}`

const frammento = /* glsl */ `
uniform vec3 colore;
varying float vAlfa;
void main() {
  vec2 d = gl_PointCoord - .5;
  float r = dot(d, d) * 4.;
  if (r > 1.) discard;
  // bordo appena più chiaro, come un bokeh vero
  // granello: punto luminoso duro, niente disco
  float disco = 1. - smoothstep(.25, 1., r);
  gl_FragColor = vec4(colore * disco * vAlfa, 1.);
}`

/** punto casuale dentro il fascio: dalla fessura (x entro ±fessura, y = soffitto) lungo la direzione del sole */
function nelFascio(casuale: () => number, vicinoA?: THREE.Vector3) {
  const sole = DIREZIONE_SOLE
  const [minZ, maxZ] = [-dati.sala.max[1], -dati.sala.min[1]]
  for (let tentativo = 0; tentativo < 20; tentativo++) {
    // altezza: soprattutto dove guarda la camera (fino a ~12 m), qualche granello più in alto
    const y = Math.pow(casuale(), 1.6) * dati.soffitto
    const t = (dati.soffitto - y) / -sole.y
    let x = (casuale() * 2 - 1) * dati.fessura + sole.x * t
    let z = minZ + casuale() * (maxZ - minZ) + sole.z * t
    if (vicinoA) {
      x = vicinoA.x + (casuale() * 2 - 1) * 5
      z = vicinoA.z + (casuale() * 2 - 1) * 6
    }
    // torna alla fessura per sapere se è davvero dentro il fascio
    const altoX = x - sole.x * t,
      altoZ = z - sole.z * t
    if (Math.abs(altoX) > dati.fessura || altoZ < minZ || altoZ > maxZ) continue
    const bordo = 1 - THREE.MathUtils.smoothstep(Math.abs(altoX), dati.fessura * 0.8, dati.fessura)
    return { p: new THREE.Vector3(x, y, z), bordo }
  }
  return null
}

/** numeri casuali ripetibili: la polvere è sempre la stessa a ogni visita */
function generatore(seme: number) {
  return () => ((seme = (seme * 16807) % 2147483647) - 1) / 2147483646
}

export function PolvereNelFascio({ fermo = false }: { fermo?: boolean }) {
  const { size, camera, gl } = useThree()
  const punti = useMemo(() => {
    const casuale = generatore(7)
    const n = cinema.polvere.quante
    const posizioni: number[] = []
    const attributi: number[] = []
    for (let i = 0; i < n; i++) {
      // un terzo dei granelli attorno al computer, dove la camera arriva più vicino
      const r = nelFascio(casuale, i % 3 === 0 ? COMPUTER.posizione : undefined)
      if (!r) continue
      posizioni.push(r.p.x, r.p.y, r.p.z)
      attributi.push(casuale(), r.bordo * (0.35 + casuale() * 0.65), 0.5 + casuale() * casuale() * 2.2, 0.6 + casuale() * 0.8)
    }
    const g = new THREE.BufferGeometry()
    g.setAttribute('position', new THREE.Float32BufferAttribute(posizioni, 3))
    g.setAttribute('dati', new THREE.Float32BufferAttribute(attributi, 4))
    const m = new THREE.ShaderMaterial({
      vertexShader: vertice,
      fragmentShader: frammento,
      transparent: true,
      depthWrite: false,
      blending: THREE.AdditiveBlending,
      uniforms: {
        tempo: { value: 0 },
        scala: { value: 1 },
        misura: { value: cinema.polvere.misura },
        fuoco: { value: 8 },
        scintillio: { value: cinema.polvere.scintillio },
        // luce calda del sole, già moltiplicata: il bagliore la raccoglie
        colore: { value: new THREE.Color(cinema.sole.colore).multiplyScalar(cinema.polvere.luce * 1.4) },
      },
    })
    const p = new THREE.Points(g, m)
    p.frustumCulled = false
    return p
  }, [])
  useEffect(
    () => () => {
      punti.geometry.dispose()
      ;(punti.material as THREE.Material).dispose()
    },
    [punti],
  )
  useFrame(({ clock }) => {
    const u = (punti.material as THREE.ShaderMaterial).uniforms
    const c = camera as THREE.PerspectiveCamera
    // eslint-disable-next-line react/immutability -- uniform di Three.js, aggiornati fuori dal render React
    u.tempo.value = fermo ? 0 : clock.elapsedTime
    u.scala.value = (size.height * gl.getPixelRatio()) / (2 * Math.tan(THREE.MathUtils.degToRad(c.fov / 2)))
    u.fuoco.value = scenaImmersiva.fuoco
  })
  return <primitive object={punti} dispose={null} />
}
