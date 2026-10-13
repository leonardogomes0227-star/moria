import { useState } from 'react'
import type { Category } from '@/lib/types'

const fallbackByCategory: Record<Category, string> = {
  Hambúrgueres: '/placeholders/hamburguer.svg',
  Baguetes: '/placeholders/baguete.svg',
  Acompanhamentos: '/placeholders/acompanhamento.svg',
  Molhos: '/placeholders/molho.svg',
  Bebidas: '/placeholders/bebida.svg',
  Combos: '/placeholders/combo.svg',
}

interface MenuImageProps {
  src: string
  alt: string
  categoria: Category
  className?: string
}

/** Imagem 4:3 com dimensões fixas (sem layout shift), lazy-load e fallback se quebrar. */
export function MenuImage({ src, alt, categoria, className = '' }: MenuImageProps) {
  const [failed, setFailed] = useState(false)
  return (
    <img
      src={failed || !src ? fallbackByCategory[categoria] : src}
      alt={alt}
      width={640}
      height={480}
      loading="lazy"
      decoding="async"
      onError={() => setFailed(true)}
      className={`aspect-[4/3] w-full object-cover ${className}`}
    />
  )
}
