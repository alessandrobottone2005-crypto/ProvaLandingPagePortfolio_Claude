import { useFrame, useLoader } from '@react-three/fiber'
import { useEffect, useMemo } from 'react'
import * as THREE from 'three'
import { toCreasedNormals } from 'three/examples/jsm/utils/BufferGeometryUtils.js'
import { progetti } from '@/lib/progetti'
import { cardImmersive, fasiSpirale } from './cardImmersive'
import { percorso, leggiPosa } from './percorso'

const H = 600 / 514
const immagineW = 452 / 514, immagineH = 524 / 514
const immagineY = H / 2 - (32 + 524 / 2) / 514

function rettangolo(w: number, h: number, r: number, y = 0) {
  const s = new THREE.Shape(), x0 = -w / 2, x1 = w / 2, y0 = y - h / 2, y1 = y + h / 2
  s.moveTo(x0 + r, y0)
  s.lineTo(x1 - r, y0); s.quadraticCurveTo(x1, y0, x1, y0 + r)
  s.lineTo(x1, y1 - r); s.quadraticCurveTo(x1, y1, x1 - r, y1)
  s.lineTo(x0 + r, y1); s.quadraticCurveTo(x0, y1, x0, y1 - r)
  s.lineTo(x0, y0 + r); s.quadraticCurveTo(x0, y0, x0 + r, y0)
  return s
}

function geometrieCard() {
  const sagoma = rettangolo(1 - 0.028, H - 0.028, 60 / 514 - 0.014)
  const corpo = new THREE.ExtrudeGeometry(sagoma, {
    depth: 0.095, bevelEnabled: true, bevelSize: 0.014, bevelThickness: 0.014, bevelSegments: 3, steps: 1, curveSegments: 10,
  })
  corpo.translate(0, 0, -0.135)
  const anello = rettangolo(1 - 0.028, H - 0.028, 60 / 514 - 0.014)
  // Il foro attraversa davvero la cornice; la copertina appoggia su un piano più arretrato.
  anello.holes.push(new THREE.Path(rettangolo(immagineW + 0.028, immagineH + 0.028, 60 / 514 + 0.014, immagineY).getPoints(10)))
  const cornice = new THREE.ExtrudeGeometry(anello, {
    depth: 0.046, bevelEnabled: true, bevelSize: 0.014, bevelThickness: 0.014, bevelSegments: 3, steps: 1, curveSegments: 10,
  })
  cornice.translate(0, 0, -0.04)
  const copertina = new THREE.ShapeGeometry(rettangolo(immagineW, immagineH, 60 / 514, immagineY), 12)
  const pos = copertina.getAttribute('position'), uv = copertina.getAttribute('uv')
  for (let i = 0; i < pos.count; i++) uv.setXY(i, pos.getX(i) / immagineW + 0.5, (pos.getY(i) - immagineY) / immagineH + 0.5)
  copertina.translate(0, 0, -0.002)
  // Le coordinate grandi evitano che la tolleranza delle normali fonda smussi molto vicini.
  for (const g of [corpo, cornice]) { g.scale(100, 100, 100); toCreasedNormals(g); g.scale(0.01, 0.01, 0.01) }
  return { corpo, cornice, copertina }
}

export function CardNelloSpazio() {
  const immagini = useLoader(THREE.TextureLoader, progetti.map(p => p.copertinaCard ?? p.copertina))
  const risorse = useMemo(() => {
    const geometrie = geometrieCard()
    const corpo = new THREE.MeshStandardMaterial({ color: '#4d4b4a', metalness: 0.5, roughness: 0.48, emissive: '#4d4b4a', emissiveIntensity: 0.12, transparent: true })
    const cornice = new THREE.MeshStandardMaterial({ color: '#4d4b4a', metalness: 0.65, roughness: 0.36, emissive: '#4d4b4a', emissiveIntensity: 0.06, transparent: true })
    const schede = immagini.map(immagine => {
      // Ritaglio cover come object-fit: cover, senza disegnare luci o cornici sulla fotografia.
      const texture = immagine.clone()
      texture.colorSpace = THREE.SRGBColorSpace
      const img = immagine.image as HTMLImageElement
      const ratio = img.width / img.height, target = immagineW / immagineH
      if (ratio > target) { texture.repeat.x = target / ratio; texture.offset.x = (1 - texture.repeat.x) / 2 }
      else { texture.repeat.y = ratio / target; texture.offset.y = (1 - texture.repeat.y) / 2 }
      texture.needsUpdate = true
      const materiale = new THREE.MeshBasicMaterial({ map: texture, toneMapped: false, transparent: true })
      const corpoCard = corpo.clone(), corniceCard = cornice.clone()
      const gruppo = new THREE.Group()
      gruppo.name = 'card-progetto-solida'
      gruppo.add(new THREE.Mesh(geometrie.corpo, corpoCard), new THREE.Mesh(geometrie.cornice, corniceCard), new THREE.Mesh(geometrie.copertina, materiale))
      return { gruppo, materiale, texture, corpoCard, corniceCard }
    })
    return { geometrie, corpo, cornice, schede }
  }, [immagini])
  useEffect(() => {
    document.documentElement.dataset.cardWebgl = 'true'
    return () => {
      delete document.documentElement.dataset.cardWebgl
      document.documentElement.style.removeProperty('--card-dom-blend')
      Object.values(risorse.geometrie).forEach(g => g.dispose())
      risorse.corpo.dispose(); risorse.cornice.dispose()
      risorse.schede.forEach(s => { s.texture.dispose(); s.materiale.dispose(); s.corpoCard.dispose(); s.corniceCard.dispose() })
    }
  }, [risorse])
  useFrame(({ size }) => {
    const unita = 40 * Math.tan(THREE.MathUtils.degToRad(9)) / size.height
    const { distensione, dissolvenza } = fasiSpirale(percorso.spirale.piatta)
    document.documentElement.style.setProperty('--card-dom-blend', String(dissolvenza))
    const fase = leggiPosa().fase
    const visibile = (fase === 'spirale' || fase === 'verso-griglia') && percorso.spirale.piatta < 0.99999
    // Il DOM sfuma sopra superfici ancora opache: niente doppia dissolvenza, rumore o riflessi attraverso la fotografia.
    risorse.schede.forEach(({ gruppo, materiale, corpoCard, corniceCard }, i) => {
      const p = cardImmersive[i]
      gruppo.visible = visibile && !!p && p.opacity > 0.001
      if (!gruppo.visible || !p) return
      gruppo.position.set(p.x * unita, -p.y * unita, p.z * unita)
      gruppo.rotation.set(-THREE.MathUtils.degToRad(p.rx), THREE.MathUtils.degToRad(p.ry), -THREE.MathUtils.degToRad(p.rz), 'ZYX')
      const scala = p.larghezza * unita
      gruppo.scale.set(scala, scala, scala * THREE.MathUtils.lerp(1, 0.01, distensione))
      materiale.opacity = p.opacity
      corpoCard.opacity = corniceCard.opacity = materiale.opacity
      corpoCard.depthWrite = corniceCard.depthWrite = materiale.depthWrite = materiale.opacity > 0.999
    })
  })
  return <>{risorse.schede.map(({ gruppo }, i) => <primitive key={progetti[i].slug} object={gruppo} dispose={null} />)}</>
}
