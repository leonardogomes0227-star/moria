import { motion } from 'framer-motion'
import { isDemoSite } from '@/lib/demoMode'
import { BotIcon } from './Icons'

/** Só na demonstração: botão sempre visível para abrir o robô de atendimento (a tela mais fácil de testar). */
export function DemoBotButton() {
  if (!isDemoSite) return null
  return (
    <motion.a
      href="/teste"
      initial={{ opacity: 0, scale: 0.8 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ delay: 1.2, type: 'spring', stiffness: 260, damping: 18 }}
      aria-label="Testar o robô de atendimento do WhatsApp (demonstração)"
      className="group fixed bottom-24 right-3 z-40 flex items-center gap-2 rounded-pill bg-[#15803D] py-3 pl-4 pr-5 font-semibold shadow-[0_0_28px_rgba(21,128,61,.55)] hover:bg-[#16A34A] sm:bottom-6 sm:right-6"
    >
      <span className="relative grid h-7 w-7 place-items-center">
        <span className="absolute inset-0 animate-ping rounded-full bg-white/40 motion-reduce:hidden" aria-hidden />
        <BotIcon size={24} className="relative" />
      </span>
      <span className="leading-tight">
        Testar o robô
        <span className="block text-[11px] font-normal text-white/85">atendimento no WhatsApp</span>
      </span>
    </motion.a>
  )
}
