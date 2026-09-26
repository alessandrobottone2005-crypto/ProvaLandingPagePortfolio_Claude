// posizione dei tratti del volto disegnati sopra la foto del chi sono.
// valori in percentuale del riquadro 4:5 della foto (0–100), misurati su foto-mia-mezzobusto.jpg.

export const foto = {
  // metti false per disattivare l’effetto “firma”
  firma: true,
  // punto a metà tra le due lenti: mettilo tra i tuoi occhi (x da sinistra, y dall’alto)
  x: 50,
  y: 22.1,
  // larghezza del volto disegnato, in percentuale della larghezza della foto
  scala: 21,
  // colore dei tratti: 'bianco', 'grigio' o 'nero'
  colore: 'bianco' as 'nero' | 'grigio' | 'bianco',
  // quanto resta visibile prima di cancellarsi, in secondi
  pausa: 0.8,
} as const
