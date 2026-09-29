// Modello Blender con materiale PBR e shape key, condiviso lungo tutto il percorso.
import { Canvas, useFrame, useThree } from '@react-three/fiber'
import { Suspense, use, useEffect, useMemo, useRef, type RefObject } from 'react'
import * as THREE from 'three'
import { APERTURA, SGUARDO_MAX } from './geometria'
import { leggiPosa, percorso } from './percorso'
import { sguardo } from './sguardo'
import { caricaLogo } from './modelloLogo'
import { useVolto } from './VoltoContext'
import { gsap } from '@/lib/gsap'
import { movimento } from '@/config/movimento'
import { LuciTeatro } from './LuciTeatro'
import { CameraImmersiva } from './CameraImmersiva'
import { CardNelloSpazio } from './CardNelloSpazio'
import { NebbiaVolumetrica } from './NebbiaVolumetrica'
import { scenaImmersiva } from './scenaImmersiva'
import { AmbienteBrutalista, ambienteAttivo } from './AmbienteBrutalista'

function morph(mesh: THREE.Mesh, nome: string, valore: number) {
  const indice = mesh.morphTargetDictionary?.[nome]
  if (indice !== undefined && mesh.morphTargetInfluences) mesh.morphTargetInfluences[indice] = valore
}

export type Controllo3D = { rotazione: number; scala: number; luce: number; inclinazione: number }
type Props = {
  riferimento?: RefObject<Element | null>
  controllo?: RefObject<Controllo3D>
  attivo?: boolean
}

export default function Volto3D({ riferimento, controllo, attivo = true }: Props) {
  const risorse = use(caricaLogo())
  const edificio = !riferimento && ambienteAttivo
  return (
    <Canvas
      shadows={edificio && 'percentage'}
      frameloop="demand"
      dpr={[1, 1.5]}
      camera={{ fov: 18, position: [0, 0, 20], near: 1, far: 60 }}
      gl={{ antialias: true, alpha: true, toneMapping: THREE.AgXToneMapping }}
      style={{ pointerEvents: 'none' }}
      aria-hidden="true"
    >
      <LuciTeatro />
      {!riferimento && <CameraImmersiva />}
      {!riferimento && <Suspense fallback={null}><CardNelloSpazio /></Suspense>}
      {edificio && <Suspense fallback={null}><AmbienteBrutalista /></Suspense>}
      <NebbiaVolumetrica />
      <RenderVisibile attivo={attivo} laboratorio={Boolean(riferimento)} />
      <VoltoAnimato riferimento={riferimento} controllo={controllo} modello={risorse.modello.scene} />
    </Canvas>
  )
}

// La scena resta viva per sguardo e battiti, ma non disegna prima del passaggio al 3d o in background.
function RenderVisibile({ attivo, laboratorio }: { attivo: boolean; laboratorio: boolean }) {
  const invalidate = useThree((s) => s.invalidate)
  useEffect(() => {
    let visibile = false
    const tick = () => {
      const ora = attivo && !document.hidden && (laboratorio || percorso.header.opacity > 0.001)
      if (ora || ora !== visibile) invalidate()
      visibile = ora
    }
    gsap.ticker.add(tick)
    return () => gsap.ticker.remove(tick)
  }, [attivo, laboratorio, invalidate])
  return null
}

