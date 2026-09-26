// stato di avvio del sito: il preloader segna “pronto” quando ha finito,
// e l’header registra dove sta il suo volto (il preloader ci vola sopra).
import { createContext, useContext, useMemo, useRef, useState, type ReactNode, type RefObject } from 'react'

type Valore = {
  pronto: boolean
  setPronto: (p: boolean) => void
  /** il contenitore del volto nell’header: la destinazione del volo */
  voltoHeader: RefObject<HTMLDivElement | null>
}

const Contesto = createContext<Valore | null>(null)

export function AvvioProvider({ children }: { children: ReactNode }) {
  const [pronto, setPronto] = useState(false)
  const voltoHeader = useRef<HTMLDivElement>(null)
  const valore = useMemo(() => ({ pronto, setPronto, voltoHeader }), [pronto])
  return <Contesto.Provider value={valore}>{children}</Contesto.Provider>
}

// eslint-disable-next-line react-refresh/only-export-components
export function useAvvio() {
  const valore = useContext(Contesto)
  if (!valore) throw new Error('useAvvio va usato dentro <AvvioProvider>')
  return valore
}
