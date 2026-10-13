import { motion, useMotionValue, useSpring, useTransform } from 'framer-motion'
import { useState, type PointerEvent } from 'react'
import { usePrefersReducedMotion } from '@/hooks/useReducedMotion'
import { formatPrice } from '@/lib/format'
import type { MenuItem } from '@/lib/types'
import { useCart } from '@/store/cart'
import { CheckIcon, PlusIcon } from './Icons'
import { MenuImage } from './MenuImage'

interface MenuCardProps {
  item: MenuItem
  onOpen: (item: MenuItem) => void
  className?: string
}

export function MenuCard({ item, onOpen, className = '' }: MenuCardProps) {
  const add = useCart((s) => s.add)
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

  const handleAdd = () => {
    if (item.adicionais.length > 0) return onOpen(item)
    add({
      itemId: item.id,
      nome: item.nome,
      preco: item.preco,
      adicionais: [],
      qtd: 1,
      obs: '',
    })
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
      className={`card group flex flex-col overflow-hidden transition-shadow hover:shadow-glow ${
        item.disponivel ? '' : 'opacity-55 grayscale'
      } ${className}`}
    >
      <button
        type="button"
        onClick={() => onOpen(item)}
        className="relative block text-left"
      >
        <MenuImage src={item.imagem} alt={item.nome} categoria={item.categoria} />
        {item.destaque && item.disponivel && (
          <span className="absolute left-3 top-3 rounded-pill bg-brand-gradient px-3 py-1 text-xs font-bold uppercase tracking-wide shadow-glow">
            Mais pedido
          </span>
        )}
        {!item.disponivel && (
          <span className="absolute left-3 top-3 rounded-pill bg-black/80 px-3 py-1 text-xs font-bold uppercase">
            Indisponível
          </span>
        )}
      </button>
      <div className="flex flex-1 flex-col gap-2 p-4">
        <h3 className="text-xl leading-tight">{item.nome}</h3>
        <p className="line-clamp-2 flex-1 text-sm text-muted">{item.descricao}</p>
        <div className="mt-2 flex items-center justify-between gap-3">
          <span className="text-lg font-bold text-white">{formatPrice(item.preco)}</span>
          {item.disponivel && (
            <button
              type="button"
              onClick={handleAdd}
              aria-label={`Adicionar ${item.nome} ao carrinho`}
              className={`inline-flex items-center gap-1.5 rounded-pill px-4 py-2 text-sm font-semibold transition-colors ${
                added
                  ? 'bg-[#1FA855] text-white'
                  : 'bg-brand text-white hover:bg-brand-light'
              }`}
            >
              {added ? <CheckIcon size={18} /> : <PlusIcon size={18} />}
              {added ? 'Adicionado' : 'Adicionar'}
            </button>
          )}
        </div>
      </div>
    </motion.li>
  )
}
