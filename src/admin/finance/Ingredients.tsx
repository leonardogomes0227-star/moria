import { useMemo, useState, type FormEvent } from 'react'
import { Button } from '@/components/Button'
import { Dialog } from '@/components/Dialog'
import { PlusIcon, SearchIcon, TrashIcon } from '@/components/Icons'
import { repo } from '@/lib/data'
import { formatPrice } from '@/lib/format'
import { importFinanceExample } from '@/lib/finance/importExample'
import { unitCost } from '@/lib/finance/calc'
import {
  INGREDIENT_GROUPS,
  UNITS,
  type Ingredient,
  type IngredientGroup,
  type Unit,
} from '@/lib/types'
import { toast } from '@/store/toast'
import { NumField } from '../fields'
import { fmtNum } from '../numbers'
import { Tip } from '../Tip'
import { ErrorBox, HelpBox, PageHeader, Spinner } from '../ui'
import { FinanceTabs } from './FinanceTabs'
import { useFinanceData } from './useFinanceData'

type Draft = Omit<Ingredient, 'id'> & { id?: string }
const blank: Draft = {
  nome: '',
  grupo: 'Outros',
  unidade: 'un',
  preco_compra: 0,
  qtd_compra: 1,
  estoque: 0,
  estoque_min: 0,
}

/** Custo por unidade com casas suficientes para valores pequenos (ex.: R$ 0,0420 por g). */
const money = (n: number) => `R$ ${n.toFixed(n < 1 ? 4 : 2).replace('.', ',')}`

function IngredientForm({
  initial,
  onSave,
  onClose,
}: {
  initial: Draft
  onSave: (d: Draft) => Promise<void>
  onClose: () => void
}) {
  const [d, setD] = useState(initial)
  const [busy, setBusy] = useState(false)
  const per = unitCost(d)
  const submit = async (e: FormEvent) => {
    e.preventDefault()
    if (!d.nome.trim()) return toast('Dê um nome ao ingrediente.', 'error')
    if (d.qtd_compra <= 0)
      return toast('A quantidade comprada precisa ser maior que zero.', 'error')
    setBusy(true)
    try {
      await onSave({ ...d, nome: d.nome.trim() })
    } finally {
      setBusy(false)
    }
  }
  return (
    <form onSubmit={submit} className="space-y-4 p-5">
      <div>
        <label htmlFor="ig-nome" className="label">
          Nome
        </label>
        <input
          id="ig-nome"
          className="input"
          value={d.nome}
          onChange={(e) => setD({ ...d, nome: e.target.value })}
          placeholder="Ex.: Queijo prato fatiado"
          required
        />
      </div>
      <div className="grid grid-cols-2 gap-3">
        <div>
          <label htmlFor="ig-grupo" className="label">
            Grupo
          </label>
          <select
            id="ig-grupo"
            className="input"
            value={d.grupo}
            onChange={(e) => setD({ ...d, grupo: e.target.value as IngredientGroup })}
          >
            {INGREDIENT_GROUPS.map((g) => (
              <option key={g}>{g}</option>
            ))}
          </select>
        </div>
        <div>
          <label htmlFor="ig-un" className="label">
            Unidade de uso
          </label>
          <select
            id="ig-un"
            className="input"
            value={d.unidade}
            onChange={(e) => setD({ ...d, unidade: e.target.value as Unit })}
          >
            {UNITS.map((u) => (
              <option key={u}>{u}</option>
            ))}
          </select>
        </div>
      </div>
      <fieldset className="rounded-2xl border border-line bg-bg p-4">
        <legend className="px-2 text-sm font-semibold text-ember">Quanto custa?</legend>
        <div className="grid grid-cols-2 gap-3">
          <NumField
            id="ig-preco"
            label="Quanto você pagou"
            prefix="R$"
            value={d.preco_compra}
            onChange={(v) => setD({ ...d, preco_compra: v })}
          />
          <NumField
            id="ig-qtd"
            label={`Quantas ${d.unidade} vieram`}
            value={d.qtd_compra}
            onChange={(v) => setD({ ...d, qtd_compra: v })}
          />
        </div>
        <p className="mt-3 text-sm" aria-live="polite">
          Custo de cada {d.unidade}:{' '}
          <strong className="text-ember">{d.qtd_compra > 0 ? money(per) : '—'}</strong>
        </p>
        <p className="mt-1 text-xs text-muted">
          Ex.: pagou R$ 130 por uma caixa com 20 blends → cada blend custa R$ 6,50.
        </p>
      </fieldset>
      <div className="grid grid-cols-2 gap-3">
        <NumField
          id="ig-est"
          label="Estoque atual"
          suffix={d.unidade}
          value={d.estoque}
          onChange={(v) => setD({ ...d, estoque: v })}
        />
        <NumField
          id="ig-min"
          label="Avisar abaixo de"
          suffix={d.unidade}
          value={d.estoque_min}
          onChange={(v) => setD({ ...d, estoque_min: v })}
          hint="Estoque mínimo para o alerta."
        />
      </div>
      <div className="flex justify-end gap-3">
        <Button variant="ghost" onClick={onClose}>
          Cancelar
        </Button>
        <Button type="submit" disabled={busy}>
          {busy ? 'Salvando…' : 'Salvar'}
        </Button>
      </div>
    </form>
  )
}

