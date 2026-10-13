import { useMemo, useState } from 'react'
import { Button } from '@/components/Button'
import {
  ChevronIcon,
  CopyIcon,
  PlusIcon,
  SearchIcon,
  TrashIcon,
} from '@/components/Icons'
import { MenuImage } from '@/components/MenuImage'
import { menuItems as seed } from '@/data/menu'
import { repo, type MenuDraft } from '@/lib/data'
import { formatPrice } from '@/lib/format'
import { CATEGORIES, type Category, type MenuItem } from '@/lib/types'
import { toast } from '@/store/toast'
import { ItemEditor } from './ItemEditor'
import { Tip } from './Tip'
import { ErrorBox, HelpBox, PageHeader, Spinner, Toggle } from './ui'
import { useLoad } from './useLoad'

type View = 'todos' | 'indisponiveis' | 'destaques'

const normalize = (s: string) =>
  s
    .normalize('NFD')
    .replace(/\p{Diacritic}/gu, '')
    .toLowerCase()

export default function MenuManager() {
  const { data, error, reload } = useLoad(() => repo.menu.list())
  const items = useMemo(() => data ?? [], [data])
  const [category, setCategory] = useState<Category>(CATEGORIES[0])
  const [view, setView] = useState<View>('todos')
  const [query, setQuery] = useState('')
  const [editing, setEditing] = useState<MenuItem | 'new' | null>(null)

  const searching = query.trim().length > 0
  const list = useMemo(() => {
    const q = normalize(query.trim())
    return items.filter((i) => {
      if (searching) return normalize(i.nome).includes(q)
      if (i.categoria !== category) return false
      if (view === 'indisponiveis') return !i.disponivel
      if (view === 'destaques') return i.destaque
      return true
    })
  }, [items, category, view, query, searching])

  const nextOrder = Math.max(-1, ...items.map((i) => i.ordem ?? 0)) + 1
  const countOf = (c: Category) => items.filter((i) => i.categoria === c).length

  const run = async (action: () => Promise<void>, okMessage?: string) => {
    try {
      await action()
      await reload()
      if (okMessage) toast(okMessage)
    } catch (err) {
      toast(err instanceof Error ? err.message : 'Operação falhou.', 'error')
    }
  }

  const move = (index: number, delta: -1 | 1) => {
    const other = list[index + delta]
    if (other) void run(() => repo.menu.swap(list[index], other))
  }

  const handleSave = async (draft: MenuDraft) => {
    await repo.menu.save(draft, nextOrder)
    setEditing(null)
    await reload()
    toast(draft.id ? 'Item atualizado.' : 'Item criado.')
  }

  const duplicate = (item: MenuItem) =>
    void run(
      () =>
        repo.menu.save(
          { ...item, id: undefined, nome: `${item.nome} (cópia)`, destaque: false },
          nextOrder,
        ),
      'Item duplicado. Edite o nome e o preço.',
    )

  return (
    <>
      <PageHeader
        title="Cardápio"
        description="Cadastre e organize tudo que você vende. As mudanças aparecem no site na hora."
        actions={
          <Tip
            text="Abre o formulário para cadastrar um produto novo no cardápio."
            side="bottom"
          >
            <Button onClick={() => setEditing('new')}>
              <PlusIcon size={18} /> Novo item
            </Button>
          </Tip>
        }
      />
      <HelpBox title="Dicas rápidas">
        <p>
          <strong>Disponível:</strong> desligue quando acabar o produto. Ele continua
          aparecendo no site, mas esmaecido e sem botão de pedir.
        </p>
        <p>
          <strong>Mais pedido:</strong> coloca o selo no item e o exibe no carrossel “Mais
          pedidos da casa”.
        </p>
        <p>
          <strong>Setas:</strong> mudam a posição do item dentro da categoria.{' '}
          <strong>Adicionais:</strong> extras opcionais que o cliente escolhe (ex.: bacon
          + R$ 5,00).
        </p>
      </HelpBox>
      {error && <ErrorBox message={error} onRetry={() => void reload()} />}

      <div
        role="tablist"
        aria-label="Categorias"
        className="scrollbar-none -mx-1 mb-4 flex gap-2 overflow-x-auto px-1"
      >
        {CATEGORIES.map((c) => (
          <button
            key={c}
            role="tab"
            type="button"
            aria-selected={!searching && c === category}
            onClick={() => {
              setQuery('')
              setCategory(c)
            }}
            className={`shrink-0 rounded-pill px-4 py-2 text-sm font-semibold ${!searching && c === category ? 'bg-brand' : 'bg-white/5 hover:bg-white/10'}`}
          >
            {c} <span className="opacity-70">({countOf(c)})</span>
          </button>
        ))}
      </div>

      <div className="mb-6 flex flex-wrap items-center gap-3">
        <div className="relative min-w-52 flex-1 sm:max-w-xs">
          <SearchIcon
            size={18}
            className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 text-muted"
          />
          <input
            type="search"
            aria-label="Buscar item"
            placeholder="Buscar em todo o cardápio"
            className="input py-2.5 pl-10"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
          />
        </div>
        {!searching && (
          <select
            aria-label="Filtrar itens"
            className="input w-auto"
            value={view}
            onChange={(e) => setView(e.target.value as View)}
          >
            <option value="todos">Todos</option>
            <option value="indisponiveis">Só indisponíveis</option>
            <option value="destaques">Só “mais pedidos”</option>
          </select>
        )}
      </div>

      {data === null && !error && <Spinner />}

      {data && items.length === 0 && (
        <div className="card space-y-3 p-6 text-center">
          <p className="text-muted">O cardápio está vazio.</p>
          <Button
            variant="ghost"
            onClick={() =>
              void run(() => repo.menu.importMany(seed), 'Cardápio de exemplo importado.')
            }
          >
            Importar cardápio de exemplo
          </Button>
        </div>
      )}

      {data && items.length > 0 && list.length === 0 && (
        <p className="py-8 text-center text-muted">Nenhum item encontrado aqui.</p>
      )}

      <ul className="space-y-3">
        {list.map((item, index) => (
          <li
            key={item.id}
            className="card flex flex-col gap-3 p-3 sm:flex-row sm:items-center"
          >
            <div className="flex min-w-0 flex-1 items-center gap-3">
              <div className="w-20 shrink-0 overflow-hidden rounded-xl">
                <MenuImage src={item.imagem} alt="" categoria={item.categoria} />
              </div>
              <div className="min-w-0">
                <p className="truncate font-semibold">
                  {item.nome}
                  {!item.disponivel && (
                    <span className="ml-2 text-xs text-muted">(indisponível)</span>
                  )}
                </p>
                <p className="text-sm text-muted">
                  {formatPrice(item.preco)}
                  {searching && ` · ${item.categoria}`}
                  {item.adicionais.length > 0 &&
                    ` · ${item.adicionais.length} adicional(is)`}
                </p>
              </div>
            </div>
            <div className="flex flex-wrap items-center gap-x-4 gap-y-2">
              <Tip
                text="Desligue quando o produto acabar. No site ele fica esmaecido e o cliente não consegue pedir."
                side="bottom"
              >
                <label className="flex items-center gap-2 text-sm">
                  Disponível{' '}
                  <Toggle
                    label={`Disponível: ${item.nome}`}
                    checked={item.disponivel}
                    onChange={(v) =>
                      void run(() => repo.menu.patch(item.id, { disponivel: v }))
                    }
                  />
                </label>
              </Tip>
              <Tip
                text="Liga o selo “Mais pedido” no item e o coloca na vitrine “Mais pedidos” do site."
                side="bottom"
              >
                <label className="flex items-center gap-2 text-sm">
                  Mais pedido{' '}
                  <Toggle
                    label={`Mais pedido: ${item.nome}`}
                    checked={item.destaque}
                    onChange={(v) =>
                      void run(() => repo.menu.patch(item.id, { destaque: v }))
                    }
                  />
                </label>
              </Tip>
              <div className="ml-auto flex flex-wrap items-center gap-1">
                {!searching && view === 'todos' && (
                  <>
                    <Tip text="Sobe o item uma posição dentro da categoria.">
                      <button
                        type="button"
                        aria-label={`Subir ${item.nome}`}
                        disabled={index === 0}
                        onClick={() => move(index, -1)}
                        className="inline-flex h-10 items-center gap-1 rounded-full px-3 text-sm hover:bg-white/10 disabled:opacity-30"
                      >
                        <ChevronIcon dir="up" size={18} />{' '}
                        <span className="hidden sm:inline">Subir</span>
                      </button>
                    </Tip>
                    <Tip text="Desce o item uma posição dentro da categoria.">
                      <button
                        type="button"
                        aria-label={`Descer ${item.nome}`}
                        disabled={index === list.length - 1}
                        onClick={() => move(index, 1)}
                        className="inline-flex h-10 items-center gap-1 rounded-full px-3 text-sm hover:bg-white/10 disabled:opacity-30"
                      >
                        <ChevronIcon dir="down" size={18} />{' '}
                        <span className="hidden sm:inline">Descer</span>
                      </button>
                    </Tip>
                  </>
                )}
                <Tip text="Cria uma cópia deste item para você só trocar nome, preço e foto.">
                  <button
                    type="button"
                    aria-label={`Duplicar ${item.nome}`}
                    onClick={() => duplicate(item)}
                    className="inline-flex h-10 items-center gap-1.5 rounded-full px-3 text-sm hover:bg-white/10"
                  >
                    <CopyIcon size={18} />{' '}
                    <span className="hidden sm:inline">Duplicar</span>
                  </button>
                </Tip>
                <Tip text="Abre o formulário para mudar nome, descrição, preço, foto e adicionais.">
                  <Button
                    variant="ghost"
                    className="!px-4 !py-2 text-sm"
                    onClick={() => setEditing(item)}
                  >
                    Editar
                  </Button>
                </Tip>
                <Tip text="Apaga o item para sempre (pede confirmação). Para só esconder, desligue “Disponível”.">
                  <button
                    type="button"
                    aria-label={`Excluir ${item.nome}`}
                    onClick={() =>
                      window.confirm(
                        `Excluir “${item.nome}”? Isso não pode ser desfeito.`,
                      ) && void run(() => repo.menu.remove(item.id), 'Item excluído.')
                    }
                    className="inline-flex h-10 items-center gap-1.5 rounded-full px-3 text-sm text-muted hover:bg-white/10 hover:text-brand-light"
                  >
                    <TrashIcon size={18} />{' '}
                    <span className="hidden sm:inline">Excluir</span>
                  </button>
                </Tip>
              </div>
            </div>
          </li>
        ))}
      </ul>

      <ItemEditor
        item={editing}
        defaultCategory={category}
        onClose={() => setEditing(null)}
        onSave={handleSave}
      />
    </>
  )
}
