import { useCallback, useSyncExternalStore } from 'react'

// La preferenza resta aggiornata anche quando cambia a pagina già aperta.
export function useMediaQuery(query: string) {
  const subscribe = useCallback((aggiorna: () => void) => {
    const mq = matchMedia(query)
    mq.addEventListener('change', aggiorna)
    return () => mq.removeEventListener('change', aggiorna)
  }, [query])
  const snapshot = useCallback(() => matchMedia(query).matches, [query])
  return useSyncExternalStore(subscribe, snapshot, () => false)
}
