// Volume integrato lungo il raggio, arrestato dalla profondità reale della scena (effetto di post-produzione).
// Due componenti: la nebbia leggera attorno al volto (fari) e la polvere nel fascio di sole della fessura.
// Nessuna sovrapposizione sulla tipografia HTML o sull’interfaccia del computer.
import { useFrame } from '@react-three/fiber'
import { BlendFunction, Effect, EffectAttribute } from 'postprocessing'
import { forwardRef, useEffect, useMemo } from 'react'
import * as THREE from 'three'
import dati from './stazioniSala.json'
import { DIREZIONE_SOLE } from './luceSala'
import { scenaImmersiva } from './scenaImmersiva'

const fragmentShader = /* glsl */ `
uniform mat4 inversaProiezione;
uniform mat4 matriceCamera;
uniform mat4 versoSala;
uniform vec3 occhio;
uniform vec3 fari[3];
uniform vec3 centro;
uniform vec3 sole;
uniform vec3 salaMin;
uniform vec3 salaMax;
uniform float soffitto;
uniform float fessura;
uniform float polvere;
uniform float tempoNebbia;

float hash(vec3 p) { p=fract(p*.3183099+vec3(.1,.2,.3)); p*=17.; return fract(p.x*p.y*p.z*(p.x+p.y+p.z)); }
float rumore(vec3 p) {
 vec3 i=floor(p), f=fract(p); f=f*f*(3.-2.*f);
 return mix(mix(mix(hash(i),hash(i+vec3(1,0,0)),f.x),mix(hash(i+vec3(0,1,0)),hash(i+vec3(1,1,0)),f.x),f.y),
 mix(mix(hash(i+vec3(0,0,1)),hash(i+vec3(1,0,1)),f.x),mix(hash(i+vec3(0,1,1)),hash(i+vec3(1,1,1)),f.x),f.y),f.z);
}
// 1 dentro il fascio che scende dalla fessura del soffitto, 0 fuori (bordi morbidi)
float fascio(vec3 q) {
 if (q.y < 0. || q.y > soffitto || q.x < salaMin.x || q.x > salaMax.x || q.z < salaMin.z || q.z > salaMax.z) return 0.;
 vec3 alto = q - sole * ((soffitto - q.y) / -sole.y);
 float dentro = 1. - smoothstep(fessura * .82, fessura * 1.02, abs(alto.x));
 return dentro * step(salaMin.z, alto.z) * step(alto.z, salaMax.z);
}
void mainImage(const in vec4 inputColor, const in vec2 uv, const in float depth, out vec4 outputColor) {
 vec4 v=inversaProiezione*vec4(uv*2.-1.,depth*2.-1.,1.);
 v/=v.w;
 vec3 fine=(matriceCamera*v).xyz;
 vec3 raggio=normalize(fine-occhio);
 float distanza=min(length(fine-occhio),70.);
 float passo=distanza/32.;
 // partenza sfalsata per pixel: niente bande, resta una grana fine
 float scarto=hash(vec3(uv*911.,tempoNebbia));
 vec3 soleMondo=normalize(inverse(mat3(versoSala))*sole);
 float fase=.55+.9*pow(max(dot(raggio,-soleMondo),0.),6.);
 float trasmissione=1.; vec3 luce=vec3(0.);
 for(int i=0;i<32;i++) {
  vec3 p=occhio+raggio*((float(i)+scarto)*passo);
  // alone leggero solo attorno al volto: la camera, più vicina, non deve attraversare un muro di nebbia
  float confine=1.-smoothstep(3.,8.,length(p-centro));
  float n=rumore(p*.48+vec3(tempoNebbia*.022,tempoNebbia*.014,-tempoNebbia*.011));
  float vicino=exp(-length(p-centro)*.32);
  vec3 q=(versoSala*vec4(p,1.)).xyz;
  float f=fascio(q);
  float granelli=rumore(q*1.7+vec3(0.,-tempoNebbia*.05,tempoNebbia*.03));
  float densita=.006*confine*(.65+n*.6+vicino*.3)+polvere*f*(.35+granelli*.9);
  float estinzione=exp(-densita*passo);
  vec3 illuminazione=vec3(.00048);
  for(int j=0;j<3;j++) {
   vec3 verso=p-fari[j];
   float dis=dot(verso,verso);
   float direzione=smoothstep(-.18,.68,dot(normalize(verso),normalize(centro-fari[j])));
   float potenza=j==2? .45:1.;
   illuminazione+=vec3(potenza*direzione/(1.+dis*.17))*confine*.12;
  }
  illuminazione+=vec3(1.,.97,.93)*5.5*f*fase/12.566;
  luce+=trasmissione*(1.-estinzione)*illuminazione;
  trasmissione*=estinzione;
 }
 vec3 fondo=vec3(.0015);
 // Le copertine conservano colore ed esposizione; il volume crea profondità senza desaturarle.
 vec3 scena=mix(fondo,inputColor.rgb,inputColor.a);
 outputColor=vec4(scena*trasmissione+luce,1.);
}
`

class EffettoNebbia extends Effect {
  constructor() {
    const [min, max] = [dati.sala.min, dati.sala.max]
    super('NebbiaVolumetrica', fragmentShader, {
      attributes: EffectAttribute.DEPTH,
      blendFunction: BlendFunction.SET,
      uniforms: new Map<string, THREE.Uniform>([
        ['inversaProiezione', new THREE.Uniform(new THREE.Matrix4())],
        ['matriceCamera', new THREE.Uniform(new THREE.Matrix4())],
        ['versoSala', new THREE.Uniform(new THREE.Matrix4())],
        ['occhio', new THREE.Uniform(new THREE.Vector3())],
        ['fari', new THREE.Uniform(scenaImmersiva.luci)],
        ['centro', new THREE.Uniform(scenaImmersiva.logo)],
        ['sole', new THREE.Uniform(DIREZIONE_SOLE.clone())],
        // Blender (x, y, z) → sito (x, z, −y): la profondità della sala diventa −y
        ['salaMin', new THREE.Uniform(new THREE.Vector3(min[0], min[2], -max[1]))],
        ['salaMax', new THREE.Uniform(new THREE.Vector3(max[0], max[2], -min[1]))],
        ['soffitto', new THREE.Uniform(dati.soffitto)],
        ['fessura', new THREE.Uniform(dati.fessura)],
        ['polvere', new THREE.Uniform(0)],
        ['tempoNebbia', new THREE.Uniform(0)],
      ]),
    })
  }
}

/** `polvere`: densità del pulviscolo nel fascio (0 senza sala); `fermo`: niente movimento (movimento ridotto) */
export const NebbiaVolumetrica = forwardRef<EffettoNebbia, { polvere: number; fermo?: boolean }>(function NebbiaVolumetrica(
  { polvere, fermo = false },
  ref,
) {
  const effetto = useMemo(() => new EffettoNebbia(), [])
  useEffect(() => () => effetto.dispose(), [effetto])
  useFrame(({ camera, clock }) => {
    const u = effetto.uniforms
    u.get('inversaProiezione')!.value.copy(camera.projectionMatrixInverse)
    u.get('matriceCamera')!.value.copy(camera.matrixWorld)
    u.get('occhio')!.value.copy(camera.position)
    u.get('versoSala')!.value.copy(scenaImmersiva.mondo).invert()
    u.get('polvere')!.value = polvere
    u.get('tempoNebbia')!.value = fermo ? 0 : clock.elapsedTime
  })
  return <primitive ref={ref} object={effetto} dispose={null} />
})
