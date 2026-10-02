import { useEffect, useState } from 'react'
import { svgStatico } from '@/components/volto/geometria'

/** volto del logo ridotto a pixel neri: al posto della mela nel menu e del sorriso all’avvio */
export function useVoltoPixel(lato: number) {
  const [url, setUrl] = useState<string>()
  useEffect(() => {
    let vivo = true
    const img = new Image()
    img.onload = () => {
      const tela = document.createElement('canvas')
      tela.width = tela.height = lato
      const ctx = tela.getContext('2d')
      if (!ctx) return
      ctx.drawImage(img, 0, 0, lato, lato)
      const d = ctx.getImageData(0, 0, lato, lato)
      // soglia: niente grigi, solo pixel neri o trasparenti
      for (let i = 0; i < d.data.length; i += 4) {
        const pieno = d.data[i + 3] > 100
        d.data[i] = d.data[i + 1] = d.data[i + 2] = 0
        d.data[i + 3] = pieno ? 255 : 0
      }
      ctx.putImageData(d, 0, 0)
      if (vivo) setUrl(tela.toDataURL())
    }
    img.src = `data:image/svg+xml;charset=utf-8,${encodeURIComponent(svgStatico({ colore: '#161614' }))}`
    return () => {
      vivo = false
    }
  }, [lato])
  return url
}
