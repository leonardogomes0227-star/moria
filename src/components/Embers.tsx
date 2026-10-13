import { useMemo } from 'react'

/** Sequência determinística (razão áurea) em [0,1): espalha as brasas sem Math.random no render. */
const spread = (i: number, salt: number) =>
  ((i + 1) * 0.618033988749 * salt + salt * 0.37) % 1

interface EmbersProps {
  count?: number
  className?: string
}

/** Brasas subindo, em CSS puro (barato no mobile). Escondidas com prefers-reduced-motion. */
export function Embers({ count = 18, className = '' }: EmbersProps) {
  const embers = useMemo(
    () =>
      Array.from({ length: count }, (_, i) => ({
        id: i,
        left: spread(i, 1) * 100,
        size: 2 + spread(i, 2) * 4,
        delay: -spread(i, 3) * 9,
        duration: 6 + spread(i, 4) * 7,
      })),
    [count],
  )
  return (
    <div
      aria-hidden="true"
      className={`pointer-events-none absolute inset-0 overflow-hidden motion-reduce:hidden ${className}`}
    >
      {embers.map((e) => (
        <span
          key={e.id}
          className="absolute bottom-[-10px] animate-rise rounded-full bg-ember shadow-[0_0_10px_2px_rgba(255,106,26,0.7)]"
          style={{
            left: `${e.left}%`,
            width: e.size,
            height: e.size,
            animationDelay: `${e.delay}s`,
            animationDuration: `${e.duration}s`,
          }}
        />
      ))}
    </div>
  )
}