export default function Ingredients() {
  const fin = useFinanceData()
  const [editing, setEditing] = useState<Ingredient | 'new' | null>(null)
  const [query, setQuery] = useState('')
  const [onlyLow, setOnlyLow] = useState(false)

  const list = useMemo(() => {
    const q = query.trim().toLowerCase()
    return fin.ingredients
      .filter(
        (i) =>
          (!q || i.nome.toLowerCase().includes(q)) &&
          (!onlyLow || (i.estoque_min > 0 && i.estoque <= i.estoque_min)),
      )
      .sort((a, b) => a.grupo.localeCompare(b.grupo) || a.nome.localeCompare(b.nome))
  }, [fin.ingredients, query, onlyLow])

  const run = async (action: () => Promise<void>, ok: string) => {
    try {
      await action()
      await fin.reload()
      toast(ok)
    } catch (err) {
      toast(err instanceof Error ? err.message : 'Operação falhou.', 'error')
    }
  }

  const usedIn = (id: string) =>
    fin.recipes.filter((r) =>
      r.linhas.some((l) => l.tipo === 'ingrediente' && l.ref === id),
    ).length

  return (
    <>
      <PageHeader
        title="Ingredientes"
        description="Tudo que você compra para fazer os produtos: carnes, pães, queijos, molhos, embalagens…"
        actions={
          <Tip
            text="Cadastra um ingrediente novo informando quanto pagou e quantas unidades vieram."
            side="bottom"
          >
            <Button onClick={() => setEditing('new')}>
              <PlusIcon size={18} /> Novo ingrediente
            </Button>
          </Tip>
        }
      />
      <FinanceTabs />
      <HelpBox title="Passo 1: o que você compra">
        <p>
          Cadastre cada ingrediente com o <strong>preço que pagou</strong> e a{' '}
          <strong>quantidade que veio</strong>. O sistema calcula sozinho o custo de cada
          unidade (ou grama, ou fatia).
        </p>
        <p>
          Inclua também as <strong>embalagens</strong> (caixa, sacola, guardanapo): elas
          entram no custo do produto. Quando o preço do fornecedor mudar, é só editar aqui
          e todas as fichas se atualizam.
        </p>
      </HelpBox>
      {fin.error && <ErrorBox message={fin.error} onRetry={() => void fin.reload()} />}
      {!fin.loaded && !fin.error && <Spinner />}

      {fin.loaded && fin.ingredients.length === 0 && (
        <div className="card mb-6 space-y-3 p-6 text-center">
          <p className="text-muted">Nenhum ingrediente cadastrado ainda.</p>
          <Button
            variant="ghost"
            onClick={() =>
              void run(
                importFinanceExample,
                'Dados de exemplo importados (valores fictícios).',
              )
            }
          >
            Importar exemplo de hamburgueria
          </Button>
        </div>
      )}

      {fin.ingredients.length > 0 && (
        <div className="mb-5 flex flex-wrap items-center gap-3">
          <div className="relative min-w-52 flex-1 sm:max-w-xs">
            <SearchIcon
              size={18}
              className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 text-muted"
            />
            <input
              type="search"
              aria-label="Buscar ingrediente"
              placeholder="Buscar ingrediente"
              className="input py-2.5 pl-10"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
            />
          </div>
          <label className="flex items-center gap-2 text-sm">
            <input
              type="checkbox"
              className="h-5 w-5 accent-[#D61F1F]"
              checked={onlyLow}
              onChange={(e) => setOnlyLow(e.target.checked)}
            />{' '}
            Só estoque baixo
          </label>
        </div>
      )}

      <ul className="space-y-2">
        {list.map((i) => {
          const low = i.estoque_min > 0 && i.estoque <= i.estoque_min
          return (
            <li
              key={i.id}
              className="card flex flex-wrap items-center gap-x-4 gap-y-2 p-4"
            >
              <div className="min-w-0 flex-1">
                <p className="truncate font-semibold">{i.nome}</p>
                <p className="text-sm text-muted">
                  {i.grupo} · {formatPrice(i.preco_compra)} por {fmtNum(i.qtd_compra)}{' '}
                  {i.unidade} ·{' '}
                  <strong className="text-white">
                    {money(unitCost(i))}/{i.unidade}
                  </strong>
                  {usedIn(i.id) > 0 && ` · usado em ${usedIn(i.id)} ficha(s)`}
                </p>
              </div>
              <span
                className={`rounded-pill px-3 py-1 text-xs font-bold ${low ? 'bg-brand/25 text-[#FF9A9A]' : 'bg-white/10 text-white/80'}`}
              >
                Estoque: {fmtNum(i.estoque)} {i.unidade}
                {low ? ' · baixo' : ''}
              </span>
              <div className="flex gap-1">
                <Button
                  variant="ghost"
                  className="!px-4 !py-2 text-sm"
                  onClick={() => setEditing(i)}
                >
                  Editar
                </Button>
                <Tip
                  text="Apaga o ingrediente. As fichas que usam ele ficam incompletas."
                  side="bottom"
                >
                  <button
                    type="button"
                    aria-label={`Excluir ${i.nome}`}
                    onClick={() =>
                      window.confirm(
                        `Excluir “${i.nome}”?${usedIn(i.id) ? ` Ele é usado em ${usedIn(i.id)} ficha(s).` : ''}`,
                      ) &&
                      void run(
                        () => repo.finance.ingredients.remove(i.id),
                        'Ingrediente excluído.',
                      )
                    }
                    className="inline-flex h-10 items-center gap-1.5 rounded-full px-3 text-sm text-muted hover:bg-white/10 hover:text-brand-light"
                  >
                    <TrashIcon size={18} />{' '}
                    <span className="hidden sm:inline">Excluir</span>
                  </button>
                </Tip>
              </div>
            </li>
          )
        })}
      </ul>

      <Dialog
        open={editing !== null}
        onClose={() => setEditing(null)}
        title={editing === 'new' ? 'Novo ingrediente' : 'Editar ingrediente'}
        variant="center"
      >
        {editing && (
          <IngredientForm
            key={editing === 'new' ? 'new' : editing.id}
            initial={editing === 'new' ? blank : editing}
            onClose={() => setEditing(null)}
            onSave={async (d) => {
              await repo.finance.ingredients.save(d)
              setEditing(null)
              await fin.reload()
              toast('Ingrediente salvo.')
            }}
          />
        )}
      </Dialog>
    </>
  )
}
