import { AnimatePresence, motion } from 'framer-motion'
import { useEffect, useRef, type ReactNode } from 'react'
import { useMediaQuery } from '@/hooks/useMediaQuery'
import { CloseIcon } from './Icons'

interface DialogProps {
  open: boolean
  onClose: () => void
  title: string
  /** `panel` = drawer lateral (desktop) / bottom sheet (mobile). `center` = modal centralizado. */
  variant?: 'panel' | 'center'
  children: ReactNode
}

const FOCUSABLE =
  'a[href],button:not([disabled]),input:not([disabled]),select,textarea,[tabindex]:not([tabindex="-1"])'

export function Dialog({
  open,
  onClose,
  title,
  variant = 'panel',
  children,
}: DialogProps) {
  const panelRef = useRef<HTMLDivElement>(null)
  const isDesktop = useMediaQuery('(min-width: 640px)')

  useEffect(() => {
    if (!open) return
    const previous = document.activeElement as HTMLElement | null
    const html = document.documentElement
    const prevOverflow = html.style.overflow
    html.style.overflow = 'hidden'
    panelRef.current?.focus()

    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') return onClose()
      if (e.key !== 'Tab' || !panelRef.current) return
      const nodes = panelRef.current.querySelectorAll<HTMLElement>(FOCUSABLE)
      if (nodes.length === 0) return
      const first = nodes[0]
      const last = nodes[nodes.length - 1]
      if (e.shiftKey && document.activeElement === first) {
        e.preventDefault()
        last.focus()
      } else if (!e.shiftKey && document.activeElement === last) {
        e.preventDefault()
        first.focus()
      }
    }
    document.addEventListener('keydown', onKey)
    return () => {
      document.removeEventListener('keydown', onKey)
      html.style.overflow = prevOverflow
      previous?.focus()
    }
  }, [open, onClose])

  const panelClass =
    variant === 'panel'
      ? 'fixed inset-x-0 bottom-0 flex max-h-[92dvh] flex-col rounded-t-3xl sm:inset-y-0 sm:left-auto sm:right-0 sm:max-h-none sm:w-[28rem] sm:rounded-none sm:rounded-l-3xl'
      : 'fixed inset-x-3 bottom-3 top-auto mx-auto flex max-h-[90dvh] max-w-lg flex-col rounded-3xl sm:inset-y-0 sm:my-auto sm:h-fit'

  const hidden =
    variant === 'panel'
      ? isDesktop
        ? { x: '100%' }
        : { y: '100%' }
      : { y: 40, opacity: 0 }
  const shown = variant === 'panel' ? { x: 0, y: 0 } : { y: 0, opacity: 1 }

  return (
    <AnimatePresence>
      {open && (
        <div className="fixed inset-0 z-50">
          <motion.div
            className="absolute inset-0 bg-black/70 backdrop-blur-sm"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
          />
          <motion.div
            ref={panelRef}
            role="dialog"
            aria-modal="true"
            aria-label={title}
            tabIndex={-1}
            initial={hidden}
            animate={shown}
            exit={hidden}
            transition={{ type: 'spring', damping: 32, stiffness: 320 }}
            className={`${panelClass} border border-line bg-surface shadow-glow outline-none`}
          >
            <div className="flex items-center justify-between border-b border-line px-5 py-4">
              <h2 className="text-xl">{title}</h2>
              <button
                type="button"
                onClick={onClose}
                aria-label="Fechar"
                className="grid h-10 w-10 place-items-center rounded-full bg-white/5 hover:bg-white/10"
              >
                <CloseIcon size={20} />
              </button>
            </div>
            <div
              data-lenis-prevent
              className="min-h-0 flex-1 overflow-y-auto overscroll-contain"
            >
              {children}
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  )
}
