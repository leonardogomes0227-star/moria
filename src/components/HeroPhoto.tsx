import { motion, useMotionValue, useScroll, useSpring, useTransform } from 'framer-motion'
import { useEffect, type PointerEvent } from 'react'
import { usePrefersReducedMotion } from '@/hooks/useReducedMotion'
import { config } from '@/lib/config'
import { FlameIcon } from './Icons'
import { OpenBadge } from './OpenBadge'

const SEAL_TEXT = 'DEFUMADO NA BRASA • ARTESANAL • '

function Seal() {
  return (
    <div
      aria-hidden="true"
      className="absolute -right-1 top-0 grid h-24 w-24 place-items-center rounded-full border border-ember/40 bg-bg/80 shadow-glow backdrop-blur sm:h-28 sm:w-28"
    >
      <svg viewBox="0 0 100 100" className="absolute inset-0 animate-spin-slow">
        <defs>
          <path id="seal-path" d="M50 50 m-38 0 a38 38 0 1 1 76 0 a38 38 0 1 1 -76 0" />
        </defs>
        <text fill="#fff" fontSize="9.2" fontWeight="700" letterSpacing="1.6">
          <textPath href="#seal-path">{SEAL_TEXT}</textPath>
        </text>
      </svg>
      <FlameIcon size={30} className="text-ember" />
    </div>
  )
}

/** Foto real do hambúrguer com parallax (mouse e scroll), brilho de brasa e selos. */
export function HeroPhoto() {
  const reduced = usePrefersReducedMotion()
  const { scrollY } = useScroll()
  const scrollShift = useTransform(scrollY, [0, 600], [0, reduced ? 0 : -36])
  const mx = useSpring(useMotionValue(0), { stiffness: 120, damping: 18 })
  const my = useSpring(useMotionValue(0), { stiffness: 120, damping: 18 })
  const x = useTransform(mx, [-0.5, 0.5], [-14, 14])
  const y = useTransform(my, [-0.5, 0.5], [-10, 10])

  useEffect(
    () => () => {
      mx.set(0)
      my.set(0)
    },
    [mx, my],
  )

  const onMove = (e: PointerEvent<HTMLDivElement>) => {
    if (reduced || e.pointerType !== 'mouse') return
    const r = e.currentTarget.getBoundingClientRect()
    mx.set((e.clientX - r.left) / r.width - 0.5)
    my.set((e.clientY - r.top) / r.height - 0.5)
  }
  const onLeave = () => {
    mx.set(0)
    my.set(0)
  }

  const { image, width, height, alt } = config.hero

  return (
    <div
      onPointerMove={onMove}
      onPointerLeave={onLeave}
      className="relative mx-auto w-full max-w-xl lg:max-w-none"
      style={{ aspectRatio: `${width} / ${height}` }}
    >
      <div
        aria-hidden="true"
        className="absolute inset-0 bg-[radial-gradient(closest-side,rgba(214,31,31,0.45),transparent)]"
      />
      <motion.div style={{ x, y: scrollShift }} className="absolute inset-0">
        <motion.img
          src={image}
          alt={alt}
          width={width}
          height={height}
          fetchPriority="high"
          decoding="async"
          style={{ y }}
          className="h-full w-full select-none object-cover"
        />
      </motion.div>
      <Seal />
      <div className="absolute bottom-[6%] left-[4%] sm:left-[8%]">
        <OpenBadge className="border border-line bg-bg/85 backdrop-blur" />
      </div>
    </div>
  )
}
