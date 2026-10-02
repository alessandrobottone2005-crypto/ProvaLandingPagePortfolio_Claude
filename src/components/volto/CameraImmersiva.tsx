import { useFrame } from '@react-three/fiber'
import { PerspectiveCamera } from 'three'
import { CAMERA, CAMPO } from '@/components/computer/inquadratura'
import { media } from '@/config/movimento'
import { cinema, effettoAttivo } from './cinema'
import { percorso } from './percorso'

const normale = matchMedia(media.normale)
const conRespiro = effettoAttivo('respiro')
const morbido = (a: number, b: number, x: number) => {
  const t = Math.min(1, Math.max(0, (x - a) / (b - a)))
  return t * t * (3 - 2 * t)
}
// rumore lento e morbido: somma di seni con periodi che non si ripetono
const onda = (t: number, a: number) => Math.sin(t * 1.0 + a) * 0.6 + Math.sin(t * 0.61 + a * 2.3) * 0.3 + Math.sin(t * 0.27 + a * 4.1) * 0.1

// La camera resta ferma: è il mondo a muoversi (Mondo.tsx). Solo nell’header si inclina appena per l’ingresso,
// e respira come su uno steadicam (cinema.ts), tranne davanti allo schermo: lì l’interfaccia è posata sul vetro.
export function CameraImmersiva() {
  useFrame(({ camera, clock }) => {
    if (!(camera instanceof PerspectiveCamera)) return
    const ingresso = percorso.header.inclinazione * (1 - Math.min(1, percorso.stazione))
    const s = percorso.stazione
    const r = cinema.respiro
    const ampiezza = conRespiro && normale.matches ? 1 - morbido(0.8, 0.97, s) * (1 - morbido(1.03, 1.2, s)) : 0
    const t = clock.elapsedTime * r.velocita
    camera.position.set(
      CAMERA.x + ingresso * 0.7 + onda(t, 0.3) * r.posizione * ampiezza,
      CAMERA.y + ingresso * 0.18 + onda(t, 1.7) * r.posizione * 0.7 * ampiezza,
      CAMERA.z,
    )
    const giro = (r.rotazione * Math.PI) / 180 * ampiezza
    camera.lookAt(onda(t, 2.9) * giro * CAMERA.z, onda(t, 4.2) * giro * CAMERA.z * 0.6, 0)
    if (camera.fov !== CAMPO) {
      camera.fov = CAMPO
      camera.updateProjectionMatrix()
    }
    camera.updateMatrixWorld()
  }, -2)
  return null
}
