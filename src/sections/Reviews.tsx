import { AnimatePresence, motion } from 'framer-motion'
import { useCallback, useEffect, useState } from 'react'
import { ChevronIcon, StarIcon } from '@/components/Icons'
import { Section } from '@/components/Section'
import { reviews as seed } from '@/data/reviews'
import { useRemoteList } from '@/hooks/useRemoteList'
import { fetchReviews } from '@/lib/api'
import { usePrefersReducedMotion } from '@/hooks/useReducedMotion'

const SWIPE = 60

export function Reviews() {
  const reviews = useRemoteList(seed, fetchReviews)
  const [[index, dir], setPage] = useState<[number, number]>([0, 0])
  const [paused, setPaused] = useState(false)
  const reduced = usePrefersReducedMotion()

  const total = Math.max(reviews.length, 1)
  const go = useCallback(
    (delta: number) => setPage(([i]) => [(i + delta + total) % total, delta]),
    [total],
  )

  useEffect(() => {
    if (paused || reduced) return
    const id = window.setInterval(() => go(1), 7000)
    return () => window.clearInterval(id)
  }, [paused, reduced, go])

  const review = reviews[index] ?? reviews[0]
  if (!review) return null

  return (
    <Section
      id="feedbacks"
      eyebrow="quem provou, aprovou"
      title="O que dizem nossos clientes"
      className="bg-surface/40"
    >
      <div
        className="mx-auto max-w-2xl"
        role="group"
        aria-roledescription="carrossel"
        aria-label="Depoimentos"
        onMouseEnter={() => setPaused(true)}
        onMouseLeave={() => setPaused(false)}
        onFocus={() => setPaused(true)}
        onBlur={() => setPaused(false)}
      >
        <div className="relative min-h-[17rem] overflow-hidden sm:min-h-[15rem]">
          <AnimatePresence initial={false} custom={dir} mode="popLayout">
            <motion.figure
              key={review.id}
              custom={dir}
              variants={{
                enter: (d: number) => ({ x: d >= 0 ? 80 : -80, opacity: 0 }),
                center: { x: 0, opacity: 1 },
                exit: (d: number) => ({ x: d >= 0 ? -80 : 80, opacity: 0 }),
              }}
              initial="enter"
              animate="center"
              exit="exit"
              transition={{ duration: 0.4 }}
              drag="x"
              dragConstraints={{ left: 0, right: 0 }}
              dragElastic={0.4}
              onDragEnd={(_, info) => {
                if (info.offset.x < -SWIPE) go(1)
                else if (info.offset.x > SWIPE) go(-1)
              }}
              className="card cursor-grab p-7 text-center active:cursor-grabbing sm:p-9"
              aria-live={paused ? 'polite' : 'off'}
            >
              <div
                className="mb-4 flex justify-center gap-1 text-ember"
                role="img"
                aria-label={`Nota ${review.nota} de 5`}
              >
                {Array.from({ length: 5 }, (_, i) => (
                  <StarIcon
                    key={i}
                    size={20}
                    className={i < review.nota ? '' : 'opacity-25'}
                  />
                ))}
              </div>
              <blockquote className="text-lg leading-relaxed text-white/90 sm:text-xl">
                “{review.texto}”
              </blockquote>
              <figcaption className="mt-5 text-sm text-muted">
                <strong className="text-white">{review.nome}</strong> · via{' '}
                {review.origem}
              </figcaption>
            </motion.figure>
          </AnimatePresence>
        </div>

        <div className="mt-6 flex items-center justify-center gap-4">
          <button
            type="button"
            onClick={() => go(-1)}
            aria-label="Depoimento anterior"
            className="grid h-11 w-11 place-items-center rounded-full border border-line bg-surface hover:border-ember"
          >
            <ChevronIcon dir="left" />
          </button>
          <div className="flex gap-2">
            {reviews.map((r, i) => (
              <button
                key={r.id}
                type="button"
                onClick={() => setPage([i, i > index ? 1 : -1])}
                aria-label={`Ir para depoimento ${i + 1}`}
                aria-current={i === index}
                className="grid h-6 w-6 place-items-center"
              >
                <span
                  className={`h-2.5 rounded-full transition-all ${i === index ? 'w-6 bg-brand' : 'w-2.5 bg-white/25'}`}
                />
              </button>
            ))}
          </div>
          <button
            type="button"
            onClick={() => go(1)}
            aria-label="Próximo depoimento"
            className="grid h-11 w-11 place-items-center rounded-full border border-line bg-surface hover:border-ember"
          >
            <ChevronIcon dir="right" />
          </button>
        </div>
      </div>
    </Section>
  )
}
