// Numeri della luce della sala condivisi da Sala.tsx e dal volume (NebbiaVolumetrica.tsx).
import * as THREE from 'three'
import { daBlender } from '@/components/computer/inquadratura'
import dati from './stazioniSala.json'

// la luce cotta vale già come irradianza: Three.js la divide per π nel diffuso
export const INTENSITA_LUCE = dati.fattoreLuce * Math.PI
// Blender: sole ruotato (x = SOLE_Y, y = −SOLE_X) in ordine XYZ, che in Three.js è «ZYX»
const [SOLE_X, SOLE_Y] = dati.sole
export const DIREZIONE_SOLE = daBlender(
  new THREE.Vector3(0, 0, -1)
    .applyEuler(new THREE.Euler(THREE.MathUtils.degToRad(SOLE_Y), THREE.MathUtils.degToRad(-SOLE_X), 0, 'ZYX'))
    .toArray(),
).normalize()
