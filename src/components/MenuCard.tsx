import { motion, useMotionValue, useSpring, useTransform } from 'framer-motion'
import { useState, type MouseEvent, type PointerEvent } from 'react'
import { usePrefersReducedMotion } from '@/hooks/useReducedMotion'
import { addToCart } from '@/lib/cartActions'
import { formatPrice } from '@/lib/format'
import type { MenuItem } from '@/lib/types'
import { CheckIcon, PlusIcon } from './Icons'
import { MenuImage } from './MenuImage'

interface MenuCardProps {
  item: MenuItem
  onOpen: (item: MenuItem) => void
  className?: string
}

export function MenuCard({ item, onOpen, className = '' }: MenuCardProps) {
  const reduced = usePrefersReducedMotion()
  const [added, setAdded] = useState(false)

  // Tilt 3D leve seguindo o mouse (ignorado em toque e com reduced-motion).
  const px = useMotionValue(0)
  const py = useMotionValue(0)
  const rotateX = useSpring(useTransform(py, [-0.5, 0.5], [5, -5]), {
    stiffness: 200,
    damping: 20,
  })
  const rotateY = useSpring(useTransform(px, [-0.5, 0.5], [-6, 6]), {
    stiffness: 200,
    damping: 20,
  })

  const onMove = (e: PointerEvent<HTMLElement>) => {
    if (reduced || e.pointerType !== 'mouse') return
    const r = e.currentTarget.getBoundingClientRect()
    px.set((e.clientX - r.left) / r.width - 0.5)
    py.set((e.clientY - r.top) / r.height - 0.5)
  }
  const onLeave = () => {
    px.set(0)
    py.set(0)
  }

  const label = added
    ? 'Adicionado!'
    : item.adicionais.length > 0
      ? 'Personalizar e pedir'
      : 'Adicionar ao pedido'

  const handleAdd = (e: MouseEvent<HTMLButtonElement>) => {
    if (item.adicionais.length > 0) return onOpen(item)
    addToCart(
      {
        itemId: item.id,
        nome: item.nome,
        preco: item.preco,
        adicionais: [],
        qtd: 1,
        obs: '',
      },
      e.currentTarget,
    )
    setAdded(true)
    window.setTimeout(() => setAdded(false), 1400)
  }

  return (
    <motion.li
      layout
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, scale: 0.96 }}
      style={{ rotateX, rotateY, transformPerspective: 900 }}
      onPointerMove={onMove}
      onPointerLeave={onLeave}
      className={`group relative flex flex-col overflow-hidden rounded-[1.6rem] border border-line bg-surface shadow-card transition-all duration-300 hover:border-brand/70 hover:shadow-glow ${
        item.disponivel ? '' : 'opacity-60 grayscale'
      } ${className}`}
    >
      <button
        type="button"
        onClick={() => onOpen(item)}
        className="relative block overflow-hidden text-left"
      >
        <MenuImage
          src={item.imagem}
          alt={item.nome}
          categoria={item.categoria}
          className="transition-transform duration-700 ease-out group-hover:scale-110"
        />
        <span
          aria-hidden="true"
          className="absolute inset-0 bg-gradient-to-t from-surface via-transparent to-transparent"
        />
        {item.destaque && item.disponivel && (
          <span className="absolute left-0 top-4 flex items-center gap-1.5 rounded-r-full bg-brand-gradient py-1 pl-3 pr-4 font-display text-sm uppercase tracking-wider shadow-glow">
            <span aria-hidden="true">🔥</span> Destaque
          </span>
        )}
        {!item.disponivel && (
          <span className="absolute left-0 top-4 rounded-r-full bg-black/85 py-1 pl-3 pr-4 font-display text-sm uppercase tracking-wider">
            Indisponível
          </span>
        )}
        <span className="absolute bottom-3 right-3 -rotate-6 rounded-xl bg-white px-3 py-1 font-display text-2xl leading-none text-bg shadow-card transition-transform duration-300 group-hover:rotate-0 group-hover:scale-110">
          {formatPrice(item.preco)}
        </span>
      </button>
      <div className="flex flex-1 flex-col gap-2 p-5 pt-3">
        <h3 className="text-[1.7rem] leading-none">{item.nome}</h3>
        <p className="line-clamp-2 flex-1 text-sm text-muted">{item.descricao}</p>
        {item.disponivel && (
          <button
            type="button"
            onClick={handleAdd}
            aria-label={`${label}: ${item.nome}`}
            className={`relative mt-3 inline-flex items-center justify-center gap-2 overflow-hidden rounded-pill px-5 py-3 text-sm font-bold uppercase tracking-wide transition-colors ${
              added
                ? 'bg-[#15803D] text-white'
                : 'bg-brand text-white hover:bg-brand-light'
            }`}
          >
            <span
              aria-hidden="true"
              className="absolute inset-y-0 left-0 w-1/4 animate-sweep bg-white/25 opacity-0 group-hover:opacity-100"
            />
            {added ? <CheckIcon size={18} /> : <PlusIcon size={18} />}
            {added
              ? 'Adicionado!'
              : item.adicionais.length > 0
                ? 'Personalizar e pedir'
                : 'Adicionar ao pedido'}
          </button>
        )}
      </div>
    </motion.li>
  )
}
