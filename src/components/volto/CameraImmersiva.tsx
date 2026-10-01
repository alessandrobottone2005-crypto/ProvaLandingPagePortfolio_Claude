import { useFrame } from '@react-three/fiber'
import { PerspectiveCamera } from 'three'
import { CAMERA, CAMPO } from '@/components/computer/inquadratura'
import { percorso } from './percorso'

// La camera resta ferma: è il mondo a muoversi (Mondo.tsx). Solo nell’header si inclina appena per l’ingresso.
export function CameraImmersiva() {
  useFrame(({ camera }) => {
    if (!(camera instanceof PerspectiveCamera)) return
    const ingresso = percorso.header.inclinazione * (1 - Math.min(1, percorso.stazione))
    camera.position.set(CAMERA.x + ingresso * 0.7, CAMERA.y + ingresso * 0.18, CAMERA.z)
    camera.lookAt(0, 0, 0)
    if (camera.fov !== CAMPO) {
      camera.fov = CAMPO
      camera.updateProjectionMatrix()
    }
    camera.updateMatrixWorld()
  }, -2)
  return null
}
