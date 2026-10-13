import { AnimatePresence, motion } from 'framer-motion'
import { useMemo, useState } from 'react'
import { SearchIcon } from '@/components/Icons'
import { MenuCard } from '@/components/MenuCard'
import { Section } from '@/components/Section'
import { CATEGORIES, type Category, type MenuItem } from '@/lib/types'

const normalize = (s: string) =>
  s
    .normalize('NFD')
    .replace(/\p{Diacritic}/gu, '')
    .toLowerCase()

function Skeletons() {
  return (
    <ul className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3" aria-hidden="true">
      {Array.from({ length: 6 }, (_, i) => (
        <li key={i} className="card h-80 animate-pulse bg-surface-2" />
      ))}
    </ul>
  )
}

interface MenuProps {
  items: MenuItem[]
  loading: boolean
  degraded: boolean
  reload: () => void
  onOpen: (item: MenuItem) => void
}

export function Menu({ items, loading, degraded, reload, onOpen }: MenuProps) {
  const [category, setCategory] = useState<Category>(CATEGORIES[0])
  const [query, setQuery] = useState('')

  const searching = query.trim().length > 0
  const visible = useMemo(() => {
    const q = normalize(query.trim())
    return items.filter((i) =>
      searching ? normalize(i.nome).includes(q) : i.categoria === category,
    )
  }, [items, category, query, searching])

  return (
    <Section
      id="cardapio"
      eyebrow="Cardápio digital"
      title="Escolha o seu"
      subtitle="Toque em Adicionar e finalize pelo WhatsApp."
    >
      <div className="sticky top-16 z-30 -mx-4 mb-8 border-y border-line bg-bg/85 px-4 py-3 backdrop-blur-xl sm:mx-0 sm:rounded-card sm:border">
        <div className="flex flex-col gap-3 md:flex-row md:items-center">
          <div
            role="tablist"
            aria-label="Categorias"
            className="scrollbar-none -mx-1 flex gap-2 overflow-x-auto px-1 md:flex-1"
          >
            {CATEGORIES.map((c) => {
              const active = !searching && c === category
              return (
                <button
                  key={c}
                  role="tab"
                  type="button"
                  aria-selected={active}
                  onClick={() => {
                    setQuery('')
                    setCategory(c)
                  }}
                  className={`shrink-0 rounded-pill px-4 py-2 text-sm font-semibold transition-colors ${
                    active
                      ? 'bg-brand text-white shadow-glow'
                      : 'bg-white/5 text-white/80 hover:bg-white/10'
                  }`}
                >
                  {c}
                </button>
              )
            })}
          </div>
          <div className="relative md:w-64">
            <SearchIcon
              size={18}
              className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 text-muted"
            />
            <input
              type="search"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Buscar no cardápio"
              aria-label="Buscar item pelo nome"
              className="input py-2.5 pl-10"
            />
          </div>
        </div>
      </div>

      {degraded && (
        <p
          role="alert"
          className="mb-6 rounded-xl border border-ember/40 bg-ember/10 px-4 py-3 text-sm text-ember"
        >
          Não conseguimos atualizar o cardápio agora; mostrando a última versão
          disponível.{' '}
          <button type="button" onClick={reload} className="font-semibold underline">
            Tentar de novo
          </button>
        </p>
      )}

      {loading ? (
        <Skeletons />
      ) : (
        <AnimatePresence mode="wait">
          <motion.div
            key={searching ? `busca-${query}` : category}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.2 }}
          >
            {visible.length === 0 ? (
              <p className="py-12 text-center text-muted">
                {searching
                  ? `Nenhum item encontrado para “${query.trim()}”.`
                  : 'Nenhum item nesta categoria ainda.'}
              </p>
            ) : (
              <ul className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
                {visible.map((item) => (
                  <MenuCard key={item.id} item={item} onOpen={onOpen} />
                ))}
              </ul>
            )}
          </motion.div>
        </AnimatePresence>
      )}
    </Section>
  )
}
