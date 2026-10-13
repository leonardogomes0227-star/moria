import { AnimatePresence, motion } from 'framer-motion'
import { useToasts, type ToastTone } from '@/store/toast'
import { CheckIcon, CloseIcon } from './Icons'

const tones: Record<ToastTone, string> = {
  success: 'border-[#1FA855]/50 bg-[#0F2A1D] text-[#BFF3D2]',
  error: 'border-brand/60 bg-[#2A0F10] text-[#FFC9C9]',
  info: 'border-line bg-surface-2 text-white',
}

/** Avisos rápidos (adicionou ao carrinho, salvou, deu erro…). */
export function Toaster() {
  const { toasts, dismiss } = useToasts()
  return (
    <div
      className="pointer-events-none fixed inset-x-0 bottom-20 z-[80] flex flex-col items-center gap-2 px-4 sm:bottom-6"
      aria-live="polite"
    >
      <AnimatePresence>
        {toasts.map((t) => (
          <motion.div
            key={t.id}
            layout
            initial={{ opacity: 0, y: 24, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 12, scale: 0.95 }}
            role={t.tone === 'error' ? 'alert' : 'status'}
            className={`pointer-events-auto flex max-w-md items-center gap-3 rounded-2xl border px-4 py-3 text-sm font-medium shadow-card ${tones[t.tone]}`}
          >
            {t.tone === 'success' && <CheckIcon size={18} />}
            <span>{t.text}</span>
            <button
              type="button"
              onClick={() => dismiss(t.id)}
              aria-label="Fechar aviso"
              className="ml-1 opacity-70 hover:opacity-100"
            >
              <CloseIcon size={16} />
            </button>
          </motion.div>
        ))}
      </AnimatePresence>
    </div>
  )
}
