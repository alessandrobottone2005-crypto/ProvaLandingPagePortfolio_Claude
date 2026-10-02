// Computer.glb poggiato sul pavimento della sala, nel fascio di luce della fessura. Il vetro si illumina all’accensione;
// l’interfaccia vera è DOM posato sopra lo schermo (components/computer/Interfaccia.tsx).
import { useFrame, useThree } from '@react-three/fiber'
import { riscaldamento } from './riscaldamento'
import { use, useEffect, useMemo } from 'react'
import * as THREE from 'three'
import { matriceComputer, VETRO } from '@/components/computer/inquadratura'
import { dallaScena, leggiFase } from '@/components/computer/stato'
import { caricaComputer } from './modelloComputer'

const larghezza = VETRO.destra - VETRO.sinistra
const altezza = VETRO.alto - VETRO.basso

/** `fermo`: movimento ridotto, il vetro si accende senza dissolvenza */
export function ComputerNellaScena({ fermo = false }: { fermo?: boolean }) {
  const originale = use(caricaComputer())
  useEffect(() => void riscaldamento.pronti.add('computer'), [])
  const scena = useMemo(() => {
    if (!originale) return null
    const copia = originale.clone(true)
    copia.traverse((o) => {
      if (o instanceof THREE.Mesh) o.castShadow = o.receiveShadow = true
    })
    return copia
  }, [originale])
  // la mappa d’ombra del sole si disegna una volta sola (Sala.tsx): se il computer arriva dopo, va ridisegnata
  const gl = useThree((s) => s.gl)
  useEffect(() => {
    // eslint-disable-next-line react/immutability -- renderer di Three.js, non stato React
    if (scena) gl.shadowMap.needsUpdate = true
  }, [gl, scena])
  const vetro = useMemo(() => {
    const geometria = new THREE.PlaneGeometry(larghezza, altezza)
    // Bagliore del tubo: bianco caldo dei fosfori, appena sopra la soglia del Bloom così la cornice ne riceve l’alone.
    const materiale = new THREE.MeshBasicMaterial({ color: '#e7e1d1', transparent: true, opacity: 0, toneMapped: false })
    materiale.color.multiplyScalar(1.35)
    const mesh = new THREE.Mesh(geometria, materiale)
    mesh.position.set(VETRO.x - 0.002, (VETRO.alto + VETRO.basso) / 2, (VETRO.sinistra + VETRO.destra) / 2)
    mesh.rotation.y = -Math.PI / 2
    return mesh
  }, [])
  const luce = useMemo(() => {
    // Luce dello schermo sulla tastiera e sul pavimento.
    const l = new THREE.PointLight('#efe7d4', 0, 3, 2)
    l.position.set(VETRO.x - 0.35, (VETRO.alto + VETRO.basso) / 2, (VETRO.sinistra + VETRO.destra) / 2)
    return l
  }, [])
  useEffect(
    () => () => {
      vetro.geometry.dispose()
      ;(vetro.material as THREE.Material).dispose()
      luce.dispose()
    },
    [vetro, luce],
  )
  useFrame((_, delta) => {
    const meta = leggiFase() === 'spento' ? 0 : 1
    const m = vetro.material as THREE.MeshBasicMaterial
    // eslint-disable-next-line react/immutability -- materiale e luce di Three.js, aggiornati fuori dal render React
    m.opacity = fermo ? meta : THREE.MathUtils.damp(m.opacity, meta, meta ? 6 : 10, Math.min(delta, 0.05))
    // eslint-disable-next-line react/immutability
    luce.intensity = m.opacity * 0.8
    dallaScena()
  }, -0.8)
  return (
    <group matrixAutoUpdate={false} matrix={matriceComputer}>
      {scena && <primitive object={scena} dispose={null} />}
      <primitive object={vetro} />
      <primitive object={luce} />
    </group>
  )
}
