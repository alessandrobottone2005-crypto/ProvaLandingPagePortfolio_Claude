// Movimento ridotto: stessa stanza e stesso computer, inquadratura ferma davanti allo schermo acceso.
// Nessun volto, volume e polvere fermi: la scena si disegna solo quando cambia qualcosa.
import { Canvas } from '@react-three/fiber'
import { Suspense } from 'react'
import * as THREE from 'three'
import { CAMERA, CAMPO } from '@/components/computer/inquadratura'
import { Rifinitura } from './Rifinitura'
import { Sala, salaAttiva } from './Sala'
import { ComputerNellaScena } from './ComputerNellaScena'
import { Mondo } from './Mondo'
import { PolvereNelFascio } from './PolvereNelFascio'
import { effettoAttivo } from './cinema'

export default function ScenaRidotta() {
  return (
    <Canvas
      shadows={salaAttiva && 'percentage'}
      frameloop="demand"
      dpr={[1, 1.5]}
      camera={{ fov: CAMPO, position: CAMERA.toArray(), near: 0.5, far: 200 }}
      gl={{ antialias: true, alpha: true, toneMapping: THREE.AgXToneMapping }}
      className="absolute! inset-0"
      aria-hidden="true"
    >
      <Mondo stazione={1}>
        {salaAttiva && (
          <Suspense fallback={null}>
            <Sala fermo />
          </Suspense>
        )}
        {salaAttiva && effettoAttivo('polvere') && <PolvereNelFascio fermo />}
        <Suspense fallback={null}>
          <ComputerNellaScena fermo />
        </Suspense>
      </Mondo>
      <Rifinitura sala={salaAttiva} fermo />
    </Canvas>
  )
}
