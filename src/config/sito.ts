// unica fonte per tutti i testi fissi del sito (claude.md §13).
// tutto in minuscolo, apostrofi tipografici (’).

export const sito = {
  nome: 'alessandro',
  cognome: 'bottone',
  titolo: 'alessandro bottone — designer',
  titoloAssente: 'zzz… torna qui',
  descrizione:
    'alessandro bottone, designer di napoli: branding, illustrazione, 3d e web design.',

  link: {
    instagram: 'https://www.instagram.com/ale.bottone.designer/',
    behance: 'https://www.behance.net/alessanbottone1',
  },
  email: 'alessandrobottone2005@gmail.com',

  // testo pubblicato così com’è: non riscrivere (claude.md §2.6)
  chiSono: [
    'sono alessandro bottone, graphic e brand designer con un percorso di 7 anni di esperienza maturata tra studio e attività sul campo. attualmente frequento il corso di design della comunicazione alla iuad per affinare ulteriormente la mia metodologia progettuale.',
    'nell’ultimo anno ho scelto di ampliare i miei orizzonti creativi esplorando attivamente l’illustrazione e nuove contaminazioni visive, integrando la precisione strategica del branding con la forza espressiva del disegno.',
    'il mio obiettivo è tradurre i valori e la visione dei clienti in sistemi d’identità solidi, maturi e dal forte impatto contemporaneo.',
  ],

  // titoli nascosti (solo screen reader) delle quattro sezioni
  sezioni: {
    header: 'alessandro bottone',
    portfolio: 'portfolio',
    chiSono: 'chi sono',
    contatti: 'contatti',
  },

  etichette: {
    chiudi: 'chiudi',
    emailCopiata: 'indirizzo email copiato',
    copiata: 'copiata',
    logo: 'logo di alessandro bottone',
    foto: 'ritratto di alessandro bottone',
    navigazione: 'navigazione principale',
    tornaInizio: 'alessandro bottone — torna all’inizio',
  },

  // etichette dei tre pulsanti dei contatti
  contatti: {
    instagram: 'instagram',
    behance: 'behance',
    email: 'email',
    copyright: (anno: number) => `© ${anno} alessandro bottone. tutti i diritti riservati.`,
  },
  portfolio: {
    info: 'info',
    esplora: 'esplora',
    animazione: 'animazione dei progetti; frecce sinistra e destra per ruotare la spirale',
  },
  // testi del pannello del progetto (etichette per screen reader e messaggi)
  pannello: {
    successivo: 'progetto successivo',
    copertina: (titolo: string) => `copertina di ${titolo}`,
    immagine: (titolo: string, n: number) => `immagine ${n} di ${titolo}`,
    paginaPrecedente: 'pagina precedente',
    paginaSuccessiva: 'pagina successiva',
    schermoIntero: 'schermo intero',
    esciSchermoIntero: 'esci dallo schermo intero',
    pdf: (titolo: string) => `documento di ${titolo}, sfogliabile`,
    pdfErrore: 'impossibile aprire il documento',
    modello: (titolo: string) => `modello 3d di ${titolo}, ruotabile`,
    ripristinaVista: 'ripristina la vista',
    riproduci: 'riproduci il video',
    pausa: 'metti in pausa',
    audioSi: 'attiva l’audio',
    audioNo: 'disattiva l’audio',
    avanzamento: 'avanzamento del video',
    video: (titolo: string) => `video di ${titolo}`,
  },
} as const
