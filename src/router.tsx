// rotte del sito: "/" e "/progetti/:slug" come rotta modale (claude.md §6.5).
// la home resta sempre montata sotto il pannello, così chiudendo si torna esattamente dove si era.
import { lazy, Suspense } from 'react'
import { Navigate, Route, Routes } from 'react-router'

// il pannello e i suoi blocchi si scaricano solo quando si apre un progetto
const Pannello = lazy(() => import('./pannello/Pannello'))

export function RotteModali() {
  return (
    <Routes>
      <Route path="/" element={null} />
      <Route
        path="/progetti/:slug"
        element={
          <Suspense fallback={null}>
            <Pannello />
          </Suspense>
        }
      />
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  )
}
