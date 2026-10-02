// preriscaldamento della scena: quando sala, computer e avatar sono scaricati, mentre il Canvas è ancora
// invisibile (header 2d), si compilano tutti gli shader, si caricano le texture sulla gpu e si disegnano
// alcuni fotogrammi completi. così il primo fotogramma visibile del 3d (e del chi sono) non scatta.
export const riscaldamento = {
  /** true per i pochi fotogrammi del preriscaldamento: volto e avatar si disegnano anche se nascosti */
  attivo: false,
  fatto: false,
  pronti: new Set<string>(),
}
export const PARTI_DA_RISCALDARE = ['sala', 'computer', 'avatar'] as const
