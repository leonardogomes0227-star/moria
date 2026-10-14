import { useState } from 'react'
import type { Category } from '@/lib/types'

const fallbackByCategory: Record<Category, string> = {
  Hambúrgueres: '/menu/burger-1.webp',
  Tradicionais: '/menu/x-burguer.svg',
  Baguetes: '/menu/baguete-costela.svg',
  Acompanhamentos: '/menu/batata.svg',
  Molhos: '/menu/molho-artesanal.svg',
  Bebidas: '/menu/refrigerante-lata.svg',
  Combos: '/menu/combo-classico.svg',
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
