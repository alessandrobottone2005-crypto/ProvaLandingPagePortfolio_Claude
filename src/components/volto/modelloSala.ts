// Sala di cemento (npm run prepara-sala): geometria e cemento PBR, più la luce cotta in Blender.
// Un solo download, condiviso tra scena principale e versione con movimento ridotto.
import { SRGBColorSpace, TextureLoader, type Group, type Texture } from 'three'
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js'
import { MeshoptDecoder } from 'three/examples/jsm/libs/meshopt_decoder.module.js'

export type RisorseSala = { scena: Group; luce: { sala: Texture; pavimento: Texture } }

function luce(url: string) {
  return new TextureLoader().loadAsync(url).then((t) => {
    // seconda serie di UV (quella della cottura), curva sRGB come in esportazione
    t.channel = 1
    t.flipY = false
    t.colorSpace = SRGBColorSpace
    return t
  })
}

let caricamento: Promise<RisorseSala | null> | undefined
export function caricaSala() {
  return (caricamento ??= Promise.all([
    new GLTFLoader().setMeshoptDecoder(MeshoptDecoder).loadAsync('/sala/sala.glb'),
    luce('/sala/luce-sala.webp'),
    luce('/sala/luce-pavimento.webp'),
  ])
    .then(([g, sala, pavimento]) => ({ scena: g.scene, luce: { sala, pavimento } }))
    .catch((errore: unknown) => {
      console.warn('sala non disponibile:', errore)
      return null
    }))
}
