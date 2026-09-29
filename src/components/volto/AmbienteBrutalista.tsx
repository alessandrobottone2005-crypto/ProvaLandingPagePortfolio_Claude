// Prova della greybox brutalista: l’edificio scorre in linea retta da una stazione all’altra.
// Luci in tempo reale; se il file manca o non si carica, la scena resta quella attuale.
import { useFrame } from '@react-three/fiber'
import { use, useEffect, useMemo } from 'react'
import * as THREE from 'three'
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js'
import { MeshoptDecoder } from 'three/examples/jsm/libs/meshopt_decoder.module.js'
import dati from './ambienteGreybox.json'
import { percorso } from './percorso'

const MODELLO = '/ambiente/ambiente-greybox.glb'
// Blender (x, y, z) → sito (x, z, −y), nell’ordine header → spirale → biografia → contatti.
const daBlender = ([x, y, z]: number[]) => new THREE.Vector3(x, z, -y)
const stazioni = (['header', 'spirale', 'biografia', 'contatti'] as const).map((n) => daBlender(dati.stazioni[n].posizione))
const [sole] = dati.sole

// Nodo «archi ombra alto destra» di Blender (non esportabile in glTF): scurisce gli archi verso l’alto a destra.
const ARCHI_SCURI = 'A · archi ombra alto destra'
const smootherstep = (v: number, da: number, a: number) => {
  const t = Math.min(1, Math.max(0, (v - da) / (a - da)))
  return t * t * t * (t * (t * 6 - 15) + 10)
}
function sfumaArchi(mesh: THREE.Mesh, radice: THREE.Object3D, base: THREE.Color) {
  const matrice = radice.matrixWorld.clone().invert().multiply(mesh.matrixWorld)
  const pos = mesh.geometry.getAttribute('position')
  const colori = new Float32Array(pos.count * 3)
  const p = new THREE.Vector3()
  for (let i = 0; i < pos.count; i++) {
    p.fromBufferAttribute(pos, i).applyMatrix4(matrice)
    // Sito (x, y, z) → Blender (x, −z, y): la sfumatura usa X e Z di Blender.
    const f = smootherstep(p.x, -1, 4) * smootherstep(p.y, 0.8, 3.3)
    const scuro = THREE.MathUtils.lerp(1, 0.007 / base.r, f)
    colori.set([scuro, scuro, scuro], i * 3)
  }
  mesh.geometry.setAttribute('color', new THREE.BufferAttribute(colori, 3))
}

// I fari del volto e i tagli della spirale (RectArea) restano invariati sul logo; sull’edificio arrivano attenuati.
const FARI_SU_EDIFICIO = 0.15
// Le Area di Blender convertite in faretti bruciavano gli archi: calibrate a vista sulle anteprime EEVEE.
const APERTURE = 0.5
function attenuaFari(shader: THREE.WebGLProgramParametersWithUniforms) {
  shader.fragmentShader = shader.fragmentShader.replace(
    '#include <lights_fragment_begin>',
    THREE.ShaderChunk.lights_fragment_begin.replace(
      'rectAreaLight = rectAreaLights[ i ];',
      `rectAreaLight = rectAreaLights[ i ]; rectAreaLight.color *= ${FARI_SU_EDIFICIO.toFixed(3)};`,
    ),
  )
}

let caricamento: Promise<THREE.Group | null> | undefined
function caricaAmbiente() {
  return (caricamento ??= new GLTFLoader()
    .setMeshoptDecoder(MeshoptDecoder)
    .loadAsync(MODELLO)
    .then((g) => g.scene)
    .catch((errore: unknown) => {
      console.warn('ambiente greybox non disponibile:', errore)
      return null
    }))
}

// ?ambiente=0 spegne l’edificio per il confronto con la versione attuale.
export const ambienteAttivo = new URLSearchParams(location.search).get('ambiente') !== '0'

export function AmbienteBrutalista() {
  const scena = use(caricaAmbiente())
  return scena ? <Edificio scena={scena} /> : null
}

function Edificio({ scena }: { scena: THREE.Group }) {
  const materiali = useMemo(() => {
    const creati = new Map<THREE.Material, THREE.MeshStandardMaterial>()
    scena.updateMatrixWorld(true)
    scena.traverse((o) => {
      if (!(o instanceof THREE.Mesh)) return
      o.castShadow = o.receiveShadow = true
      if (!Array.isArray(o.material) && o.material.name === ARCHI_SCURI) sfumaArchi(o, scena, (o.material as THREE.MeshStandardMaterial).color)
      const vecchi = Array.isArray(o.material) ? o.material : [o.material]
      const nuovi = vecchi.map((m: THREE.Material) => {
        if (!creati.has(m)) {
          const s = m as THREE.MeshStandardMaterial
          // Greybox opaca: colore e ruvidezza dal file, niente metallo né trasparenze.
          creati.set(
            m,
            new THREE.MeshStandardMaterial({
              name: m.name,
              color: s.color,
              roughness: s.roughness ?? 0.8,
              metalness: 0,
              vertexColors: m.name === ARCHI_SCURI,
            }),
          )
          creati.get(m)!.onBeforeCompile = attenuaFari
          m.dispose()
        }
        return creati.get(m)!
      })
      o.material = Array.isArray(o.material) ? nuovi : nuovi[0]
    })
    return [...creati.values()]
  }, [scena])
  const luci = useMemo(() => {
    const esposizione = 2 ** dati.esposizione
    // Sole di Blender, molto debole nella greybox: resta fedele al file, senza ombre.
    const s = new THREE.DirectionalLight(new THREE.Color(...sole.colore), sole.energia * esposizione)
    s.position.copy(daBlender(sole.direzione)).multiplyScalar(-45)
    // Le Area nelle aperture diventano faretti con ombra: stessa posizione, direzione e potenza (W/π ≈ candele in asse).
    const aperture = dati.aperture.map((a) => {
      const l = new THREE.SpotLight(new THREE.Color(...a.colore), (a.potenza / Math.PI) * esposizione * APERTURE, 0, 1.25, 1, 2)
      const partenza = daBlender(a.posizione)
      l.userData.partenza = partenza
      l.userData.verso = daBlender(a.direzione).normalize()
      l.castShadow = true
      l.shadow.mapSize.set(1024, 1024)
      l.shadow.bias = -0.0005
      l.shadow.normalBias = 0.03
      l.shadow.camera.near = 0.5
      l.shadow.camera.far = 80
      return l
    })
    return [s, ...aperture]
  }, [])
  useEffect(
    () => () => {
      materiali.forEach((m) => m.dispose())
      luci.forEach((l) => l.dispose())
    },
    [materiali, luci],
  )
  const posizione = useMemo(() => new THREE.Vector3(), [])
  useFrame(() => {
    const t = Math.min(3, Math.max(0, percorso.stazione))
    const i = Math.min(2, Math.floor(t))
    posizione.lerpVectors(stazioni[i], stazioni[i + 1], t - i)
    scena.position.copy(posizione).negate()
    // Luci e bersagli seguono l’edificio; la finestra delle ombre resta così sulla stazione corrente.
    for (const l of luci) {
      if (!(l instanceof THREE.SpotLight)) continue
      l.position.copy(l.userData.partenza).add(scena.position)
      l.target.position.copy(l.position).add(l.userData.verso)
      l.target.updateMatrixWorld()
    }
  }, -1)
  return (
    <>
      {luci.map((l) => (
        <group key={l.uuid}>
          <primitive object={l} />
          <primitive object={l.target} />
        </group>
      ))}
      <primitive object={scena} dispose={null} />
    </>
  )
}
