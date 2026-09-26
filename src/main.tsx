import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { BrowserRouter } from 'react-router'
import App from './App'
import { AvvioProvider } from './components/preloader/AvvioContext'
import { VoltoProvider } from './components/volto/VoltoContext'
import './styles/globals.css'

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <BrowserRouter>
      <VoltoProvider>
        <AvvioProvider>
          <App />
        </AvvioProvider>
      </VoltoProvider>
    </BrowserRouter>
  </StrictMode>,
)
