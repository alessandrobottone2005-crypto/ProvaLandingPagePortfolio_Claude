// portfolio con movimento ridotto (claude.md §12): l’anello diventa una griglia a due colonne,
// senza pin né scrub. le card sono tutte a colori.
import { Link } from 'react-router'
import { progetti } from '@/lib/progetti'
import { testoCard, useApriProgetto } from './carta'
import { Copertina } from './Copertina'

export function Griglia() {
  const apri = useApriProgetto()
  return (
    <ul className="mx-auto grid max-w-6xl grid-cols-2 gap-x-4 gap-y-8 px-4 py-24 md:gap-x-8 md:px-8">
      {progetti.map((p, i) => (
        <li key={p.slug}>
          {/* movimento ridotto: gli stati sono solo dissolvenze (passaggio e focus: copertina più tenue; premuto: ancora di più) */}
          <Link to={`/progetti/${p.slug}`} data-card-slug={p.slug} onClick={(e) => apri(e, p.slug, e.currentTarget)} className="group block rounded-card">
            <span className="relative block aspect-4/5 overflow-hidden rounded-card border border-grigio bg-nero">
              <span className="absolute inset-0 block transition-opacity duration-200 group-hover:opacity-80 group-focus-visible:opacity-80 group-active:opacity-60">
                <Copertina progetto={p} prima={i === 0} sizes="50vw" />
              </span>
            </span>
            <span aria-hidden="true" className="flex min-h-12 flex-wrap items-baseline justify-between gap-x-3 pt-3 text-etichetta cifre-tabellari">
              <span>{p.titolo}</span>
              <span className="flex gap-3">
                <span>{p.discipline.join(', ')}</span>
                <span>{p.anno}</span>
              </span>
            </span>
            <span className="sr-only">{testoCard(p)}</span>
          </Link>
        </li>
      ))}
    </ul>
  )
}
