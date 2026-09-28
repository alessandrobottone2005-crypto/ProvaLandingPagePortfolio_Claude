import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js'
import { MeshoptDecoder } from 'three/examples/jsm/libs/meshopt_decoder.module.js'

const MODELLO = '/volto/logo-metallo-v2.glb'
function carica(alProgresso?: (p: number) => void) {
  return new GLTFLoader().setMeshoptDecoder(MeshoptDecoder).loadAsync(MODELLO, (e) => {
    if (e.total) alProgresso?.(e.loaded / e.total)
  }).then(modello => ({ modello }))
}
// Il modello V2 è condiviso; le tre luci e il volume vengono ricostruiti nella scena interattiva.
let caricamento: ReturnType<typeof carica> | undefined
export function caricaLogo(alProgresso?: (p: number) => void) {
  return (caricamento ??= carica(alProgresso))
}
