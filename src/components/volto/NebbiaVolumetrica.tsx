// Volume integrato lungo il raggio, arrestato dalla profondità reale della scena (post-produzione).
// Due componenti: la nebbia leggera attorno al volto (fari) e la polvere nel fascio di sole della fessura.
// Il raymarch gira in un passaggio a risoluzione ridotta (qualita.ts: metà, poi meno); un effetto a piena
// risoluzione ricompone scena · trasmissione + luce. Nessuna sovrapposizione sulla tipografia HTML o sul computer.
import { useFrame, useThree } from '@react-three/fiber'
import { BlendFunction, Effect, Pass } from 'postprocessing'
import { forwardRef, useEffect, useMemo } from 'react'
import * as THREE from 'three'
import dati from './stazioniSala.json'
import { DIREZIONE_SOLE } from './luceSala'
import { qualita } from './qualita'
import { cinema } from './cinema'
import { scenaImmersiva } from './scenaImmersiva'

const PASSI_MAX = 32

const raymarch = /* glsl */ `
uniform sampler2D profondita;
uniform mat4 inversaProiezione;
uniform mat4 matriceCamera;
uniform mat4 versoSala;
uniform vec3 occhio;
uniform vec3 fari[3];
uniform vec3 centro;
uniform vec3 soleMondo;
uniform vec3 sole;
uniform vec3 salaMin;
uniform vec3 salaMax;
uniform float soffitto;
uniform float fessura;
uniform float polvere;
uniform float tempoNebbia;
uniform float passi;
uniform float nettezza;
uniform vec3 coloreSole;
varying vec2 vUv;

float hash(vec3 p) { p=fract(p*.3183099+vec3(.1,.2,.3)); p*=17.; return fract(p.x*p.y*p.z*(p.x+p.y+p.z)); }
float rumore(vec3 p) {
 vec3 i=floor(p), f=fract(p); f=f*f*(3.-2.*f);
 return mix(mix(mix(hash(i),hash(i+vec3(1,0,0)),f.x),mix(hash(i+vec3(0,1,0)),hash(i+vec3(1,1,0)),f.x),f.y),
 mix(mix(hash(i+vec3(0,0,1)),hash(i+vec3(1,0,1)),f.x),mix(hash(i+vec3(0,1,1)),hash(i+vec3(1,1,1)),f.x),f.y),f.z);
}
// 1 dentro il fascio che scende dalla fessura del soffitto, 0 fuori (bordi più o meno netti)
float fascio(vec3 q) {
 if (q.y < 0. || q.y > soffitto || q.x < salaMin.x || q.x > salaMax.x || q.z < salaMin.z || q.z > salaMax.z) return 0.;
 vec3 alto = q - sole * ((soffitto - q.y) / -sole.y);
 float dentro = 1. - smoothstep(fessura * mix(.82, .94, nettezza), fessura * 1.02, abs(alto.x));
 return dentro * step(salaMin.z, alto.z) * step(alto.z, salaMax.z);
}
// rumore a gradiente intercalato: sfalsamento quasi blu, niente bande con pochi passi
float ign(vec2 p) { return fract(52.9829189 * fract(dot(p, vec2(.06711056, .00583715)))); }
void main() {
 float depth = texture2D(profondita, vUv).r;
 vec4 v=inversaProiezione*vec4(vUv*2.-1.,depth*2.-1.,1.);
 v/=v.w;
 vec3 fine=(matriceCamera*v).xyz;
 vec3 raggio=normalize(fine-occhio);
 float distanza=min(length(fine-occhio),70.);
 float passo=distanza/passi;
 float scarto=fract(ign(gl_FragCoord.xy) + tempoNebbia * 7.31);
 float fase=.55+.9*pow(max(dot(raggio,-soleMondo),0.),6.);
 float trasmissione=1.; vec3 luce=vec3(0.);
 for(int i=0;i<${PASSI_MAX};i++) {
  if (float(i) >= passi) break;
  vec3 p=occhio+raggio*((float(i)+scarto)*passo);
  // alone leggero solo attorno al volto: la camera, più vicina, non deve attraversare un muro di nebbia
  float confine=1.-smoothstep(3.,8.,length(p-centro));
  float n=smoothstep(.35,.85,rumore(p*2.4+vec3(tempoNebbia*.05,tempoNebbia*.03,-tempoNebbia*.02)));
  float vicino=exp(-length(p-centro)*.32);
  vec3 q=(versoSala*vec4(p,1.)).xyz;
  float f=fascio(q);
  float granelli=smoothstep(.45,.95,rumore(q*7.+vec3(0.,-tempoNebbia*.12,tempoNebbia*.07)));
  float densita=.0035*confine*(.4+n*1.2+vicino*.3)+polvere*f*(.25+granelli*1.6);
  float estinzione=exp(-densita*passo);
  vec3 illuminazione=vec3(.00048);
  if (confine > 0.) {
   for(int j=0;j<3;j++) {
    vec3 verso=p-fari[j];
    float dis=dot(verso,verso);
    float direzione=smoothstep(-.18,.68,dot(normalize(verso),normalize(centro-fari[j])));
    float potenza=j==2? .45:1.;
    illuminazione+=vec3(potenza*direzione/(1.+dis*.17))*confine*.12;
   }
  }
  // il velo nel fascio resta neutro (la camera spesso è dentro il fascio): l’arancione sta su superfici e polvere
  illuminazione+=mix(vec3(1.,.97,.93),coloreSole,.18)*5.5*f*fase/12.566;
  luce+=trasmissione*(1.-estinzione)*illuminazione;
  trasmissione*=estinzione;
 }
 gl_FragColor=vec4(luce,trasmissione);
}
`

