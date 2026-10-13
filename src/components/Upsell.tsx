import { addToCart } from '@/lib/cartActions'
import { formatPrice } from '@/lib/format'
import { CATEGORIES } from '@/lib/types'
import { useCart } from '@/store/cart'
import { useMenuStore } from '@/store/menu'
import { PlusIcon } from './Icons'
import { MenuImage } from './MenuImage'

const UPSELL_CATEGORIES: readonly (typeof CATEGORIES)[number][] = [
  'Acompanhamentos',
  'Bebidas',
  'Molhos',
]

/** “Complete seu pedido”: sugere acompanhamento, bebida ou molho que ainda não estão no carrinho. */
export function Upsell() {
  const items = useMenuStore((s) => s.items)
  const lines = useCart((s) => s.lines)
  const inCart = new Set(lines.map((l) => l.itemId))
  const suggestions = UPSELL_CATEGORIES.map((c) =>
    items.find(
      (i) =>
        i.categoria === c &&
        i.disponivel &&
        i.adicionais.length === 0 &&
        !inCart.has(i.id),
    ),
  )
    .filter((i): i is NonNullable<typeof i> => Boolean(i))
    .slice(0, 3)
  if (suggestions.length === 0) return null

  return (
    <section
      aria-label="Complete seu pedido"
      className="rounded-2xl border border-ember/30 bg-ember/5 p-4"
    >
      <p className="mb-3 font-script text-lg text-ember">que tal completar?</p>
      <ul className="space-y-2">
        {suggestions.map((item) => (
          <li key={item.id} className="flex items-center gap-3">
            <span className="w-14 shrink-0 overflow-hidden rounded-lg">
              <MenuImage src={item.imagem} alt="" categoria={item.categoria} />
            </span>
            <span className="min-w-0 flex-1">
              <span className="block truncate text-sm font-semibold">{item.nome}</span>
              <span className="text-sm text-muted">{formatPrice(item.preco)}</span>
            </span>
            <button
              type="button"
              aria-label={`Adicionar ${item.nome}`}
              onClick={(e) =>
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
              }
              className="grid h-10 w-10 shrink-0 place-items-center rounded-full bg-brand text-white hover:bg-brand-light"
            >
              <PlusIcon size={18} />
            </button>
          </li>
        ))}
      </ul>
    </section>
  )
}
