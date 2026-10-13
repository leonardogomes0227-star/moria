import { useMemo, useState } from 'react'
import { Button } from '@/components/Button'
import { Dialog } from '@/components/Dialog'
import { PlusIcon, TrashIcon } from '@/components/Icons'
import { MenuImage } from '@/components/MenuImage'
import { repo } from '@/lib/data'
import { formatPrice } from '@/lib/format'
import {
  buildContext,
  itemEconomics,
  unitCost,
  type ItemEconomics,
} from '@/lib/finance/calc'
import { importFinanceExample } from '@/lib/finance/importExample'
import {
  CATEGORIES,
  type Category,
  type FinanceSettings,
  type Ingredient,
  type MenuItem,
  type Recipe,
  type RecipeLine,
} from '@/lib/types'
import { toast } from '@/store/toast'
import { NumField } from '../fields'
import { Tip } from '../Tip'
import { ErrorBox, HelpBox, PageHeader, Spinner } from '../ui'
import { FinanceTabs } from './FinanceTabs'
import { useFinanceData } from './useFinanceData'

const pct = (n: number) => `${(n * 100).toFixed(0)}%`

type Health = 'sem' | 'baixa' | 'apertada' | 'saudavel'
function health(e: ItemEconomics, target: number): Health {
  if (!e.complete) return 'sem'
  if (e.margin >= target / 100) return 'saudavel'
  if (e.margin >= target / 200) return 'apertada'
  return 'baixa'
}
const HEALTH_UI: Record<Health, { label: string; cls: string }> = {
  sem: { label: 'Sem ficha', cls: 'bg-white/10 text-muted' },
  baixa: { label: 'Margem baixa', cls: 'bg-brand/25 text-[#FF9A9A]' },
  apertada: { label: 'Margem apertada', cls: 'bg-[#F5B83D]/20 text-[#F5B83D]' },
  saudavel: { label: 'Margem saudável', cls: 'bg-[#1FA855]/20 text-[#7BE3A2]' },
}

interface EditorProps {
  item: MenuItem
  recipe: Recipe | undefined
  menu: MenuItem[]
  ingredients: Ingredient[]
  recipes: Recipe[]
  settings: FinanceSettings
  onSaved: () => Promise<void>
  onClose: () => void
}

