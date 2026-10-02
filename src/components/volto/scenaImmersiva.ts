import { Matrix4, Vector3 } from 'three'

// Coordinate di scena condivise dal volto, dai fari, dal volume e dalla sala.
export const scenaImmersiva = {
  logo: new Vector3(),
  scala: 1,
  luci: [new Vector3(-4, 3.3, 1.64), new Vector3(4.18, 4.17, 0.58), new Vector3(-0.5, 1.09, -2.89)],
  // posizione della sala rispetto alla camera (scritta da Mondo.tsx a ogni fotogramma)
  mondo: new Matrix4(),
  // distanza di messa a fuoco della camera (scritta dalla profondità di campo, letta dalla polvere)
  fuoco: 8.7,
}
