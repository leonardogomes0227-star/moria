import { AnimatePresence, motion } from 'framer-motion'
import { useCallback, useEffect, useRef, useState } from 'react'
import { ChevronIcon, CloseIcon } from '@/components/Icons'
import { Reveal } from '@/components/Reveal'
import { Section } from '@/components/Section'
import { gallery as seed } from '@/data/gallery'
import { useRemoteList } from '@/hooks/useRemoteList'
import { fetchGallery } from '@/lib/api'

export function Gallery() {
  const gallery = useRemoteList(seed, fetchGallery)
  const [active, setActive] = useState<number | null>(null)
  const lastFocus = useRef<HTMLElement | null>(null)
  const closeRef = useRef<HTMLButtonElement>(null)

  const close = useCallback(() => {
    setActive(null)
    lastFocus.current?.focus()
  }, [])
  const step = useCallback(
    (d: number) => {
      setActive((i) => (i === null ? i : (i + d + gallery.length) % gallery.length))
    },
    [gallery.length],
  )

  useEffect(() => {
    if (active === null) return
    closeRef.current?.focus()
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') close()
      if (e.key === 'ArrowRight') step(1)
      if (e.key === 'ArrowLeft') step(-1)
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [active, close, step])

  return (
    <Section id="galeria" eyebrow="de dar água na boca" title="Direto da chapa">
      <ul className="grid auto-rows-[10.5rem] grid-cols-2 gap-3 sm:auto-rows-[13rem] md:grid-cols-4">
        {gallery.map((photo, i) => (
          <li key={photo.id} className={i === 0 || i === 3 ? 'row-span-2' : ''}>
            <Reveal delay={(i % 4) * 0.06} className="h-full">
              <button
                type="button"
                onClick={(e) => {
                  lastFocus.current = e.currentTarget
                  setActive(i)
                }}
                aria-label={`Ampliar: ${photo.alt}`}
                className="group relative block h-full w-full overflow-hidden rounded-[1.4rem] border border-line"
              >
                <img
                  src={photo.src}
                  alt={photo.alt}
                  width={800}
                  height={600}
                  loading="lazy"
                  decoding="async"
                  className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-110"
                />
                <span
                  aria-hidden="true"
                  className="absolute inset-0 flex items-end bg-gradient-to-t from-brand/70 via-transparent to-transparent p-4 opacity-0 transition-opacity duration-300 group-hover:opacity-100"
                >
                  <span className="font-script text-lg">ver foto</span>
                </span>
              </button>
            </Reveal>
          </li>
        ))}
      </ul>

      <AnimatePresence>
        {active !== null && (
          <motion.div
            role="dialog"
            aria-modal="true"
            aria-label="Foto ampliada"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 grid place-items-center bg-black/90 p-4"
            onClick={close}
          >
            <button
              ref={closeRef}
              type="button"
              onClick={close}
              aria-label="Fechar"
              className="absolute right-4 top-4 grid h-11 w-11 place-items-center rounded-full bg-white/10"
            >
              <CloseIcon />
            </button>
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation()
                step(-1)
              }}
              aria-label="Foto anterior"
              className="absolute left-3 grid h-11 w-11 place-items-center rounded-full bg-white/10"
            >
              <ChevronIcon dir="left" />
            </button>
            <motion.img
              key={active}
              initial={{ scale: 0.92, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              src={gallery[active].src}
              alt={gallery[active].alt}
              width={800}
              height={600}
              onClick={(e) => e.stopPropagation()}
              className="max-h-[85vh] w-auto max-w-full rounded-card object-contain"
            />
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation()
                step(1)
              }}
              aria-label="Próxima foto"
              className="absolute right-3 grid h-11 w-11 place-items-center rounded-full bg-white/10"
            >
              <ChevronIcon dir="right" />
            </button>
          </motion.div>
        )}
      </AnimatePresence>
    </Section>
  )
}
