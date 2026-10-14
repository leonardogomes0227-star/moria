import { motion, useMotionValue, useScroll, useSpring, useTransform } from 'framer-motion'
import { useEffect, useState, type PointerEvent } from 'react'
import { usePrefersReducedMotion } from '@/hooks/useReducedMotion'
import { useMenu } from '@/hooks/useMenu'
import { config } from '@/lib/config'
import { formatPrice } from '@/lib/format'
import { scrollToId } from '@/lib/scroll'
import { useMenuStore } from '@/store/menu'
import { FlameIcon } from './Icons'
import { MenuImage } from './MenuImage'

/** Pontos interativos sobre a foto (posições em % da imagem). Só descrevem o que a foto mostra. */
const HOTSPOTS = [
  { id: 'pao', label: 'Pão macio com gergelim', x: 40, y: 9, side: 'right' },
  { id: 'cheddar', label: 'Cheddar derretido', x: 64, y: 33, side: 'left' },
  { id: 'blend', label: 'Blend suculento na brasa', x: 38, y: 52, side: 'right' },
  { id: 'cebola', label: 'Cebola roxa e picles', x: 52, y: 66, side: 'left' },
] as const

const SEAL_TEXT = 'DEFUMADO NA BRASA • ARTESANAL • '

function Hotspots() {
  const [active, setActive] = useState<string | null>(null)
  return (
    <>
      {HOTSPOTS.map((h) => {
        const open = active === h.id
        return (
          <div
            key={h.id}
            className="absolute"
            style={{ left: `${h.x}%`, top: `${h.y}%` }}
          >
            <button
              type="button"
              aria-label={h.label}
              aria-expanded={open}
              onClick={() => setActive(open ? null : h.id)}
              onPointerEnter={(e) => e.pointerType === 'mouse' && setActive(h.id)}
              onPointerLeave={(e) => e.pointerType === 'mouse' && setActive(null)}
              onFocus={() => setActive(h.id)}
              onBlur={() => setActive(null)}
              className="relative grid h-9 w-9 -translate-x-1/2 -translate-y-1/2 place-items-center"
            >
              <span className="absolute h-4 w-4 animate-ping2 rounded-full bg-white/70" />
              <span className="relative h-3.5 w-3.5 rounded-full border-2 border-white bg-brand shadow-glow" />
            </button>
            <span
              role="status"
              className={`pointer-events-none absolute top-1/2 -translate-y-1/2 whitespace-nowrap rounded-pill border border-line bg-bg/90 px-3 py-1 text-xs font-semibold shadow-card backdrop-blur transition-all duration-200 ${
                h.side === 'right' ? 'left-5 origin-left' : 'right-5 origin-right'
              } ${open ? 'scale-100 opacity-100' : 'scale-90 opacity-0'}`}
            >
              {open ? h.label : ''}
            </span>
          </div>
        )
      })}
    </>
  )
}

function Seal() {
  return (
    <div
      aria-hidden="true"
      className="absolute -right-1 top-0 grid h-24 w-24 place-items-center rounded-full border border-ember/40 bg-bg/80 shadow-glow backdrop-blur sm:h-32 sm:w-32"
    >
      <svg viewBox="0 0 100 100" className="absolute inset-0 animate-spin-slow">
        <defs>
          <path id="seal-path" d="M50 50 m-38 0 a38 38 0 1 1 76 0 a38 38 0 1 1 -76 0" />
        </defs>
        <text fill="#fff" fontSize="9.2" fontWeight="700" letterSpacing="1.6">
          <textPath href="#seal-path">{SEAL_TEXT}</textPath>
        </text>
      </svg>
      <FlameIcon size={32} className="text-ember" />
    </div>
  )
}

/** Cartão flutuante com o item em destaque: leva direto ao cardápio. */
function FeaturedCard() {
  useMenu()
  const items = useMenuStore((s) => s.items)
  const setCategory = useMenuStore((s) => s.setCategory)
  const item =
    items.find((i) => i.destaque && i.disponivel && i.categoria === 'Hambúrgueres') ??
    items.find((i) => i.destaque && i.disponivel)
  if (!item) return null
  return (
    <button
      type="button"
      onClick={() => {
        setCategory(item.categoria)
        scrollToId('cardapio')
      }}
      className="absolute -bottom-3 right-0 flex animate-float items-center gap-3 rounded-2xl border border-white/15 bg-bg/85 p-2.5 pr-4 text-left shadow-glow backdrop-blur-xl transition-colors hover:border-ember sm:right-4"
    >
      <span className="w-16 shrink-0 overflow-hidden rounded-xl">
        <MenuImage src={item.imagem} alt="" categoria={item.categoria} />
      </span>
      <span>
        <span className="block font-script text-sm text-ember">destaque da casa</span>
        <span className="block font-display text-lg uppercase leading-tight">
          {item.nome}
        </span>
        <span className="block text-sm font-semibold text-white/85">
          {formatPrice(item.preco)} · <span className="text-ember">Pedir →</span>
        </span>
      </span>
    </button>
  )
}

/** Foto real do hambúrguer com parallax (mouse e scroll), Ken Burns, brilho de brasa e selos. */
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

  const { image, imageSmall, smallWidth, width, height, alt } = config.hero

  return (
    <div
      onPointerMove={onMove}
      onPointerLeave={onLeave}
      className="relative mx-auto w-full max-w-xl lg:max-w-none lg:scale-[1.12]"
      style={{ aspectRatio: `${width} / ${height}` }}
    >
      <div
        aria-hidden="true"
        className="absolute inset-0 bg-[radial-gradient(closest-side,rgba(214,31,31,0.55),transparent)]"
      />
      <motion.div style={{ x, y: scrollShift }} className="absolute inset-0">
        <motion.div style={{ y }} className="absolute inset-0">
          <img
            src={image}
            srcSet={`${imageSmall} ${smallWidth}w, ${image} ${width}w`}
            sizes="(min-width: 1024px) 620px, 100vw"
            alt={alt}
            width={width}
            height={height}
            fetchPriority="high"
            decoding="async"
            className="h-full w-full animate-kenburns select-none object-cover"
          />
          <Hotspots />
        </motion.div>
      </motion.div>
      <Seal />
      <FeaturedCard />
    </div>
  )
}
