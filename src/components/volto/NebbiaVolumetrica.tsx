import { useFrame, useThree } from '@react-three/fiber'
import { useEffect, useMemo } from 'react'
import * as THREE from 'three'
import { FullScreenQuad } from 'three/examples/jsm/postprocessing/Pass.js'
import { scenaImmersiva } from './scenaImmersiva'

// Integrazione del volume lungo il raggio, arrestata dalla profondità reale di logo e card.
// Nessuna sovrapposizione sulla tipografia HTML o sui pannelli dei progetti.
const fragmentShader = /* glsl */`
uniform sampler2D colore;
uniform sampler2D profondita;
uniform mat4 inversaProiezione;
uniform mat4 matriceCamera;
uniform vec3 occhio;
uniform vec3 fari[3];
uniform vec3 centro;
uniform float tempo;

varying vec2 vUv;
float hash(vec3 p) { p=fract(p*.3183099+vec3(.1,.2,.3)); p*=17.; return fract(p.x*p.y*p.z*(p.x+p.y+p.z)); }
float rumore(vec3 p) {
 vec3 i=floor(p), f=fract(p); f=f*f*(3.-2.*f);
 return mix(mix(mix(hash(i),hash(i+vec3(1,0,0)),f.x),mix(hash(i+vec3(0,1,0)),hash(i+vec3(1,1,0)),f.x),f.y),
 mix(mix(hash(i+vec3(0,0,1)),hash(i+vec3(1,0,1)),f.x),mix(hash(i+vec3(0,1,1)),hash(i+vec3(1,1,1)),f.x),f.y),f.z);
}
void main() {
 vec4 base=texture2D(colore,vUv);
 float depth=texture2D(profondita,vUv).x;
 vec4 v=inversaProiezione*vec4(vUv*2.-1.,depth*2.-1.,1.);
 v/=v.w;
 vec3 fine=(matriceCamera*v).xyz;
 vec3 raggio=normalize(fine-occhio);
 float distanza=min(length(fine-occhio),38.);
 float passo=distanza/32.;
 float trasmissione=1.; vec3 luce=vec3(0.);
 for(int i=0;i<32;i++) {
  vec3 p=occhio+raggio*((float(i)+.5)*passo);
  float confine=1.-smoothstep(8.,12.,max(max(abs(p.x),abs(p.y)),abs(p.z)));
  float n=rumore(p*.48+vec3(tempo*.022,tempo*.014,-tempo*.011));
  float vicino=exp(-length(p-centro)*.32);
  float densita=.01*confine*(.65+n*.6+vicino*.3);
  float estinzione=exp(-densita*passo);
  vec3 illuminazione=vec3(.004);
  for(int j=0;j<3;j++) {
   vec3 verso=p-fari[j];
   float dis=dot(verso,verso);
   float direzione=smoothstep(-.18,.68,dot(normalize(verso),normalize(centro-fari[j])));
   float potenza=j==2? .45:1.;
   illuminazione+=vec3(potenza*direzione/(1.+dis*.17));
  }
  luce+=trasmissione*(1.-estinzione)*illuminazione*.12;
  trasmissione*=estinzione;
 }
 vec3 fondo=vec3(.0015);
 // Le copertine conservano colore ed esposizione; la nebbia crea profondità senza desaturarle.
 vec3 scena=mix(fondo,base.rgb,base.a);
 gl_FragColor=vec4(scena*trasmissione+luce,1.);
 #include <tonemapping_fragment>
 #include <colorspace_fragment>
}
`
export function NebbiaVolumetrica() {
 const { size, viewport } = useThree()
 const risorse = useMemo(() => {
  const target = new THREE.WebGLRenderTarget(1,1, { type: THREE.HalfFloatType, depthBuffer: true, samples: 4 })
  target.depthTexture = new THREE.DepthTexture(1,1,THREE.UnsignedIntType)
  const materiale = new THREE.ShaderMaterial({
   uniforms: { colore:{value:target.texture}, profondita:{value:target.depthTexture},
    inversaProiezione:{value:new THREE.Matrix4()}, matriceCamera:{value:new THREE.Matrix4()},
    occhio:{value:new THREE.Vector3()}, fari:{value:scenaImmersiva.luci}, centro:{value:scenaImmersiva.logo}, tempo:{value:0} },
   vertexShader:'varying vec2 vUv; void main(){vUv=uv;gl_Position=vec4(position.xy,0.,1.);}', fragmentShader,
   depthTest:false, depthWrite:false,
  })
  return {target,materiale,quad:new FullScreenQuad(materiale)}
 }, [])
 useEffect(() => {
  const dpr=viewport.dpr
  risorse.target.setSize(Math.round(size.width*dpr),Math.round(size.height*dpr))
 },[size.width,size.height,viewport.dpr,risorse])
 useEffect(() => () => {risorse.target.dispose();risorse.materiale.dispose();risorse.quad.dispose()},[risorse])
 useFrame(({gl,scene,camera,clock}) => {
  const u=risorse.materiale.uniforms
  u.inversaProiezione.value.copy(camera.projectionMatrixInverse)
  u.matriceCamera.value.copy(camera.matrixWorld)
  u.occhio.value.copy(camera.position)
  // I uniform sono risorse mutabili di Three.js, aggiornate fuori dal render React.
  // eslint-disable-next-line react/immutability
  u.tempo.value=clock.elapsedTime
  gl.setRenderTarget(risorse.target)
  gl.render(scene,camera)
  gl.setRenderTarget(null)
  risorse.quad.render(gl)
 },1)
 return null
}
