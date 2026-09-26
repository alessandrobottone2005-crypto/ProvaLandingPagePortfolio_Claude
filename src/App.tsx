import { lazy, Suspense, useEffect } from 'react'
import { useLocation } from 'react-router'
import { Cursore } from './components/cursore/Cursore'
import { Grana } from './components/effetti/Grana'
import { useAvvio } from './components/preloader/AvvioContext'
import { Preloader } from './components/preloader/Preloader'
import { movimento } from './config/movimento'
import { ScrollTrigger } from './lib/gsap'
import { aggiornaDopoCaricamento, avviaScroll, getLenis } from './lib/scroll'
import { RotteModali } from './router'
import { ChiSono } from './sections/ChiSono/ChiSono'
import { Contatti } from './sections/Contatti/Contatti'
import { Header } from './sections/Header/Header'
import { Portfolio } from './sections/Portfolio/Portfolio'

// pagina di prova: esiste solo in sviluppo, nel sito pubblicato non viene nemmeno inclusa
const Laboratorio = import.meta.env.DEV ? lazy(() => import('./laboratorio/Laboratorio')) : null

export default function App() {
  const { pathname } = useLocation()
  const { pronto } = useAvvio()
  const laboratorio = Boolean(Laboratorio) && pathname === '/laboratorio'

  useEffect(() => {
    const ferma = avviaScroll()
    aggiornaDopoCaricamento()
    return ferma
  }, [])

  // a sito pronto: posizioni ricalcolate; con un link diretto a un progetto, la home va sul portfolio
  useEffect(() => {
    if (!pronto) return
    ScrollTrigger.refresh()
    if (pathname.startsWith('/progetti/')) {
      const portfolio = document.getElementById('portfolio')
      if (portfolio) {
        const lenis = getLenis()
        // oltre l’inizio della sezione, così l’anello è già formato
        const oltre = (movimento.portfolio.disposizione * innerHeight) / 100
        const y = portfolio.getBoundingClientRect().top + scrollY + oltre
        if (lenis) lenis.scrollTo(y, { immediate: true, force: true })
        else scrollTo(0, y)
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [pronto])

  if (laboratorio && Laboratorio)
    return (
      <>
        <Suspense fallback={null}>
          <Laboratorio />
        </Suspense>
        <Cursore />
        <Grana />
      </>
    )

  return (
    <>
      <main aria-busy={!pronto}>
        <Header />
        <Portfolio />
        <ChiSono />
        <Contatti />
      </main>
      {pronto && <RotteModali />}
      <Preloader />
      <Cursore />
      <Grana />
    </>
  )
}
