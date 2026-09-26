// avanzamento reale del caricamento, per il contatore del preloader (claude.md §6.1):
// font, codice di three, modello 3d e immagini che servono all’header.
import { progetti } from './progetti'

type Compito = { peso: number; avanzamento: number }

async function scaricaConAvanzamento(url: string, compito: Compito) {
  const risposta = await fetch(url, { cache: 'force-cache' })
  const totale = Number(risposta.headers.get('content-length')) || 0
  if (!risposta.body || !totale) {
    await risposta.arrayBuffer()
    return
  }
  const lettore = risposta.body.getReader()
  let ricevuti = 0
  for (;;) {
    const { done, value } = await lettore.read()
    if (done) break
    ricevuti += value.length
    compito.avanzamento = Math.min(0.99, ricevuti / totale)
  }
}

function caricaImmagine(src: string) {
  return new Promise<void>((fine) => {
    const img = new Image()
    img.onload = img.onerror = () => fine()
    img.src = src
  })
}

/** avvia il caricamento; `leggi()` restituisce l’avanzamento reale da 0 a 1 */
export function avviaCaricamento() {
  const compiti: Compito[] = []
  const aggiungi = (peso: number, lavoro: (c: Compito) => Promise<unknown>) => {
    const c: Compito = { peso, avanzamento: 0 }
    compiti.push(c)
    lavoro(c)
      .catch(() => {}) // se qualcosa fallisce il sito parte comunque
      .finally(() => (c.avanzamento = 1))
  }

  aggiungi(1, () => document.fonts.ready)
  // il codice di three.js (il pezzo più pesante)
  aggiungi(3, () => import('@/components/volto/Volto3D'))
  aggiungi(3, async (c) => {
    const { URL_MODELLO, precaricaModello } = await import('@/components/volto/Volto3D')
    await scaricaConAvanzamento(URL_MODELLO, c)
    precaricaModello()
  })
  const primo = progetti[0]
  if (primo) aggiungi(1, () => caricaImmagine(primo.copertinaCard ?? primo.copertina))

  const pesoTotale = compiti.reduce((s, c) => s + c.peso, 0)
  return {
    leggi: () => compiti.reduce((s, c) => s + c.peso * c.avanzamento, 0) / pesoTotale,
  }
}
