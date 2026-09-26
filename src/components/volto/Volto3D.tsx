// il volto in 3d, sovrapposto al volto svg dell’header (claude.md §6.2).
// questo file (e three.js) si scarica a parte, durante il preloader.
// gsap non tocca la scena: scrive dei numeri in `controllo`, che la scena legge a ogni fotogramma.
import { Canvas, useFrame, useThree } from '@react-three/fiber'
import { useMemo, useRef, type RefObject } from 'react'
import * as THREE from 'three'
import { sguardo } from './sguardo'
import { Luci, precarica, useModello } from './tre'

export const URL_MODELLO = '/volto/volto.glb'

/** larghezza e altezza del contenuto del logo nell’svg (vedi geometria.ts) */
const LOGO_SVG = { larghezza: 247.41, altezza: 176.88 }
const FOV = 18
const DISTANZA = 20

export type Controllo3D = {
  /** rotazione della camera attorno al volto, in gradi (fase 3d: ≈ 35) */
  rotazione: number
  /** 1 = stessa misura del volto svg; meno di 1 = la camera arretra */
  scala: number
  /** posizione della luce che scorre, da 0 a 1 */
  luce: number
  /** quanto il modello si inclina verso il cursore, da 0 a 1 */
  inclinazione: number
}

type Props = {
  /** l’elemento svg con cui il modello deve coincidere */
  riferimento: RefObject<Element | null>
  controllo: RefObject<Controllo3D>
  attivo: boolean
  mobile: boolean
}

export default function Volto3D({ riferimento, controllo, attivo, mobile }: Props) {
  return (
    <Canvas
      frameloop={attivo ? 'always' : 'never'}
      dpr={[1, mobile ? 1.5 : 2]}
      camera={{ fov: FOV, position: [0, 0, DISTANZA], near: 1, far: 60 }}
      gl={{ antialias: true, alpha: true, powerPreference: 'high-performance' }}
      style={{ pointerEvents: 'none' }}
      aria-hidden="true"
    >
      <Luci risoluzione={mobile ? 64 : 128} />
      <ambientLight intensity={0.15} />
      <Modello riferimento={riferimento} controllo={controllo} />
    </Canvas>
  )
}

function Modello({ riferimento, controllo }: Pick<Props, 'riferimento' | 'controllo'>) {
  const { scene } = useModello(URL_MODELLO)
  const gruppo = useRef<THREE.Group>(null)
  const luce = useRef<THREE.DirectionalLight>(null)
  const inclinazione = useRef({ x: 0, y: 0 })
  const { camera, size } = useThree()

  // una sola geometria, centrata e girata esattamente verso la camera
  const { geometria, misure } = useMemo(() => {
    scene.updateMatrixWorld(true)
    let mesh: THREE.Mesh | undefined
    scene.traverse((o) => {
      if (!mesh && (o as THREE.Mesh).isMesh) mesh = o as THREE.Mesh
    })
    if (!mesh) throw new Error('volto.glb: nessuna mesh trovata')
    // il file compresso salva le coordinate come interi: le riporto a numeri decimali prima di trasformarle
    const g = new THREE.BufferGeometry()
    g.setIndex(mesh.geometry.index)
    for (const nome of ['position', 'normal'] as const) {
      const a = mesh.geometry.getAttribute(nome)
      const valori = new Float32Array(a.count * 3)
      for (let i = 0; i < a.count; i++) valori.set([a.getX(i), a.getY(i), a.getZ(i)], i * 3)
      g.setAttribute(nome, new THREE.BufferAttribute(valori, 3))
    }
    g.applyMatrix4(mesh.matrixWorld)
    g.normalizeNormals()
    // nel file il modello è ruotato di qualche grado: lo raddrizzo
    const asseX = new THREE.Vector3(1, 0, 0).transformDirection(mesh.matrixWorld)
    g.rotateY(-Math.atan2(-asseX.z, asseX.x))
    g.computeBoundingBox()
    const box = g.boundingBox!
    const centro = box.getCenter(new THREE.Vector3())
    const dim = box.getSize(new THREE.Vector3())
    // il fronte del modello sta sul piano z = 0, come l’svg
    g.translate(-centro.x, -centro.y, -box.max.z)
    return { geometria: g, misure: dim }
  }, [scene])

  const materiale = useMemo(() => new THREE.MeshStandardMaterial({ color: '#c9c5c0', roughness: 0.55, metalness: 0 }), [])

  useFrame((_, delta) => {
    const g = gruppo.current
    const el = riferimento.current
    const c = controllo.current
    if (!g || !el || !c) return

    // misura in pixel del volto svg → unità della scena sul piano z = 0
    const r = el.getBoundingClientRect()
    const unitaPerPixel = (2 * DISTANZA * Math.tan(THREE.MathUtils.degToRad(FOV / 2))) / size.height
    const scalaBase = (r.width * unitaPerPixel) / misure.x
    const pxPerSvg = r.width / LOGO_SVG.larghezza
    const centroX = r.left + r.width / 2
    const centroY = r.top + ((misure.y / misure.x) * LOGO_SVG.larghezza * pxPerSvg) / 2
    g.position.set((centroX - size.width / 2) * unitaPerPixel, -(centroY - size.height / 2) * unitaPerPixel, 0)
    g.scale.setScalar(scalaBase * c.scala)

    // si inclina verso il cursore, con inerzia
    const p = sguardo.get().punto
    const tx = p ? (p.y / size.height - 0.5) * 0.35 * c.inclinazione : 0
    const ty = p ? (p.x / size.width - 0.5) * 0.5 * c.inclinazione : 0
    inclinazione.current.x = THREE.MathUtils.damp(inclinazione.current.x, tx, 4, delta)
    inclinazione.current.y = THREE.MathUtils.damp(inclinazione.current.y, ty, 4, delta)
    g.rotation.set(inclinazione.current.x, THREE.MathUtils.degToRad(c.rotazione) + inclinazione.current.y, 0)

    // la luce scorre da sinistra a destra sulla superficie
    if (luce.current) luce.current.position.set(THREE.MathUtils.lerp(-8, 8, c.luce), 3, 6)
    camera.lookAt(0, 0, 0)
  })

  return (
    <>
      <directionalLight ref={luce} intensity={1.6} position={[-8, 3, 6]} />
      <group ref={gruppo}>
        <mesh geometry={geometria} material={materiale} />
      </group>
    </>
  )
}

// scarica il modello in anticipo (chiamato dal preloader)
// eslint-disable-next-line react-refresh/only-export-components
export function precaricaModello() {
  precarica(URL_MODELLO)
}
