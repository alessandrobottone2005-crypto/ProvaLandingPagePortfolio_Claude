// blocco immagini: una o più immagini, "piena" (una sotto l’altra) o "griglia" (due colonne da tablet in su).
// ogni immagine entra con una rivelazione a maschera dal basso (clip-path) quando arriva in vista.
// motion anima la maschera sul contenitore e lo zoom sull’immagine: due elementi diversi.
import { motion, useReducedMotion } from 'motion/react'
import { movimento } from '@/config/movimento'
import { sito } from '@/config/sito'

const ease = [0.16, 1, 0.3, 1] as const

type Props = { file: string[]; layout: 'piena' | 'griglia'; titolo: string }

export default function Immagini({ file, layout, titolo }: Props) {
  const ridotto = useReducedMotion()
  const vista = { once: true, amount: 0.15 }

  return (
    <div className={layout === 'griglia' ? 'grid gap-4 md:grid-cols-2' : 'flex flex-col gap-4'}>
      {file.map((src, i) => (
        // si osserva il contenitore esterno: con la maschera chiusa l’immagine ha area zero e non risulterebbe mai "in vista"
        <motion.figure key={src + i} initial="fuori" whileInView="dentro" viewport={vista}>
          <motion.div
            className="overflow-hidden rounded-card"
            variants={
              ridotto
                ? { fuori: { opacity: 0 }, dentro: { opacity: 1 } }
                : { fuori: { clipPath: 'inset(100% 0% 0% 0% round 16px)' }, dentro: { clipPath: 'inset(0% 0% 0% 0% round 16px)' } }
            }
            transition={
              ridotto
                ? { duration: movimento.durata.ridotta }
                : { duration: movimento.durata.grande * 0.8, ease, delay: layout === 'griglia' ? (i % 2) * 0.08 : 0 }
            }
          >
            <motion.img
              src={src}
              alt={sito.pannello.immagine(titolo, i + 1)}
              loading="lazy"
              decoding="async"
              className="w-full object-cover"
              variants={ridotto ? undefined : { fuori: { scale: 1.12 }, dentro: { scale: 1 } }}
              transition={{ duration: movimento.durata.grande, ease }}
            />
          </motion.div>
        </motion.figure>
      ))}
    </div>
  )
}
