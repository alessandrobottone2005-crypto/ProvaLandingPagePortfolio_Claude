// blocco testo: uno o più paragrafi (una riga vuota nel json separa i paragrafi)
export default function Testo({ testo }: { testo: string }) {
  const paragrafi = testo.split(/\n\s*\n/).map((p) => p.trim()).filter(Boolean)
  return (
    <div className="flex max-w-2xl flex-col gap-4 text-corrente text-bianco">
      {paragrafi.map((p, i) => (
        <p key={i}>{p}</p>
      ))}
    </div>
  )
}
