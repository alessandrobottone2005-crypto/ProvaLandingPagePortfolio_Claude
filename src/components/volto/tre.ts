// pezzi 3d del blocco modello3d nella finestra del progetto (caricamento .glb e luci da studio).
// scritti con three puro invece di importare drei per intero: stesso risultato, molto meno codice da scaricare.
import { useThree, useLoader } from '@react-three/fiber'
import { useLayoutEffect } from 'react'
import * as THREE from 'three'
import { MeshoptDecoder } from 'three/examples/jsm/libs/meshopt_decoder.module.js'
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js'

/** i modelli sono compressi con meshopt (npm run prepara-progetti) */
const conMeshopt = (loader: GLTFLoader) => void loader.setMeshoptDecoder(MeshoptDecoder)

/** carica un .glb (con suspense, come useGLTF di drei); `alProgresso` riceve l’avanzamento da 0 a 1 */
export function useModello(url: string, alProgresso?: (p: number) => void) {
  return useLoader(GLTFLoader, url, conMeshopt, alProgresso && ((e) => e.total && alProgresso(e.loaded / e.total)))
}

// pannelli luminosi attorno al modello (come i lightformer di drei), tutti rivolti verso il centro
const PANNELLI = [
  { forma: 'rect', intensita: 2.2, posizione: [0, 4, 6], scala: [10, 4, 1] },
  { forma: 'rect', intensita: 0.8, posizione: [-6, 0, 3], scala: [4, 8, 1] },
  { forma: 'ring', intensita: 1.2, posizione: [5, -2, 4], scala: [3, 3, 3] },
] as const

/**
 * luce d’ambiente “da studio”: i pannelli vengono fotografati una volta sola in una mappa a cubo,
 * che diventa l’ambiente riflesso dal materiale. nessuna hdri scaricata da internet.
 */
export function Luci({ risoluzione }: { risoluzione: number }) {
  const leggi = useThree((s) => s.get)

  useLayoutEffect(() => {
    const { gl, scene: scena } = leggi()
    const studio = new THREE.Scene()
    const pezzi: { geometria: THREE.BufferGeometry; materiale: THREE.Material }[] = []
    for (const p of PANNELLI) {
      const geometria = p.forma === 'ring' ? new THREE.RingGeometry(0.25, 0.5, 64) : new THREE.PlaneGeometry(1, 1)
      const materiale = new THREE.MeshBasicMaterial({ color: new THREE.Color('white').multiplyScalar(p.intensita), side: THREE.DoubleSide, toneMapped: false })
      const mesh = new THREE.Mesh(geometria, materiale)
      mesh.position.fromArray(p.posizione)
      mesh.scale.fromArray(p.scala)
      mesh.lookAt(0, 0, 0)
      studio.add(mesh)
      pezzi.push({ geometria, materiale })
    }

    const fbo = new THREE.WebGLCubeRenderTarget(risoluzione)
    fbo.texture.type = THREE.HalfFloatType
    const camera = new THREE.CubeCamera(0.1, 1000, fbo)
    const autoClear = gl.autoClear
    gl.autoClear = true
    camera.update(gl, studio)
    gl.autoClear = autoClear

    const prima = scena.environment
    scena.environment = fbo.texture
    return () => {
      scena.environment = prima
      fbo.dispose()
      pezzi.forEach(({ geometria, materiale }) => {
        geometria.dispose()
        materiale.dispose()
      })
    }
  }, [leggi, risoluzione])

  return null
}
