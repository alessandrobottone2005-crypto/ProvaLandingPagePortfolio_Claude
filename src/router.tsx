// rotte del sito: "/" e "/progetti/:slug" (claude.md §6.5).
// la home resta sempre montata: l’indirizzo del progetto apre la sua finestra dentro il computer
// (components/computer/Finder.tsx); qui restano solo le rotte valide.
import { Navigate, Route, Routes, useParams } from 'react-router'
import { trovaProgetto } from './lib/progetti'

// un indirizzo di progetto inesistente torna alla home (anche prima che il computer si accenda)
function ProgettoEsistente() {
  const { slug } = useParams()
  return trovaProgetto(slug) ? null : <Navigate to="/" replace />
}

export function RotteModali() {
  return (
    <Routes>
      <Route path="/" element={null} />
      <Route path="/progetti/:slug" element={<ProgettoEsistente />} />
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  )
}
