import type { ReactNode } from 'react'
import { Reveal } from './Reveal'

interface SectionProps {
  id: string
  eyebrow?: string
  title: string
  subtitle?: string
  children: ReactNode
  className?: string
  /** `red`: fundo vermelho de marca (seções de destaque). */
  tone?: 'dark' | 'red'
}

export function Section({
  id,
  eyebrow,
  title,
  subtitle,
  children,
  className = '',
  tone = 'dark',
}: SectionProps) {
  const red = tone === 'red'
  return (
    <section
      id={id}
      aria-labelledby={`${id}-title`}
      className={`relative py-section ${red ? 'bg-brand text-white' : ''} ${className}`}
    >
      {red && (
        <div
          aria-hidden="true"
          className="grill absolute inset-0 bg-gradient-to-b from-brand-dark/50 via-transparent to-brand-dark/60"
        />
      )}
      <div className="container-x relative">
        <Reveal className="mx-auto mb-12 max-w-3xl text-center">
          {eyebrow && (
            <p
              className={`mb-2 -rotate-2 font-script text-xl sm:text-2xl ${red ? 'text-white' : 'text-ember'}`}
            >
              {eyebrow}
            </p>
          )}
          <h2
            id={`${id}-title`}
            className="text-5xl leading-[0.95] sm:text-6xl md:text-7xl"
          >
            {title}
          </h2>
          <span
            aria-hidden="true"
            className={`mx-auto mt-4 block h-1.5 w-20 rounded-full ${red ? 'bg-white' : 'bg-brand-gradient'}`}
          />
          {subtitle && (
            <p
              className={`mt-4 text-base sm:text-lg ${red ? 'text-white/90' : 'text-muted'}`}
            >
              {subtitle}
            </p>
          )}
        </Reveal>
        {children}
      </div>
    </section>
  )
}
