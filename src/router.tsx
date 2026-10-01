// rotte del sito: "/" e "/progetti/:slug" (claude.md §6.5).
// la home resta sempre montata: l’indirizzo del progetto apre la sua finestra dentro il computer
// (components/computer/Finder.tsx); qui restano solo le rotte valide.
import { Navigate, Route, Routes } from 'react-router'

export function RotteModali() {
  return (
    <Routes>
      <Route path="/" element={null} />
      <Route path="/progetti/:slug" element={null} />
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  )
}
