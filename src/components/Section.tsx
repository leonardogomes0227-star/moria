import type { ReactNode } from 'react'
import { Reveal } from './Reveal'

interface SectionProps {
  id: string
  eyebrow?: string
  title: string
  subtitle?: string
  children: ReactNode
  className?: string
}

export function Section({
  id,
  eyebrow,
  title,
  subtitle,
  children,
  className = '',
}: SectionProps) {
  return (
    <section
      id={id}
      aria-labelledby={`${id}-title`}
      className={`relative py-section ${className}`}
    >
      <div className="container-x">
        <Reveal className="mx-auto mb-10 max-w-2xl text-center">
          {eyebrow && (
            <p className="mb-2 text-sm font-semibold uppercase tracking-[0.2em] text-ember">
              {eyebrow}
            </p>
          )}
          <h2 id={`${id}-title`} className="text-3xl sm:text-4xl md:text-5xl">
            {title}
          </h2>
          {subtitle && <p className="mt-3 text-base text-muted sm:text-lg">{subtitle}</p>}
        </Reveal>
        {children}
      </div>
    </section>
  )
}
