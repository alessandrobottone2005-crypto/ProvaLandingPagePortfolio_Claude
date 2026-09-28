import { useFrame } from '@react-three/fiber'
import { useEffect, useMemo } from 'react'
import { RectAreaLight, Vector3, MathUtils } from 'three'
import { RectAreaLightUniformsLib } from 'three/examples/jsm/lights/RectAreaLightUniformsLib.js'
import { scenaImmersiva as stato } from './scenaImmersiva'
import { percorso } from './percorso'
import { fasiSpirale } from './cardImmersive'

// Posizioni V2 da Blender: (x,y,z) diventa (x,z,-y). Stesse tre sorgenti bianche.
const posizioni = [new Vector3(-3.9167, 3.3025, 1.643), new Vector3(4.1833, 4.1774, 0.5812), new Vector3(-0.498, 1.0887, -2.8946)]
RectAreaLightUniformsLib.init()
export function LuciTeatro() {
  const luci = useMemo(() => [86, 86, 40].map(potenza => new RectAreaLight(0xffffff, potenza * 2 / Math.PI, 1, 1)), [])
  const tagli = useMemo(() => {
    const sx = new RectAreaLight(0xc9c5c0, 0, 4, 7)
    const dx = new RectAreaLight(0xc9c5c0, 0, 3, 6)
    sx.position.set(-5.5, 2.5, 3.5)
    dx.position.set(5, -1.5, -2)
    sx.lookAt(0, 0, 0); dx.lookAt(0, 0, 0)
    return [sx, dx]
  }, [])
  const meta = useMemo(() => new Vector3(), [])
  const mira = useMemo(() => new Vector3(), [])
  const seguito = useMemo(() => new Vector3(), [])
  useEffect(() => () => [...luci, ...tagli].forEach(luce => luce.dispose()), [luci, tagli])
  useFrame((_, delta) => {
    const dt = Math.min(delta, 0.05)
    const { distensione, ritiro } = fasiSpirale(percorso.spirale.piatta)
    // Due superfici ampie rivelano fianchi e smussi solo durante la spirale.
    // Le copertine usano un materiale indipendente dai fari: nessun riflesso sopra le immagini.
    const intensita = percorso.spirale.apertura * (1 - distensione) * 7
    tagli.forEach((luce, i) => {
      luce.intensity = intensita * (1 - ritiro * 0.35)
      luce.height = (i === 0 ? 7 : 6) * (1 + ritiro)
    })
    seguito.lerp(stato.logo, 1 - Math.exp(-2.8 * dt))
    // I fari accompagnano il soggetto con inerzia, senza cambiarne l’esposizione mentre cresce.
    luci.forEach((luce, i) => {
      const scala = Math.max(0.45, stato.scala)
      meta.copy(posizioni[i]).multiplyScalar(scala).add(seguito)
      luce.position.lerp(meta, 1 - Math.exp(-3.5 * dt))
      luce.width = luce.height = MathUtils.damp(luce.width, scala, 3.5, dt)
      mira.copy(seguito)
      luce.lookAt(mira)
      stato.luci[i].copy(luce.position)
    })
  }, -0.5)
  return <>{[...luci, ...tagli].map((luce, i) => <primitive key={i} object={luce} />)}</>
}
