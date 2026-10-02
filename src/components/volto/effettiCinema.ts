// effetti di post-produzione scritti per la resa «cinema» (cinema.ts): colore e striscia anamorfica.
import { BlendFunction, Effect } from 'postprocessing'
import * as THREE from 'three'
import { cinema } from './cinema'

/** colore finale, dopo AgX: bianco e nero noir, tranne l’arancione della luce della fessura (colore selettivo) */
export class EffettoColore extends Effect {
  constructor() {
    const c = cinema.colore
    super(
      'ColoreCinema',
      /* glsl */ `
      uniform float saturazione;
      uniform float curva;
      uniform float neri;
      uniform float gamma;
      uniform float soglia;
      uniform float tonalita;
      uniform float ampiezza;
      vec3 hsv(vec3 c) {
        vec4 K = vec4(0., -1. / 3., 2. / 3., -1.);
        vec4 p = mix(vec4(c.bg, K.wz), vec4(c.gb, K.xy), step(c.b, c.g));
        vec4 q = mix(vec4(p.xyw, c.r), vec4(c.r, p.yzx), step(p.x, c.r));
        float d = q.x - min(q.w, q.y);
        return vec3(abs(q.z + (q.w - q.y) / (6. * d + 1e-10)), d / (q.x + 1e-10), q.x);
      }
      float noir(float l) {
        l = mix(l, l * l * (3. - 2. * l), curva);
        l = pow(max(l - soglia, 0.) / (1. - soglia), gamma);
        return neri + l * (1. - neri);
      }
      void mainImage(const in vec4 inputColor, const in vec2 uv, out vec4 outputColor) {
        vec3 c = clamp(inputColor.rgb, 0., 1.);
        float l = dot(c, vec3(.2126, .7152, .0722));
        float ln = noir(l);
        // quanto il pixel è «luce della fessura»: tonalità vicina all’arancione e abbastanza satura
        vec3 h = hsv(c);
        float distanza = abs(fract(h.x - tonalita + .5) - .5);
        // colore reale (massimo − minimo dei canali), non la saturazione relativa: i grigi scuri appena caldi restano grigi
        float croma = max(c.r, max(c.g, c.b)) - min(c.r, min(c.g, c.b));
        float tieni = (1. - smoothstep(ampiezza * .6, ampiezza, distanza)) * smoothstep(.12, .26, croma);
        vec3 grigio = mix(vec3(ln), c * (ln / max(l, 1e-4)), saturazione);
        vec3 colorato = c * (ln / max(l, 1e-4));
        outputColor = vec4(clamp(mix(grigio, colorato, tieni), 0., 1.), inputColor.a);
      }`,
      {
        blendFunction: BlendFunction.SET,
        uniforms: new Map<string, THREE.Uniform>([
          ['saturazione', new THREE.Uniform(c.saturazione)],
          ['curva', new THREE.Uniform(c.curva)],
          ['neri', new THREE.Uniform(c.neri)],
          ['gamma', new THREE.Uniform(cinema.noir.gamma)],
          ['soglia', new THREE.Uniform(cinema.noir.soglia)],
          ['tonalita', new THREE.Uniform(cinema.sole.tonalita / 360)],
          ['ampiezza', new THREE.Uniform(cinema.sole.ampiezza / 360)],
        ]),
      },
    )
  }
}

/** striscia orizzontale sulle luci forti, letta dalla texture già sfocata del bagliore (niente campioni extra della scena) */
export class EffettoStriscia extends Effect {
  constructor(bagliore: THREE.Texture) {
    super(
      'StrisciaAnamorfica',
      /* glsl */ `
      uniform sampler2D bagliore;
      uniform float intensita;
      uniform float lunghezza;
      void mainImage(const in vec4 inputColor, const in vec2 uv, out vec4 outputColor) {
        vec3 s = vec3(0.);
        float peso = 0.;
        for (int i = 1; i <= 12; i++) {
          float t = float(i) / 12.;
          float w = (1. - t) * (1. - t);
          vec2 d = vec2(t * lunghezza, 0.);
          s += (texture2D(bagliore, uv + d).rgb + texture2D(bagliore, uv - d).rgb) * w;
          peso += 2. * w;
        }
        // appena fredda, come le strisce delle lenti anamorfiche
        outputColor = vec4(inputColor.rgb + s / peso * intensita * vec3(.92, .97, 1.08), inputColor.a);
      }`,
      {
        blendFunction: BlendFunction.SET,
        uniforms: new Map<string, THREE.Uniform>([
          ['bagliore', new THREE.Uniform(bagliore)],
          ['intensita', new THREE.Uniform(cinema.striscia.intensita)],
          ['lunghezza', new THREE.Uniform(cinema.striscia.lunghezza)],
        ]),
      },
    )
  }
}
