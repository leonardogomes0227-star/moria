import { useRef } from 'react'
import { ChevronIcon } from '@/components/Icons'
import { MenuCard } from '@/components/MenuCard'
import { Section } from '@/components/Section'
import type { MenuItem } from '@/lib/types'

interface FavoritesProps {
  items: MenuItem[]
  onOpen: (item: MenuItem) => void
}

/** Carrossel horizontal (scroll-snap) com os itens marcados como "Destaque". */
export function Favorites({ items, onOpen }: FavoritesProps) {
  const track = useRef<HTMLUListElement>(null)
  const favorites = items.filter((i) => i.destaque && i.disponivel)
  if (favorites.length === 0) return null

  const scrollBy = (dir: 1 | -1) =>
    track.current?.scrollBy({ left: dir * 300, behavior: 'smooth' })

  const arrow =
    'absolute top-1/2 z-10 hidden h-12 w-12 -translate-y-1/2 place-items-center rounded-full border border-line bg-bg/90 shadow-card backdrop-blur transition-colors hover:border-ember md:grid'

  return (
    <Section
      id="mais-pedidos"
      eyebrow="os queridinhos da casa"
      title="Destaques da casa"
      className="!pb-6"
    >
      <div className="relative">
        <button
          type="button"
          aria-label="Itens anteriores"
          onClick={() => scrollBy(-1)}
          className={`${arrow} -left-4`}
        >
          <ChevronIcon dir="left" />
        </button>
        <button
          type="button"
          aria-label="Próximos itens"
          onClick={() => scrollBy(1)}
          className={`${arrow} -right-4`}
        >
          <ChevronIcon dir="right" />
        </button>
        <ul
          ref={track}
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
      </div>
    </Section>
  )
}
