// Post-produzione della scena: occlusione ambientale, volume (nebbia e polvere nel fascio), bagliore, vignetta, AgX.
// È anche il render finale del Canvas della home: un solo passaggio sulla scena, niente doppio disegno.
import { Bloom, EffectComposer, N8AO, ToneMapping, Vignette } from '@react-three/postprocessing'
import { ToneMappingMode } from 'postprocessing'
import { useThree } from '@react-three/fiber'
import { useLayoutEffect } from 'react'
import { HalfFloatType, NoToneMapping, type ToneMapping as TipoToneMapping } from 'three'
import { NebbiaVolumetrica } from './NebbiaVolumetrica'

// ?effetti=0 mostra la scena senza post-produzione, per il confronto.
const effettiAttivi = new URLSearchParams(location.search).get('effetti') !== '0'
// ?senza=ao,nebbia,bagliore,vignetta esclude i singoli effetti (prove in sviluppo)
const parametri = new URLSearchParams(location.search)
const senza = new Set((parametri.get('senza') ?? '').split(','))
// pulviscolo nel fascio della fessura; ?polvere=0.02 per provarne altri valori
const POLVERE = Number(parametri.get('polvere') ?? 0.008)

/** `sala`: c’è la sala (polvere nel fascio); `fermo`: movimento ridotto, nessuna animazione del volume */
export function Rifinitura({ sala, fermo = false }: { sala: boolean; fermo?: boolean }) {
  return effettiAttivi ? <Catena sala={sala} fermo={fermo} /> : null
}

function Catena({ sala, fermo }: { sala: boolean; fermo: boolean }) {
  // AgX lo applica l’ultimo effetto: il renderer non deve applicarlo una seconda volta
  const gl = useThree((s) => s.gl)
  useLayoutEffect(() => {
    const prima: TipoToneMapping = gl.toneMapping
    // renderer di Three.js: oggetto mutabile per natura, non stato React
    // eslint-disable-next-line react/immutability
    gl.toneMapping = NoToneMapping
    return () => {
      gl.toneMapping = prima
    }
  }, [gl])
  return (
    <EffectComposer multisampling={4} frameBufferType={HalfFloatType}>
      <>{!senza.has('ao') && <N8AO halfRes aoRadius={1.6} distanceFalloff={0.6} intensity={2.2} quality="medium" />}</>
      <>{!senza.has('nebbia') && <NebbiaVolumetrica polvere={sala ? POLVERE : 0} fermo={fermo} />}</>
      <>{!senza.has('bagliore') && <Bloom mipmapBlur luminanceThreshold={0.95} luminanceSmoothing={0.2} intensity={0.35} />}</>
      <>{!senza.has('vignetta') && <Vignette offset={0.28} darkness={0.55} />}</>
      <ToneMapping mode={ToneMappingMode.AGX} />
    </EffectComposer>
  )
}
