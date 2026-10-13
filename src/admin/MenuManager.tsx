import { useCallback, useEffect, useState } from 'react'
import { Button } from '@/components/Button'
import { ChevronIcon, PlusIcon, TrashIcon } from '@/components/Icons'
import { MenuImage } from '@/components/MenuImage'
import { menuItems as seed } from '@/data/menu'
import {
  deleteItem,
  importItems,
  listMenu,
  patchItem,
  saveItem,
  swapOrder,
  type MenuDraft,
} from '@/lib/adminApi'
import { formatPrice } from '@/lib/format'
import { CATEGORIES, type Category, type MenuItem } from '@/lib/types'
import { ItemEditor } from './ItemEditor'

function Toggle({
  checked,
  onChange,
  label,
}: {
  checked: boolean
  onChange: (v: boolean) => void
  label: string
}) {
  return (
    <button
      type="button"
      role="switch"
      aria-checked={checked}
      aria-label={label}
      onClick={() => onChange(!checked)}
      className={`relative h-7 w-12 shrink-0 rounded-full transition-colors ${checked ? 'bg-brand' : 'bg-white/15'}`}
    >
      <span
        className={`absolute top-1 h-5 w-5 rounded-full bg-white transition-all ${checked ? 'left-6' : 'left-1'}`}
      />
    </button>
  )
}

export function MenuManager() {
  const [items, setItems] = useState<MenuItem[] | null>(null)
  const [error, setError] = useState('')
  const [category, setCategory] = useState<Category>(CATEGORIES[0])
  const [editing, setEditing] = useState<MenuItem | 'new' | null>(null)

  const refresh = useCallback(async () => {
    try {
      setItems(await listMenu())
      setError('')
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Falha ao carregar o cardápio.')
    }
  }, [])

  useEffect(() => {
    let cancelled = false
    listMenu()
      .then((data) => !cancelled && setItems(data))
      .catch(
        (err: unknown) =>
          !cancelled &&
          setError(err instanceof Error ? err.message : 'Falha ao carregar o cardápio.'),
      )
    return () => {
      cancelled = true
    }
  }, [])

  const run = async (action: () => Promise<void>) => {
    try {
      await action()
      await refresh()
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Operação falhou.')
    }
  }

  const list = (items ?? []).filter((i) => i.categoria === category)
  const nextOrder = Math.max(-1, ...(items ?? []).map((i) => i.ordem ?? 0)) + 1

  const move = (index: number, delta: -1 | 1) => {
    const other = list[index + delta]
    if (other) void run(() => swapOrder(list[index], other))
  }

  const handleSave = async (draft: MenuDraft) => {
    await saveItem(draft, nextOrder)
    setEditing(null)
    await refresh()
  }

  return (
    <div className="space-y-5">
      {error && (
        <p
          role="alert"
          className="rounded-xl border border-brand/50 bg-brand/10 px-4 py-3 text-sm text-[#FF8A8A]"
        >
          {error}
        </p>
      )}

      <div className="flex flex-wrap items-center justify-between gap-3">
        <div
          role="tablist"
          aria-label="Categorias"
          className="scrollbar-none -mx-1 flex gap-2 overflow-x-auto px-1"
        >
          {CATEGORIES.map((c) => (
            <button
              key={c}
              role="tab"
              type="button"
              aria-selected={c === category}
              onClick={() => setCategory(c)}
              className={`shrink-0 rounded-pill px-4 py-2 text-sm font-semibold ${c === category ? 'bg-brand' : 'bg-white/5 hover:bg-white/10'}`}
            >
              {c}
            </button>
          ))}
        </div>
        <Button onClick={() => setEditing('new')}>
          <PlusIcon size={18} /> Novo item
        </Button>
      </div>

      {items === null && !error && <p className="text-muted">Carregando…</p>}

      {items?.length === 0 && (
        <div className="card space-y-3 p-6 text-center">
          <p className="text-muted">
            O cardápio do banco está vazio (o site mostra o exemplo de src/data/menu.ts).
          </p>
          <Button variant="ghost" onClick={() => void run(() => importItems(seed))}>
            Importar cardápio de exemplo
          </Button>
        </div>
      )}

      {items && items.length > 0 && list.length === 0 && (
        <p className="py-8 text-center text-muted">Nenhum item nesta categoria.</p>
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
                <p className="truncate font-semibold">{item.nome}</p>
                <p className="text-sm text-muted">{formatPrice(item.preco)}</p>
              </div>
            </div>
            <div className="flex flex-wrap items-center gap-x-4 gap-y-2">
              <label className="flex items-center gap-2 text-sm">
                Disponível{' '}
                <Toggle
                  label={`Disponível: ${item.nome}`}
                  checked={item.disponivel}
                  onChange={(v) => void run(() => patchItem(item.id, { disponivel: v }))}
                />
              </label>
              <label className="flex items-center gap-2 text-sm">
                Destaque{' '}
                <Toggle
                  label={`Mais pedido: ${item.nome}`}
                  checked={item.destaque}
                  onChange={(v) => void run(() => patchItem(item.id, { destaque: v }))}
                />
              </label>
              <div className="ml-auto flex items-center gap-1">
                <button
                  type="button"
                  aria-label={`Subir ${item.nome}`}
                  disabled={index === 0}
                  onClick={() => move(index, -1)}
                  className="grid h-10 w-10 place-items-center rounded-full hover:bg-white/10 disabled:opacity-30"
                >
                  <ChevronIcon dir="up" size={20} />
                </button>
                <button
                  type="button"
                  aria-label={`Descer ${item.nome}`}
                  disabled={index === list.length - 1}
                  onClick={() => move(index, 1)}
                  className="grid h-10 w-10 place-items-center rounded-full hover:bg-white/10 disabled:opacity-30"
                >
                  <ChevronIcon dir="down" size={20} />
                </button>
                <Button
                  variant="ghost"
                  className="!px-4 !py-2 text-sm"
                  onClick={() => setEditing(item)}
                >
                  Editar
                </Button>
                <button
                  type="button"
                  aria-label={`Excluir ${item.nome}`}
                  onClick={() =>
                    window.confirm(`Excluir “${item.nome}”?`) &&
                    void run(() => deleteItem(item.id))
                  }
                  className="grid h-10 w-10 place-items-center rounded-full text-muted hover:bg-white/10 hover:text-brand-light"
                >
                  <TrashIcon size={18} />
                </button>
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
    </div>
  )
}