/** passaggio a risoluzione ridotta: scrive luce (rgb) e trasmissione (a) del volume */
class PassaggioNebbia extends Pass {
  bersaglio: THREE.WebGLRenderTarget
  materiale: THREE.ShaderMaterial
  private misura = { w: 1, h: 1 }
  constructor() {
    super('PassaggioNebbia')
    this.needsSwap = false
    this.needsDepthTexture = true
    this.bersaglio = new THREE.WebGLRenderTarget(1, 1, { type: THREE.HalfFloatType, depthBuffer: false })
    this.bersaglio.texture.minFilter = this.bersaglio.texture.magFilter = THREE.LinearFilter
    const [min, max] = [dati.sala.min, dati.sala.max]
    this.materiale = new THREE.ShaderMaterial({
      vertexShader: 'varying vec2 vUv; void main(){ vUv = position.xy * .5 + .5; gl_Position = vec4(position.xy, 1., 1.); }',
      fragmentShader: raymarch,
      depthTest: false,
      depthWrite: false,
      uniforms: {
        profondita: { value: null },
        inversaProiezione: { value: new THREE.Matrix4() },
        matriceCamera: { value: new THREE.Matrix4() },
        versoSala: { value: new THREE.Matrix4() },
        occhio: { value: new THREE.Vector3() },
        fari: { value: scenaImmersiva.luci },
        centro: { value: scenaImmersiva.logo },
        soleMondo: { value: new THREE.Vector3() },
        sole: { value: DIREZIONE_SOLE.clone() },
        // Blender (x, y, z) → sito (x, z, −y): la profondità della sala diventa −y
        salaMin: { value: new THREE.Vector3(min[0], min[2], -max[1]) },
        salaMax: { value: new THREE.Vector3(max[0], max[2], -min[1]) },
        soffitto: { value: dati.soffitto },
        fessura: { value: dati.fessura },
        polvere: { value: 0 },
        tempoNebbia: { value: 0 },
        passi: { value: PASSI_MAX },
        nettezza: { value: 0 },
        // luce della fessura arancione (cinema.ts), a luminanza invariata
        coloreSole: { value: (() => { const c = new THREE.Color(cinema.sole.colore); const l = 0.2126 * c.r + 0.7152 * c.g + 0.0722 * c.b; return new THREE.Vector3(c.r / l, c.g / l, c.b / l) })() },
      },
    })
    this.fullscreenMaterial = this.materiale
  }
  override setDepthTexture(texture: THREE.Texture) {
    this.materiale.uniforms.profondita.value = texture
  }
  override setSize(width: number, height: number) {
    this.misura = { w: width, h: height }
    this.ridimensiona()
  }
  ridimensiona() {
    const s = qualita.valori.nebbia
    this.bersaglio.setSize(Math.max(1, Math.round(this.misura.w * s)), Math.max(1, Math.round(this.misura.h * s)))
    this.materiale.uniforms.passi.value = qualita.valori.passi
  }
  override render(renderer: THREE.WebGLRenderer) {
    renderer.setRenderTarget(this.bersaglio)
    renderer.render(this.scene, this.camera)
  }
  override dispose() {
    super.dispose()
    this.bersaglio.dispose()
    this.materiale.dispose()
  }
}