function RecipeEditor({
  item,
  recipe,
  menu,
  ingredients,
  recipes,
  settings,
  onSaved,
  onClose,
}: EditorProps) {
  const [lines, setLines] = useState<RecipeLine[]>(recipe?.linhas ?? [])
  const [busy, setBusy] = useState(false)

  const ingById = useMemo(() => new Map(ingredients.map((i) => [i.id, i])), [ingredients])
  const draftCtx = useMemo(
    () =>
      buildContext(ingredients, [
        ...recipes.filter((r) => r.item_id !== item.id),
        { item_id: item.id, linhas: lines },
      ]),
    [ingredients, recipes, item.id, lines],
  )
  const eco = itemEconomics(item, draftCtx, settings)
  const subItems = menu.filter((m) => m.id !== item.id)

  const setLine = (i: number, patch: Partial<RecipeLine>) =>
    setLines((ls) => ls.map((l, k) => (k === i ? { ...l, ...patch } : l)))

  const lineInfo = (l: RecipeLine) => {
    if (l.tipo === 'ingrediente') {
      const ing = ingById.get(l.ref)
      return {
        unit: ing?.unidade ?? '',
        cost: ing ? unitCost(ing) * l.qtd : 0,
        missing: !ing,
      }
    }
    const sub = menu.find((m) => m.id === l.ref)
    const c = sub ? itemEconomics(sub, draftCtx, settings).cost * l.qtd : 0
    return { unit: 'un', cost: c, missing: !sub }
  }

  const persist = async (priceToApply?: number) => {
    setBusy(true)
    try {
      await repo.finance.recipes.save({
        item_id: item.id,
        linhas: lines.filter((l) => l.ref && l.qtd > 0),
      })
      if (priceToApply !== undefined)
        await repo.menu.save(
          {
            ...item,
            preco: Math.round(priceToApply * 10) / 10,
            adicionais: item.adicionais,
          },
          0,
        )
      await onSaved()
      toast(
        priceToApply !== undefined
          ? `Ficha salva e preço atualizado para ${formatPrice(Math.round(priceToApply * 10) / 10)}.`
          : 'Ficha técnica salva.',
      )
      onClose()
    } catch (err) {
      toast(err instanceof Error ? err.message : 'Falha ao salvar.', 'error')
    } finally {
      setBusy(false)
    }
  }

  const ui = HEALTH_UI[health(eco, settings.meta_lucro_pct)]

  return (
    <div className="space-y-5 p-5">
      <p className="text-sm text-muted">
        Liste tudo que vai em <strong className="text-white">1 unidade</strong> deste
        produto. Para combos, adicione os próprios itens do cardápio.
      </p>

      <ul className="space-y-2">
        {lines.map((l, i) => {
          const info = lineInfo(l)
          return (
            <li
              key={`${l.tipo}-${l.ref}-${i}`}
              className="space-y-2 rounded-2xl border border-line bg-bg p-3"
            >
              <div>
                <label htmlFor={`rl-${i}`} className="label !mb-1 text-xs">
                  Ingrediente ou item
                </label>
                <select
                  id={`rl-${i}`}
                  className="input !py-2.5"
                  value={`${l.tipo}:${l.ref}`}
                  onChange={(e) => {
                    const [tipo, ...rest] = e.target.value.split(':')
                    setLine(i, {
                      tipo: tipo === 'item' ? 'item' : 'ingrediente',
                      ref: rest.join(':'),
                    })
                  }}
                >
                  <option value="ingrediente:">Escolha…</option>
                  <optgroup label="Ingredientes">
                    {ingredients.map((ing) => (
                      <option key={ing.id} value={`ingrediente:${ing.id}`}>
                        {ing.nome} ({ing.unidade})
                      </option>
                    ))}
                  </optgroup>
                  <optgroup label="Itens do cardápio (combos)">
                    {subItems.map((m) => (
                      <option key={m.id} value={`item:${m.id}`}>
                        {m.nome}
                      </option>
                    ))}
                  </optgroup>
                </select>
              </div>
              <div className="flex items-end gap-3">
                <NumField
                  key={`q-${i}-${l.ref}`}
                  id={`rq-${i}`}
                  label="Quantidade"
                  suffix={info.unit}
                  value={l.qtd}
                  onChange={(v) => setLine(i, { qtd: v })}
                  className="flex-1 [&_label]:text-xs"
                />
                <p
                  className="w-24 pb-3 text-right text-sm font-semibold"
                  aria-label="Custo da linha"
                >
                  {info.missing ? '—' : formatPrice(info.cost)}
                </p>
                <button
                  type="button"
                  aria-label="Remover linha"
                  onClick={() => setLines((ls) => ls.filter((_, k) => k !== i))}
                  className="mb-0.5 grid h-11 w-11 shrink-0 place-items-center rounded-full text-muted hover:bg-white/10 hover:text-brand-light"
                >
                  <TrashIcon size={18} />
                </button>
              </div>
            </li>
          )
        })}
      </ul>
      <Button
        variant="ghost"
        onClick={() =>
          setLines((ls) => [...ls, { tipo: 'ingrediente', ref: '', qtd: 1 }])
        }
      >
        <PlusIcon size={18} /> Adicionar ingrediente ou item
      </Button>

      <section
        aria-label="Resultado"
        className="rounded-2xl border border-ember/30 bg-ember/5 p-4"
      >
        <div className="flex flex-wrap items-center justify-between gap-2">
          <p className="font-semibold">Resultado por unidade</p>
          <span className={`rounded-pill px-3 py-1 text-xs font-bold ${ui.cls}`}>
            {ui.label}
          </span>
        </div>
        <dl className="mt-3 grid grid-cols-2 gap-3 text-sm sm:grid-cols-4">
          <div>
            <dt className="text-muted">Custo</dt>
            <dd className="text-lg font-bold">{formatPrice(eco.cost)}</dd>
          </div>
          <div>
            <dt className="text-muted">Preço de venda</dt>
            <dd className="text-lg font-bold">{formatPrice(eco.price)}</dd>
          </div>
          <div>
            <dt className="text-muted">Lucro por unidade</dt>
            <dd
              className={`text-lg font-bold ${eco.profit < 0 ? 'text-[#FF8A8A]' : 'text-[#4ADE80]'}`}
            >
              {formatPrice(eco.profit)}
            </dd>
          </div>
          <div>
            <dt className="text-muted">Margem</dt>
            <dd className="text-lg font-bold">{pct(eco.margin)}</dd>
          </div>
        </dl>
        <p className="mt-3 text-xs text-muted">
          Lucro já desconta impostos ({settings.imposto_pct}%) e taxa de cartão (
          {settings.taxa_cartao_pct}%). Mão de obra e despesas fixas não entram aqui: elas
          aparecem no resumo do mês.
        </p>
        {eco.suggested !== null && (
          <div className="mt-3 flex flex-wrap items-center justify-between gap-3 border-t border-line pt-3">
            <p className="text-sm">
              Para ter <strong>{settings.meta_lucro_pct}% de lucro</strong>, o preço seria{' '}
              <strong className="text-ember">{formatPrice(eco.suggested)}</strong>
              {eco.suggested > eco.price ? ' (acima do atual)' : ' (abaixo do atual)'}.
            </p>
            <Tip
              text={`Salva a ficha e troca o preço de venda do cardápio para ${formatPrice(Math.round(eco.suggested * 10) / 10)} (arredondado).`}
            >
              <Button
                variant="ghost"
                className="!px-4 !py-2 text-sm"
                disabled={busy}
                onClick={() => void persist(eco.suggested ?? undefined)}
              >
                Usar preço sugerido
              </Button>
            </Tip>
          </div>
        )}
      </section>

      <div className="flex justify-end gap-3">
        <Button variant="ghost" onClick={onClose}>
          Cancelar
        </Button>
        <Button disabled={busy} onClick={() => void persist()}>
          {busy ? 'Salvando…' : 'Salvar ficha'}
        </Button>
      </div>
    </div>
  )
}

