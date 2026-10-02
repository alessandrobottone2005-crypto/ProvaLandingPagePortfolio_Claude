// contorni di outfit black per le sole lettere del nome (npm run genera-nome-3d), caricati una volta
import { FontLoader, type Font } from 'three/examples/jsm/loaders/FontLoader.js'

const FILE = '/nome/outfit-black-nome.json'
let caricamento: Promise<Font> | undefined
export function caricaFontNome() {
  return (caricamento ??= fetch(FILE)
    .then((r) => {
      if (!r.ok) throw new Error(`font del nome non disponibile (${r.status})`)
      return r.json()
    })
    .then((dati) => new FontLoader().parse(dati)))
}
