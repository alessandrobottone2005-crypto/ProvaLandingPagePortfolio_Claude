// «scorri per esplorare» (claude.md §6.1–6.2): nel preloader si scrive insieme al volto,
// nell’header la stessa scritta, già completa, respira finché non si scorre.
import { sito } from '@/config/sito'

export function InvitoScorrere({ respira = false }: { respira?: boolean }) {
  return (
    <div
      data-invito
      aria-hidden="true"
      // su telefono il cognome sta in basso al centro: l’invito sale sopra di lui
      className="pointer-events-none absolute bottom-[calc(env(safe-area-inset-bottom)+7rem)] left-1/2 z-30 flex -translate-x-1/2 flex-col items-center gap-2 text-etichetta text-bianco md:bottom-[max(1.5rem,calc(env(safe-area-inset-bottom)+1rem))]"
    >
      <span className={`flex whitespace-pre ${respira ? 'invito-respiro' : ''}`}>
        {[...sito.etichette.invito].map((l, i) => (
          <span key={i} className="inline-block overflow-hidden">
            <span data-invito-lettera className="inline-block">
              {l}
            </span>
          </span>
        ))}
      </span>
      <svg
        data-invito-freccia
        className={respira ? 'invito-freccia' : ''}
        width="12"
        height="18"
        viewBox="0 0 12 18"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.25"
        strokeLinecap="round"
        strokeLinejoin="round"
      >
        <path d="M6 1v15M1.5 11.5 6 16l4.5-4.5" />
      </svg>
    </div>
  )
}