export default function Recipes() {
  const fin = useFinanceData()
  const [category, setCategory] = useState<Category | 'Todas'>('Todas')
  const [order, setOrder] = useState<'margem' | 'nome'>('margem')
  const [editing, setEditing] = useState<MenuItem | null>(null)

  const rows = useMemo(() => {
    const list = fin.menu
      .filter((m) => category === 'Todas' || m.categoria === category)
      .map((m) => ({ item: m, eco: itemEconomics(m, fin.ctx, fin.settings) }))
    return order === 'nome'
      ? list.sort((a, b) => a.item.nome.localeCompare(b.item.nome))
      : list.sort(
          (a, b) =>
            Number(a.eco.complete) - Number(b.eco.complete) ||
            a.eco.margin - b.eco.margin,
        )
  }, [fin.menu, fin.ctx, fin.settings, category, order])

  const withoutRecipe = fin.menu.filter(
    (m) => !itemEconomics(m, fin.ctx, fin.settings).complete,
  ).length

  const importExample = async () => {
    try {
      await importFinanceExample()
      await fin.reload()
      toast('Dados de exemplo importados (valores fictícios).')
    } catch (err) {
      toast(err instanceof Error ? err.message : 'Falha ao importar.', 'error')
    }
  }

  return (
    <>
      <PageHeader
        title="Fichas técnicas"
        description="A “receita” de cada produto: do que é feito, quanto custa e quanto sobra."
      />
      <FinanceTabs />
      <HelpBox title="Passo 2: quanto custa cada produto">
        <p>
          Para cada item do cardápio, informe os ingredientes e as quantidades. O sistema
          soma tudo e mostra o <strong>custo</strong>, o{' '}
          <strong>lucro por unidade</strong> e o <strong>preço sugerido</strong> para
          atingir a sua meta de lucro.
        </p>
        <p>
          A lista começa pelos produtos <strong>sem ficha</strong> e pelos de{' '}
          <strong>pior margem</strong>: são os que mais precisam da sua atenção.
        </p>
      </HelpBox>
      {fin.error && <ErrorBox message={fin.error} onRetry={() => void fin.reload()} />}
      {!fin.loaded && !fin.error && <Spinner />}

      {fin.loaded && fin.ingredients.length === 0 && (
        <div className="card mb-6 space-y-3 p-6 text-center">
          <p className="text-muted">
            Antes das fichas, cadastre os ingredientes (passo 1).
          </p>
          <Button variant="ghost" onClick={() => void importExample()}>
            Importar exemplo de hamburgueria
          </Button>
        </div>
      )}

      {fin.loaded && fin.menu.length > 0 && (
        <>
          <div className="mb-5 flex flex-wrap items-center gap-3">
            <select
              aria-label="Categoria"
              className="input w-auto"
              value={category}
              onChange={(e) => setCategory(e.target.value as Category | 'Todas')}
            >
              <option>Todas</option>
              {CATEGORIES.map((c) => (
                <option key={c}>{c}</option>
              ))}
            </select>
            <select
              aria-label="Ordenar"
              className="input w-auto"
              value={order}
              onChange={(e) => setOrder(e.target.value as 'margem' | 'nome')}
            >
              <option value="margem">Pior margem primeiro</option>
              <option value="nome">Ordem alfabética</option>
            </select>
            {withoutRecipe > 0 && (
              <span className="text-sm text-ember">
                {withoutRecipe} produto(s) sem ficha completa
              </span>
            )}
          </div>
          <ul className="space-y-2">
            {rows.map(({ item, eco }) => {
              const ui = HEALTH_UI[health(eco, fin.settings.meta_lucro_pct)]
              return (
                <li
                  key={item.id}
                  className="card flex flex-wrap items-center gap-x-4 gap-y-2 p-3"
                >
                  <div className="flex min-w-0 flex-1 items-center gap-3">
                    <div className="w-16 shrink-0 overflow-hidden rounded-xl">
                      <MenuImage src={item.imagem} alt="" categoria={item.categoria} />
                    </div>
                    <div className="min-w-0">
                      <p className="truncate font-semibold">{item.nome}</p>
                      <p className="text-sm text-muted">
                        {eco.complete ? (
                          <>
                            Custo {formatPrice(eco.cost)} · venda{' '}
                            {formatPrice(item.preco)} · lucro{' '}
                            <strong
                              className={eco.profit < 0 ? 'text-[#FF8A8A]' : 'text-white'}
                            >
                              {formatPrice(eco.profit)}
                            </strong>{' '}
                            ({pct(eco.margin)})
                          </>
                        ) : (
                          <>Venda {formatPrice(item.preco)} · custo não calculado</>
                        )}
                      </p>
                    </div>
                  </div>
                  <span className={`rounded-pill px-3 py-1 text-xs font-bold ${ui.cls}`}>
                    {ui.label}
                  </span>
                  <Tip
                    text="Abre a ficha: ingredientes, custo, lucro e preço sugerido deste produto."
                    side="bottom"
                  >
                    <Button
                      variant="ghost"
                      className="!px-4 !py-2 text-sm"
                      onClick={() => setEditing(item)}
                    >
                      {eco.complete ? 'Editar ficha' : 'Montar ficha'}
                    </Button>
                  </Tip>
                </li>
              )
            })}
          </ul>
        </>
      )}

      <Dialog
        open={editing !== null}
        onClose={() => setEditing(null)}
        title={editing ? `Ficha: ${editing.nome}` : 'Ficha técnica'}
      >
        {editing && (
          <RecipeEditor
            key={editing.id}
            item={editing}
            recipe={fin.recipes.find((r) => r.item_id === editing.id)}
            menu={fin.menu}
            ingredients={fin.ingredients}
            recipes={fin.recipes}
            settings={fin.settings}
            onSaved={fin.reload}
            onClose={() => setEditing(null)}
          />
        )}
      </Dialog>
    </>
  )
}
