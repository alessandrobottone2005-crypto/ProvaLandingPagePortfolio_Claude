import { Vector3 } from 'three'

// Coordinate di scena condivise dal volto, dai fari e dal volume.
export const scenaImmersiva = {
  logo: new Vector3(),
  scala: 1,
  luci: [new Vector3(-4, 3.3, 1.64), new Vector3(4.18, 4.17, 0.58), new Vector3(-0.5, 1.09, -2.89)],
}
