import type { ReactNode } from 'react'

interface TipProps {
  /** Explicação curta, em linguagem simples, do que o botão faz. */
  text: string
  children: ReactNode
  side?: 'top' | 'bottom'
  className?: string
}

/** Balão explicativo que aparece ao passar o mouse ou focar com o teclado. */
export function Tip({ text, children, side = 'top', className = '' }: TipProps) {
  return (
    <span className={`group/tip relative inline-flex ${className}`}>
      {children}
      <span
        role="tooltip"
        className={`pointer-events-none absolute left-1/2 z-30 w-max max-w-[16rem] -translate-x-1/2 rounded-xl border border-white/15 bg-black px-3 py-2 text-center text-xs font-medium leading-snug text-white opacity-0 shadow-card transition-opacity duration-150 group-focus-within/tip:opacity-100 group-hover/tip:opacity-100 ${
          side === 'top' ? 'bottom-full mb-2' : 'top-full mt-2'
        }`}
      >
        {text}
      </span>
    </span>
  )
}
