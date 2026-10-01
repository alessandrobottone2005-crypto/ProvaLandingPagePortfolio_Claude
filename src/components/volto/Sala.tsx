// Sala di cemento realistica: luce cotta in Blender (lightmap), cemento PBR, pavimento bagnato con riflessi veri,
// sole in tempo reale solo per ciò che si muove (computer e volto). La muove Mondo.tsx insieme al computer.
import { MeshReflectorMaterial } from '@react-three/drei/core/MeshReflectorMaterial'
import { useFrame, useThree } from '@react-three/fiber'
import { use, useEffect, useMemo } from 'react'
import * as THREE from 'three'
import { COMPUTER } from '@/components/computer/inquadratura'
import { DIREZIONE_SOLE, INTENSITA_LUCE } from './luceSala'
import { caricaSala, type RisorseSala } from './modelloSala'
import { scenaImmersiva } from './scenaImmersiva'

// ?ambiente=0 spegne la sala per il confronto.
export const salaAttiva = new URLSearchParams(location.search).get('ambiente') !== '0'

/** pareti e pavimento: la luce del sole e dei fari è già nella lightmap (diffusa) o nei riflessi; qui nessuna luce diretta */
function soloRiflessi(shader: THREE.WebGLProgramParametersWithUniforms) {
  shader.fragmentShader = shader.fragmentShader.replace(
    '#include <lights_fragment_end>',
    '#include <lights_fragment_end>\n reflectedLight.directDiffuse = vec3(0.0);\n reflectedLight.directSpecular = vec3(0.0);',
  )
}

/** riflesso del pavimento come luce aggiunta, non come tinta: più forte sul bagnato e di taglio (Fresnel) */
function pavimentoBagnato(materiale: THREE.MeshStandardMaterial) {
  const originale = materiale.onBeforeCompile.bind(materiale)
  materiale.onBeforeCompile = (shader, renderer) => {
    originale(shader, renderer)
    soloRiflessi(shader)
    shader.fragmentShader = shader.fragmentShader.replace(
      'diffuseColor.rgb = diffuseColor.rgb * ((1.0 - min(1.0, mirror)) + newMerge.rgb * mixStrength);',
      `float bagnato = 1.0 - smoothstep(0.08, 0.55, reflectorRoughnessFactor);
       float fresnel = 0.04 + 0.96 * pow(1.0 - clamp(dot(normalize(vViewPosition), normal), 0.0, 1.0), 5.0);
       totalEmissiveRadiance += newMerge.rgb * mixStrength * mix(0.3, 1.0, bagnato) * mix(0.4, 1.0, fresnel);`,
    )
  }
  materiale.customProgramCacheKey = () => 'pavimento-bagnato'
  materiale.needsUpdate = true
}

/** la compressione Meshopt quantizza posizioni e normali e mette la scala nel nodo: torna a float e coordinate reali */
function geometriaVera(mesh: THREE.Mesh) {
  const g = mesh.geometry.clone()
  for (const nome of Object.keys(g.attributes)) {
    const a = g.getAttribute(nome)
    if (a instanceof THREE.BufferAttribute && !a.normalized && a.array instanceof Float32Array) continue
    const valori = new Float32Array(a.count * a.itemSize)
    for (let i = 0; i < a.count; i++) for (let k = 0; k < a.itemSize; k++) valori[i * a.itemSize + k] = a.getComponent(i, k)
    g.setAttribute(nome, new THREE.BufferAttribute(valori, a.itemSize))
  }
  mesh.updateWorldMatrix(true, false)
  return g.applyMatrix4(mesh.matrixWorld)
}

export function Sala({ fermo = false }: { fermo?: boolean }) {
  const risorse = use(caricaSala())
  return risorse ? <Stanza risorse={risorse} fermo={fermo} /> : null
}

