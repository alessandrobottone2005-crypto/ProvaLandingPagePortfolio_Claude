// Shader dell’avatar a punti del chi sono: un fotogramma dell’atlante (scripts/prepara-avatar.mjs),
// portato nel bianco della palette, con l’accensione a scansione nel passaggio dal logo.

export const vertice = /* glsl */ `
  varying vec2 vUv;
  void main() {
    vUv = uv;
    gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
  }
`

export const frammento = /* glsl */ `
  uniform sampler2D uAtlante;
  uniform vec2 uGriglia;     // colonne, righe
  uniform float uFotogramma; // indice intero: cella + canale
  uniform float uSpecchio;   // 1 = testa girata verso destra (stessi fotogrammi ribaltati)
  uniform vec3 uColore;
  uniform float uComparsa;   // 0 spento → 1 acceso
  uniform float uTempo;
  varying vec2 vUv;

  float casuale(float n) { return fract(sin(n * 91.3458) * 47453.5453); }

  void main() {
    vec2 uv = vUv;
    // durante il passaggio, una sola fascia sottile che scorre spostata di lato
    float passaggio = step(0.2, uComparsa) * step(uComparsa, 0.8);
    float fascia = step(abs(uv.y - fract(uTempo * 0.9)), 0.03) * passaggio;
    uv.x += fascia * (casuale(floor(uTempo * 12.0)) - 0.5) * 0.08;
    if (uSpecchio > 0.5) uv.x = 1.0 - uv.x;

    float celle = uGriglia.x * uGriglia.y;
    float canale = floor(uFotogramma / celle);
    float posto = mod(uFotogramma, celle);
    vec2 cella = vec2(mod(posto, uGriglia.x), floor(posto / uGriglia.x));
    // nell’atlante la riga 0 è in alto, nelle uv di three lo 0 è in basso
    vec2 coord = (cella + vec2(clamp(uv.x, 0.001, 0.999), 1.0 - clamp(uv.y, 0.001, 0.999))) / uGriglia;
    coord.y = 1.0 - coord.y;
    vec3 texel = texture2D(uAtlante, coord).rgb;
    float luce = canale < 0.5 ? texel.r : canale < 1.5 ? texel.g : texel.b;

    // scansione dall’alto verso il basso, con una riga luminosa sul bordo
    float soglia = 1.0 - uComparsa * 1.08;
    float acceso = smoothstep(soglia - 0.01, soglia + 0.01, uv.y);
    float bordo = smoothstep(0.025, 0.0, abs(vUv.y - soglia)) * step(0.001, uComparsa) * step(uComparsa, 0.999);

    // sfuma in basso e ai lati; i punti chiari superano appena la soglia del bagliore
    float sfuma = smoothstep(0.0, 0.18, vUv.y) * smoothstep(0.0, 0.06, vUv.x) * smoothstep(1.0, 0.94, vUv.x);
    vec3 colore = uColore * (pow(luce, 0.85) * 1.7 * acceso + bordo * 0.8) * sfuma;
    // niente valori fuori scala: un NaN si spargerebbe in tutto il bagliore
    gl_FragColor = vec4(clamp(colore, 0.0, 3.0), 1.0);
    #include <tonemapping_fragment>
    #include <colorspace_fragment>
  }
`
