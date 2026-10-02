// avanzamento reale del caricamento, per il contatore del preloader (claude.md §6.1):
// font, codice di three e immagini che servono all’header.
import { progetti } from './progetti'

type Compito = { peso: number; avanzamento: number }

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
  if (!matchMedia('(prefers-reduced-motion: reduce)').matches) {
    aggiungi(3, () => import('@/components/volto/Volto3D'))
    aggiungi(4, async (c) => {
      const { caricaLogo } = await import('@/components/volto/modelloLogo')
      await caricaLogo((p) => (c.avanzamento = p))
    })
    // il nome in metallo: codice e contorni delle lettere
    aggiungi(1, () => Promise.all([import('@/components/nome/Nome3D'), import('@/components/nome/fontNome').then((m) => m.caricaFontNome())]))
  }
  const primo = progetti[0]
  if (primo) aggiungi(1, () => caricaImmagine(primo.copertinaCard ?? primo.copertina))

  const pesoTotale = compiti.reduce((s, c) => s + c.peso, 0)
  return {
    leggi: () => compiti.reduce((s, c) => s + c.peso * c.avanzamento, 0) / pesoTotale,
  }
}