function VoltoAnimato({
  riferimento,
  controllo,
  modello,
}: Pick<Props, 'riferimento' | 'controllo'> & { modello: THREE.Group }) {
  const { umore, ascoltaAzioni } = useVolto()
  const gruppo = useRef<THREE.Group>(null)
  const { camera, size } = useThree()
  const azioni = useRef({ battito: -10, occhiolino: -10, sorriso: -10 })
  const stato = useRef({
    aperture: [0.5, 0.5],
    x: 0,
    y: 0,
    sorriso: 0,
    inclinazioneX: 0,
    inclinazioneY: 0,
    prossimo: 0,
  })
  const parti = useMemo(() => {
    // Mesh.clone separa i pesi morph; geometrie, texture e materiali restano in cache.
    const scena = modello.clone(true)
    scena.updateMatrixWorld(true)
    const box = new THREE.Box3()
    const punto = new THREE.Vector3()
    scena.traverse((o) => {
      if (!(o instanceof THREE.Mesh)) return
      o.frustumCulled = false
      // I bounding box dei morph includono tutte le pose: misuriamo solo quella neutra.
      const posizioni = o.geometry.getAttribute('position')
      for (let i = 0; i < posizioni.count; i++)
        box.expandByPoint(punto.fromBufferAttribute(posizioni, i).applyMatrix4(o.matrixWorld))
    })
    const oggetto = (nome: string) => {
      const o = scena.getObjectByName(nome)
      if (!o) throw new Error(`parte del logo mancante: ${nome}`)
      return o
    }
    const centro = box.getCenter(new THREE.Vector3())
    scena.position.sub(centro)
    const occhi = ['sx', 'dx'].map((lato) => {
      const sguardo = oggetto(`sguardo_${lato}`)
      return {
        sguardo,
        riposo: sguardo.position.clone(),
        pupilla: oggetto(`pupilla_${lato}`) as THREE.Mesh,
        palpebra: oggetto(`palpebra_${lato}`) as THREE.Mesh,
      }
    })
    return {
      scena,
      occhi,
      testa: oggetto('testa'),
      sorriso: oggetto('sorriso') as THREE.Mesh,
      larghezza: box.max.x - box.min.x,
    }
  }, [modello])
  useEffect(
    () =>
      ascoltaAzioni((a) => {
        azioni.current[a] = performance.now() / 1000
      }),
    [ascoltaAzioni],
  )
  useFrame((_, delta) => {
    const g = gruppo.current
    if (!g) return
    const r = riferimento?.current?.getBoundingClientRect(),
      c = controllo?.current
    const posa =
      r && c
        ? {
            x: r.left + r.width / 2,
            y: r.top + r.height / 2,
            larghezza: r.width * c.scala,
            rotazione: c.rotazione,
            opacity: 1,
            fase: 'laboratorio',
          }
        : leggiPosa()
    const ora = performance.now() / 1000,
      s = stato.current,
      a = azioni.current
    const host = document.querySelector<HTMLElement>('[data-logo-continuo]')
    if (host) {
      host.dataset.fase = posa.fase
      host.dataset.umore = umore
      host.dataset.modello = 'metallo-blender-v2'
      host.dataset.ambiente = 'volume-teatro'
      host.dataset.apertura = String(s.aperture[0])
      host.style.opacity = String(posa.opacity)
      host.style.zIndex = '10'
    }
    g.visible = posa.opacity > 0.001 && !document.hidden
    if (!g.visible) return
    const unita = (40 * Math.tan(THREE.MathUtils.degToRad(9))) / size.height
    g.position.set((posa.x - size.width / 2) * unita, -(posa.y - size.height / 2) * unita, 0)
    g.scale.setScalar((posa.larghezza * unita) / parti.larghezza)
    const { punto, scorre, tocco } = sguardo.get()
    const target = percorso.guarda ?? punto
    const dorme = umore === 'dorme'
    const vx = target ? target.x - posa.x : 0,
      vy = target ? target.y - posa.y : 0,
      distanza = Math.hypot(vx, vy) || 1
    const forza = SGUARDO_MAX * Math.min(1, distanza / Math.max(posa.larghezza, 240))
    const dx = dorme ? 0 : (vx / distanza) * forza,
      dy = dorme ? 0 : tocco && scorre && !percorso.guarda ? SGUARDO_MAX : (vy / distanza) * forza
    s.x = THREE.MathUtils.damp(s.x, dx, 7, delta)
    s.y = THREE.MathUtils.damp(s.y, dy, 7, delta)
    s.inclinazioneX = THREE.MathUtils.damp(s.inclinazioneX, dorme ? 0 : (vy / size.height) * 0.16, 4, delta)
    s.inclinazioneY = THREE.MathUtils.damp(s.inclinazioneY, dorme ? 0 : (vx / size.width) * 0.22, 4, delta)
    g.rotation.set(s.inclinazioneX, THREE.MathUtils.degToRad(posa.rotazione) + s.inclinazioneY, 0)
    if (!s.prossimo) s.prossimo = ora + 4
    if (ora > s.prossimo) {
      if (!dorme) a.battito = ora
      s.prossimo =
        ora + movimento.volto.battitoMin + Math.random() * (movimento.volto.battitoMax - movimento.volto.battitoMin)
    }
    const battito = ora - a.battito,
      occhiolino = ora - a.occhiolino
    for (let i = 0; i < 2; i++) {
      const chiuso = (battito >= 0 && battito < 0.22) || (i === 1 && occhiolino >= 0 && occhiolino < 0.48)
      s.aperture[i] = THREE.MathUtils.damp(
        s.aperture[i],
        dorme || chiuso ? 0 : APERTURA.naturale,
        dorme ? 3 : chiuso ? 45 : 20,
        delta,
      )
      const occhio = parti.occhi[i]
      const chiusura = 1 - s.aperture[i] / APERTURA.naturale
      morph(occhio.palpebra, 'chiusura', chiusura)
      morph(occhio.pupilla, 'chiusura', chiusura)
      occhio.sguardo.position.set(
        occhio.riposo.x + (s.x / SGUARDO_MAX) * 0.09,
        occhio.riposo.y - (s.y / SGUARDO_MAX) * 0.05,
        occhio.riposo.z,
      )
    }
    s.sorriso = THREE.MathUtils.damp(s.sorriso, ora - a.sorriso < 1.4 ? 1 : 0, 6, delta)
    morph(parti.sorriso, 'sorriso_ampio', s.sorriso)
    const sonno = 1 - s.aperture[0] / APERTURA.naturale
    parti.testa.rotation.set(dorme ? sonno * (0.1 + Math.sin(ora * 2) * 0.012) : 0, 0, dorme ? sonno * 0.055 : 0)
    scenaImmersiva.logo.copy(g.position)
    scenaImmersiva.scala = g.scale.x
    if (riferimento) camera.lookAt(0, 0, 0)
  }, -1)
  return (
    <group ref={gruppo} dispose={null}>
      <primitive object={parti.scena} dispose={null} />
    </group>
  )
}
