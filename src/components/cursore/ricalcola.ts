// Segnale per il cursore: ciò che sta sotto il mouse è cambiato senza scroll né movimento
// (per esempio lo schermo del computer che compare o diventa interattivo dopo lo scrub).
export const EVENTO_RICALCOLA = 'cursore:ricalcola'

export function ricalcolaCursore() {
  dispatchEvent(new Event(EVENTO_RICALCOLA))
}