/** ricomposizione a piena risoluzione: scena · trasmissione + luce del volume */
class EffettoComposizione extends Effect {
  constructor(volume: THREE.Texture) {
    super(
      'ComposizioneNebbia',
      /* glsl */ `
      uniform sampler2D volume;
      void mainImage(const in vec4 inputColor, const in vec2 uv, out vec4 outputColor) {
        vec4 n = texture2D(volume, uv);
        // Le copertine conservano colore ed esposizione; il volume crea profondità senza desaturarle.
        vec3 scena = mix(vec3(.0015), inputColor.rgb, inputColor.a);
        outputColor = vec4(scena * n.a + n.rgb, 1.);
      }`,
      { blendFunction: BlendFunction.SET, uniforms: new Map([['volume', new THREE.Uniform(volume)]]) },
    )
  }
}

/** nel composer: <NebbiaPassaggio/> prima degli effetti, poi <NebbiaComposizione/> */
// eslint-disable-next-line react-refresh/only-export-components
export function useNebbia(polvere: number, fermo: boolean, nettezza: number) {
  const passaggio = useMemo(() => new PassaggioNebbia(), [])
  const composizione = useMemo(() => new EffettoComposizione(passaggio.bersaglio.texture), [passaggio])
  const invalidate = useThree((s) => s.invalidate)
  useEffect(
    () =>
      qualita.ascolta(() => {
        passaggio.ridimensiona()
        invalidate()
      }),
    [passaggio, invalidate],
  )
  useEffect(
    () => () => {
      passaggio.dispose()
      composizione.dispose()
    },
    [passaggio, composizione],
  )
  useFrame(({ camera, clock }) => {
    const u = passaggio.materiale.uniforms
    u.inversaProiezione.value.copy(camera.projectionMatrixInverse)
    u.matriceCamera.value.copy(camera.matrixWorld)
    u.occhio.value.copy(camera.position)
    u.versoSala.value.copy(scenaImmersiva.mondo).invert()
    // direzione del sole nel mondo della camera: costante per fotogramma, non per pixel
    u.soleMondo.value.copy(DIREZIONE_SOLE).transformDirection(scenaImmersiva.mondo)
    // eslint-disable-next-line react/immutability -- uniform di Three.js, aggiornati fuori dal render React
    u.polvere.value = polvere
    u.nettezza.value = nettezza
    u.tempoNebbia.value = fermo ? 0 : clock.elapsedTime
  })
  return { passaggio, composizione }
}

export const NebbiaPassaggio = forwardRef<PassaggioNebbia, { oggetto: PassaggioNebbia }>(function NebbiaPassaggio({ oggetto }, ref) {
  return <primitive ref={ref} object={oggetto} dispose={null} />
})
export const NebbiaComposizione = forwardRef<EffettoComposizione, { oggetto: EffettoComposizione }>(function NebbiaComposizione({ oggetto }, ref) {
  return <primitive ref={ref} object={oggetto} dispose={null} />
})
