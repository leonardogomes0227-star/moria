import { config } from '@/lib/config'

/** Para usar o logo real, salve o arquivo em src/assets/logo.png — ele substitui o SVG automaticamente. */
const custom = import.meta.glob<{ default: string }>('../assets/logo.png', {
  eager: true,
})
const customSrc = Object.values(custom)[0]?.default

interface LogoProps {
  size?: number
  showText?: boolean
  className?: string
}

export function Logo({ size = 44, showText = true, className = '' }: LogoProps) {
  return (
    <span className={`inline-flex items-center gap-3 ${className}`}>
      {customSrc ? (
        <img
          src={customSrc}
          alt={config.name}
          width={size}
          height={size}
          className="rounded-full"
        />
      ) : (
        <svg
          width={size}
          height={size}
          viewBox="0 0 64 64"
          role="img"
          aria-label={config.name}
        >
          <defs>
            <radialGradient id="logo-bg" cx="50%" cy="85%" r="85%">
              <stop offset="0" stopColor="#D61F1F" />
              <stop offset="0.65" stopColor="#4A0B0B" />
              <stop offset="1" stopColor="#0B0F14" />
            </radialGradient>
          </defs>
          <circle
            cx="32"
            cy="32"
            r="31"
            fill="url(#logo-bg)"
            stroke="#D61F1F"
            strokeWidth="1.5"
          />
          <path d="M10 52 L26 26 L32 34 L38 24 L54 52 Z" fill="#fff" />
          {/* hambúrguer no topo */}
          <path d="M26 17c0-4 3-6 7-6s7 2 7 6z" fill="#FF6A1A" />
          <rect x="25.5" y="18" width="15" height="2.2" rx="1.1" fill="#fff" />
          <rect x="25.5" y="20.6" width="15" height="2.4" rx="1.2" fill="#6B2A12" />
          <path d="M26 23.8h14v.4q0 2-2 2h-10q-2 0-2-2z" fill="#FF6A1A" />
        </svg>
      )}
      {showText && (
        <span className="font-display text-xl uppercase leading-none tracking-wide">
          Moriá
          <span className="mt-0.5 block font-sans text-[0.6rem] font-semibold tracking-[0.24em] text-muted">
            Hamburgueria
          </span>
        </span>
      )}
    </span>
  )
}