function Stanza({ risorse, fermo }: { risorse: RisorseSala; fermo: boolean }) {
  const { gl, scene } = useThree()
  const parti = useMemo(() => {
    let pareti: THREE.Mesh | undefined
    let pavimento: THREE.Mesh | undefined
    risorse.scena.traverse((o) => {
      if (!(o instanceof THREE.Mesh)) return
      if ((o.material as THREE.Material).name === 'cemento_pavimento') pavimento = o
      else pareti = o
    })
    if (!pareti || !pavimento) throw new Error('sala incompleta')
    const sorgente = pareti.material as THREE.MeshStandardMaterial
    const materialePareti = sorgente.clone()
    Object.assign(materialePareti, { lightMap: risorse.luce.sala, lightMapIntensity: INTENSITA_LUCE, metalness: 0, envMapIntensity: 0.6 })
    materialePareti.onBeforeCompile = soloRiflessi
    materialePareti.customProgramCacheKey = () => 'pareti-sala'
    const muri = new THREE.Mesh(geometriaVera(pareti), materialePareti)
    // la luce della sala è già cotta: le ombre in tempo reale servono solo al computer (vedi il piano sotto)
    muri.receiveShadow = true
    // il pavimento guarda in alto (+y); il riflettore di drei vuole la normale locale +z
    const geometriaPavimento = geometriaVera(pavimento).rotateX(Math.PI / 2)
    const p = pavimento.material as THREE.MeshStandardMaterial
    return { muri, materialePareti, geometriaPavimento, pavimento: { map: p.map, normalMap: p.normalMap, roughnessMap: p.roughnessMap } }
  }, [risorse])

  const sole = useMemo(() => {
    // tempo reale solo per gli oggetti che si muovono: la fessura (ombra del soffitto) delimita il fascio
    const l = new THREE.DirectionalLight('#fff8ee', 5.5)
    l.castShadow = true
    l.shadow.mapSize.set(2048, 2048)
    l.shadow.bias = -0.0004
    l.shadow.normalBias = 0.04
    const c = l.shadow.camera
    c.left = c.bottom = -9
    c.right = c.top = 9
    c.near = 1
    c.far = 80
    l.target.position.copy(COMPUTER.posizione)
    l.position.copy(COMPUTER.posizione).addScaledVector(DIREZIONE_SOLE, -40)
    return l
  }, [])

  // ambiente per i riflessi di volto, computer e cemento: la sala stessa vista dal computer, una volta sola
  const ambiente = useMemo(() => {
    const scena = new THREE.Scene()
    const copia = new THREE.Mesh(parti.muri.geometry, parti.materialePareti)
    copia.position.copy(COMPUTER.posizione).negate().setY(-2)
    scena.add(copia)
    const pmrem = new THREE.PMREMGenerator(gl)
    const rt = pmrem.fromScene(scena, 0.02, 0.1, 200)
    pmrem.dispose()
    return rt
  }, [gl, parti])

  useEffect(() => {
    const prima = { env: scene.environment, intensita: scene.environmentIntensity }
    // scena di Three.js: oggetto mutabile per natura, non stato React
    // eslint-disable-next-line react/immutability
    scene.environment = ambiente.texture
    scene.environmentIntensity = 0.55
    return () => {
      scene.environment = prima.env
      scene.environmentIntensity = prima.intensita
    }
  }, [scene, ambiente])

  useEffect(
    () => () => {
      parti.materialePareti.dispose()
      parti.muri.geometry.dispose()
      parti.geometriaPavimento.dispose()
      sole.dispose()
      ambiente.dispose()
    },
    [parti, sole, ambiente],
  )

  // i riflessi seguono l’orientamento della sala mentre il mondo ruota
  const rotazione = useMemo(() => new THREE.Matrix4(), [])
  useFrame((stato) => {
    rotazione.extractRotation(scenaImmersiva.mondo)
    stato.scene.environmentRotation.setFromRotationMatrix(rotazione)
  }, -0.85)

  return (
    <>
      <primitive object={parti.muri} />
      <mesh geometry={parti.geometriaPavimento} rotation-x={-Math.PI / 2} receiveShadow>
        <MeshReflectorMaterial
          ref={(m: THREE.MeshStandardMaterial | null) => {
            if (m && !m.userData.bagnato) {
              m.userData.bagnato = true
              pavimentoBagnato(m)
            }
          }}
          map={parti.pavimento.map}
          normalMap={parti.pavimento.normalMap}
          roughnessMap={parti.pavimento.roughnessMap}
          lightMap={risorse.luce.pavimento}
          lightMapIntensity={INTENSITA_LUCE}
          envMapIntensity={0.25}
          metalness={0}
          roughness={1}
          resolution={fermo ? 1024 : 768}
          blur={[320, 90]}
          mixBlur={1.6}
          mixStrength={2.6}
          mixContrast={1}
          mirror={0}
          depthScale={0}
        />
      </mesh>
      {/* ombra del computer sul pavimento: solo lui proietta ombre, il resto è nella luce cotta */}
      <mesh position={[COMPUTER.posizione.x, 0.012, COMPUTER.posizione.z]} rotation-x={-Math.PI / 2} receiveShadow>
        <planeGeometry args={[18, 18]} />
        <shadowMaterial transparent opacity={0.62} depthWrite={false} />
      </mesh>
      <primitive object={sole} />
      <primitive object={sole.target} />
    </>
  )
}
