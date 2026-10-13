import { useRef, type HTMLAttributes, type PointerEvent, type ReactNode } from 'react'

interface SpotlightCardProps extends HTMLAttributes<HTMLElement> {
  children: ReactNode
}

/** Card com brilho de brasa que segue o cursor (atualiza só variáveis CSS, sem re-render). */
export function SpotlightCard({ children, className = '', ...rest }: SpotlightCardProps) {
  const ref = useRef<HTMLElement>(null)
  const onMove = (e: PointerEvent<HTMLElement>) => {
    const el = ref.current
    if (!el || e.pointerType !== 'mouse') return
    const r = el.getBoundingClientRect()
    el.style.setProperty('--mx', `${e.clientX - r.left}px`)
    el.style.setProperty('--my', `${e.clientY - r.top}px`)
  }
  return (
    <article
      ref={ref}
      onPointerMove={onMove}
      className={`group relative overflow-hidden ${className}`}
      {...rest}
    >
      <span
        aria-hidden="true"
        className="pointer-events-none absolute inset-0 opacity-0 transition-opacity duration-300 group-hover:opacity-100"
        style={{
          background:
            'radial-gradient(260px circle at var(--mx,50%) var(--my,50%), rgba(255,106,26,0.22), transparent 70%)',
        }}
      />
      <div className="relative">{children}</div>
    </article>
  )
}
