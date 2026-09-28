// tutte le durate e le lunghezze di scroll del sito, in un posto solo.
// puoi cambiare questi numeri senza toccare il resto del codice.
// durate in secondi, lunghezze in vh (100 = un’altezza dello schermo).

export const movimento = {
  // curve di animazione (claude.md §4)
  ease: {
    entrata: 'expo.out',
    transizione: 'power3.inOut',
  },

  durata: {
    micro: 0.25,
    standard: 0.7,
    grande: 1.4,
    // con movimento ridotto: solo dissolvenze brevi
    ridotta: 0.2,
  },

  // quanto l’animazione “insegue” lo scroll (più alto = più morbido)
  scrub: {
    desktop: 1,
    mobile: 0.6,
  },

  // scroll fluido: più basso = più morbido e lento
  lenis: {
    lerp: 0.1,
  },

  preloader: {
    minimo: 1.6,
    massimo: 6,
    breve: 0.8,
  },

  header: {
    pinDesktop: 400,
    pinMobile: 300,
    // percentuale dell’header in cui nome e cognome iniziano a raccogliersi nella navbar
    inizioNomeCompatto: 92,
  },

  portfolio: {
    // lunghezza di scroll per ogni progetto dell’anello
    perProgetto: 50,
    // scroll in cui le card si dispongono attorno alla prima, formando l’anello (vh)
    disposizione: 70,
    // scroll a fine anello, prima che la sezione si sblocchi (vh)
    coda: 30,
    // scroll in cui l’anello si appiattisce nelle posizioni della griglia (vh)
    versoGriglia: 200,
    // camera diagonale, elica profonda e arretramento prima di aprire la griglia
    spirale3d: {
      campoVisivo: 42,
      orbitaDa: -24,
      orbitaA: 22,
      elevazione: 10,
      profondita: 0.52,
      passo: 0.82,
      raggioRitiro: 1.3,
      passoRitiro: 0.52,
      fineRitiro: 0.3,
      fineDistensione: 0.88,
    },
    // prospettiva dell’anello in px (più basso = più profondo)
    prospettiva: 1400,
    // aggancio alla card più vicina quando lo scroll si ferma (secondi)
    aggancio: 0.6,
    // “tieni premuto”: dopo quanto parte (s) e quante card al secondo fa girare
    tieniPremutoDopo: 0.25,
    tieniPremutoVelocita: 4,
    // inclinazione massima della card frontale sotto il cursore (gradi)
    inclinazioneHover: 6,
    // inclinazione massima delle card in base alla velocità dello scroll (gradi)
    inclinazioneVelocita: 5,
  },

  chiSono: {
    pin: 150,
    versoContatti: 100,
  },

  volto: {
    battitoMin: 3,
    battitoMax: 7,
    sonnoDopo: 8,
    // spostamento massimo delle pupille, in frazione del raggio della lente
    sguardoMax: 0.2,
  },

  pannello: {
    // volo della copertina dalla card alla testata del pannello
    volo: 0.9,
    // entrata e uscita del pannello
    entrata: 0.7,
    uscita: 0.45,
    // la pagina sotto arretra e si scurisce
    scalaPagina: 0.96,
    velo: 0.7,
    // su mobile: quanti pixel trascinare in giù per chiudere il foglio
    trascinaPerChiudere: 120,
    // pdf: durata del giro di pagina, in secondi
    giroPagina: 0.8,
  },

  magnetismo: {
    pulsanti: 12,
  },
} as const

// breakpoint (claude.md §10)
export const media = {
  mobile: '(max-width: 767px)',
  tablet: '(min-width: 768px) and (max-width: 1023px)',
  desktop: '(min-width: 1024px)',
  anello: '(min-width: 768px)',
  // chi sono bloccato mentre il testo si accende: serve anche un po’ di altezza (telefono in orizzontale = no)
  chiSonoPin: '(min-width: 768px) and (min-height: 560px)',
  chiSonoBasso: '(min-width: 768px) and (max-height: 559.98px)',
  mouse: '(hover: hover) and (pointer: fine)',
  ridotto: '(prefers-reduced-motion: reduce)',
  normale: '(prefers-reduced-motion: no-preference)',
} as const

// dimensioni del volto nelle varie scene
export const volto = {
  preloader: 'max(30vmin, 12rem)',
  header: 'min(86vw, 104svh)',
} as const
