// Stato condiviso del computer: accensione (letta da React) e aggancio dell’interfaccia allo schermo 3d.
import { useSyncExternalStore } from 'react'

export type Fase = 'spento' | 'avvio' | 'acceso'

let fase: Fase = 'spento'
let avviato = false
const ascoltatori = new Set<() => void>()

function imposta(nuova: Fase) {
  if (nuova === fase) return
  fase = nuova
  ascoltatori.forEach((a) => a())
}

/** accensione: la prima volta l’avvio completo, poi uno breve; `subito` salta l’avvio (link diretto, movimento ridotto) */
export function accendi(subito = false) {
  if (fase !== 'spento') return
  imposta(subito ? 'acceso' : 'avvio')
}
export function fineAvvio() {
  avviato = true
  if (fase === 'avvio') imposta('acceso')
}
export function spegni() {
  imposta('spento')
}
export const giaAvviato = () => avviato
export const leggiFase = () => fase

export function useFaseComputer() {
  return useSyncExternalStore(
    (a) => {
      ascoltatori.add(a)
      return () => ascoltatori.delete(a)
    },
    () => fase,
  )
}

/**
 * Aggancio allo schermo: l’interfaccia registra `aggiorna`; la scena 3d la chiama a ogni fotogramma
 * subito prima di disegnare, così DOM e WebGL si muovono insieme. Senza scena (errore, caricamento)
 * l’interfaccia si aggiorna da sola sul ticker di GSAP.
 */
export const aggancio = {
  aggiorna: null as null | (() => void),
  ultimo: 0,
}
export function dallaScena() {
  aggancio.ultimo = performance.now()
  aggancio.aggiorna?.()
}
