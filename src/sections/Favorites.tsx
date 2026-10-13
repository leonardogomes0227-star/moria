import { MenuCard } from '@/components/MenuCard'
import { Section } from '@/components/Section'
import type { MenuItem } from '@/lib/types'

interface FavoritesProps {
  items: MenuItem[]
  onOpen: (item: MenuItem) => void
}

/** Carrossel horizontal (scroll-snap) com os itens marcados como "Mais pedido". */
export function Favorites({ items, onOpen }: FavoritesProps) {
  const favorites = items.filter((i) => i.destaque && i.disponivel)
  if (favorites.length === 0) return null
  return (
    <Section
      id="mais-pedidos"
      eyebrow="Os queridinhos"
      title="Mais pedidos da casa"
      className="!pb-6"
    >
      <ul
        data-lenis-prevent-touch
        className="scrollbar-none -mx-4 flex snap-x snap-mandatory gap-4 overflow-x-auto px-4 pb-4 sm:-mx-6 sm:px-6"
      >
        {favorites.map((item) => (
          <MenuCard
            key={item.id}
            item={item}
            onOpen={onOpen}
            className="w-[17rem] shrink-0 snap-start sm:w-72"
          />
        ))}
      </ul>
    </Section>
  )
}
