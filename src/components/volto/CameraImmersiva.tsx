import { useFrame } from '@react-three/fiber'
import { MathUtils, PerspectiveCamera } from 'three'
import { movimento } from '@/config/movimento'
import { progetti } from '@/lib/progetti'
import { cardImmersive, fasiSpirale } from './cardImmersive'
import { percorso } from './percorso'

const C = movimento.portfolio.spirale3d
const semialtezza = 20 * Math.tan(MathUtils.degToRad(9))

export function CameraImmersiva() {
  useFrame(({ camera, size }) => {
    if (!(camera instanceof PerspectiveCamera)) return
    const { apertura, giro, piatta } = percorso.spirale
    const { ritiro, frontale } = fasiSpirale(piatta)
    const presenza = apertura * (1 - frontale) * percorso.header.opacity
    const avanzamento = giro / Math.max(1, progetti.length - 1)
    const angolo = MathUtils.degToRad(MathUtils.lerp(C.orbitaDa, C.orbitaA, avanzamento)) * presenza
    const elevazione = MathUtils.degToRad(C.elevazione + Math.sin(avanzamento * Math.PI) * 4) * presenza
    const fov = MathUtils.lerp(18, C.campoVisivo, presenza)
    // Cambiano focale e distanza insieme: il volto resta inquadrato mentre emerge la profondità.
    const distanza = semialtezza / Math.tan(MathUtils.degToRad(fov / 2))
    const w = Math.min(size.height * 0.27, size.width * 0.38, 300)
    const altezzaElica = (progetti.length * w * C.passo * C.passoRitiro + w * 2) * (semialtezza * 2 / size.height)
    const arretramento = Math.max(distanza, altezzaElica / (2 * Math.tan(MathUtils.degToRad(C.campoVisivo / 2))) * 1.12)
    const raggio = MathUtils.lerp(distanza, arretramento, ritiro * (1 - frontale))
    const ingresso = percorso.header.inclinazione * (1 - apertura) * (1 - piatta)
    camera.position.set(
      Math.sin(angolo) * Math.cos(elevazione) * raggio + ingresso * 0.7,
      Math.sin(elevazione) * raggio + ingresso * 0.18,
      Math.cos(angolo) * Math.cos(elevazione) * raggio,
    )
    // L’intera elica resta al centro durante il campo lungo, anche vicino al suo punto di avvolgimento.
    let centroY = 0
    if (ritiro > 0 && cardImmersive.length) {
      let min = Infinity, max = -Infinity
      for (const p of cardImmersive) { min = Math.min(min, p.y); max = Math.max(max, p.y) }
      centroY = -(min + max) * 0.5 * (semialtezza * 2 / size.height) * ritiro * (1 - frontale)
    }
    camera.lookAt(0, centroY, 0)
    if (Math.abs(camera.fov - fov) > 0.00001) {
      camera.fov = fov
      camera.updateProjectionMatrix()
    }
    camera.updateMatrixWorld()
  }, -2)
  return null
}
