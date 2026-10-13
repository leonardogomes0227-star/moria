import { useMemo, useState } from 'react'
import { Link, useOutletContext } from 'react-router-dom'
import { Button } from '@/components/Button'
import { DownloadIcon } from '@/components/Icons'
import { config } from '@/lib/config'
import { formatPrice } from '@/lib/format'
import { lowStock, monthKey, recentMonths, summarizePeriod } from '@/lib/finance/calc'
import { toast } from '@/store/toast'
import type { AdminContext } from '../AdminLayout'
import { Tip } from '../Tip'
import { Card, ErrorBox, HelpBox, PageHeader, Spinner } from '../ui'
import { FinanceTabs } from './FinanceTabs'
import { useFinanceData } from './useFinanceData'

const COLORS = ['#D61F1F', '#FF6A1A', '#F5B83D', '#4F8FF7', '#9B7BFF', '#2FBF71']
const pct = (n: number) => `${(n * 100).toFixed(1).replace('.', ',')}%`
const monthLabel = (m: string) => {
  const [y, mo] = m.split('-').map(Number)
  const name = new Date(y, mo - 1, 1).toLocaleDateString('pt-BR', { month: 'long' })
  return `${name.charAt(0).toUpperCase()}${name.slice(1)} de ${y}`
}

function Kpi({
  label,
  value,
  hint,
  tone,
}: {
  label: string
  value: string
  hint: string
  tone?: 'good' | 'bad'
}) {
  return (
    <div className="card h-full p-5">
      <p className="text-sm text-muted">{label}</p>
      <p
        className={`mt-1 whitespace-nowrap text-2xl font-extrabold sm:text-3xl ${tone === 'good' ? 'text-[#4ADE80]' : tone === 'bad' ? 'text-[#FF8A8A]' : ''}`}
      >
        {value}
      </p>
      <p className="mt-1 text-xs text-muted">{hint}</p>
    </div>
  )
}

function download(name: string, content: string) {
  const blob = new Blob([String.fromCharCode(0xfeff) + content], {
    type: 'text/csv;charset=utf-8',
  })
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = name
  a.click()
  URL.revokeObjectURL(url)
}

export default function Summary() {
  const { orders } = useOutletContext<AdminContext>()
  const fin = useFinanceData()
  const months = useMemo(() => recentMonths(new Date(), config.timezone, 6), [])
  const [month, setMonth] = useState(months[0])

  const sum = useMemo(
    () =>
      summarizePeriod({
        month,
        now: new Date(),
        timeZone: config.timezone,
        orders,
        menu: fin.menu,
        ctx: fin.ctx,
        expenses: fin.expenses,
        staff: fin.staff,
        settings: fin.settings,
      }),
    [month, orders, fin.menu, fin.ctx, fin.expenses, fin.staff, fin.settings],
  )
  const low = lowStock(fin.ingredients)
  const totalBar = Math.max(sum.totalCosts, 1)

  const exportCsv = () => {
    const rows = [
      ['Demonstrativo', monthLabel(month)],
      ['Faturamento (itens)', sum.itemsRevenue.toFixed(2)],
      ['Taxa de entrega recebida', sum.deliveryIncome.toFixed(2)],
      ['Faturamento total', sum.revenue.toFixed(2)],
      ...sum.breakdown.map((b) => [`(-) ${b.label}`, b.value.toFixed(2)]),
      ['Lucro', sum.profit.toFixed(2)],
      [],
      ['Pedido', 'Data', 'Origem', 'Tipo', 'Pagamento', 'Situação', 'Total'],
      ...orders

        .filter((o) => monthKey(o.criado_em, config.timezone) === month)
        .map((o) => [
          String(o.numero),
          o.criado_em,
          o.origem,
          o.tipo,
          o.pagamento,
          o.status,
          o.total.toFixed(2),
        ]),
    ]
    download(
      `moria-financeiro-${month}.csv`,
      rows.map((r) => r.map((c) => `"${c.replace(/"/g, '""')}"`).join(';')).join('\n'),
    )
    toast('Planilha baixada. Abra no Excel ou no Google Planilhas.')
  }

  const empty = fin.loaded && fin.ingredients.length === 0 && fin.recipes.length === 0
  const reached = sum.breakEven !== null && sum.revenue >= sum.breakEven

  return (
    <>
      <PageHeader
        title="Custos e lucro"
        description="Quanto entrou, quanto custou e quanto sobrou de verdade no mês."
        actions={
          <div className="flex flex-wrap items-center gap-2">
            <select
              aria-label="Mês"
              className="input w-auto"
              value={month}
              onChange={(e) => setMonth(e.target.value)}
            >
              {months.map((m) => (
                <option key={m} value={m}>
                  {monthLabel(m)}
                </option>
              ))}
            </select>
            <Tip
              text="Baixa uma planilha (CSV) com o resumo do mês e a lista de pedidos, para abrir no Excel ou mandar ao contador."
              side="bottom"
            >
              <Button
                variant="ghost"
                onClick={exportCsv}
                className="!px-4 !py-2.5 text-sm"
              >
                <DownloadIcon size={18} /> Baixar planilha
              </Button>
            </Tip>
          </div>
        }
      />
      <FinanceTabs />
      <HelpBox title="Como ler esta tela">
        <p>
          <strong>Faturamento</strong> é tudo que os clientes pagaram (itens + taxa de
          entrega), sem contar pedidos cancelados. <strong>Lucro</strong> é o que sobra
          depois de pagar ingredientes, equipe, motoboy, despesas, impostos e taxa de
          cartão.
        </p>
        <p>
          Para o lucro ficar certo, preencha os passos <strong>1 a 5</strong> acima:
          ingredientes, fichas técnicas, despesas e equipe.{' '}
          {sum.prorate < 1 &&
            sum.prorate > 0 &&
            'No mês corrente, os custos fixos são divididos pelos dias que já passaram.'}
        </p>
      </HelpBox>
      {fin.error && <ErrorBox message={fin.error} onRetry={() => void fin.reload()} />}
      {!fin.loaded && !fin.error && <Spinner />}
      {empty && (
        <p className="mb-6 rounded-2xl border border-ember/40 bg-ember/10 p-4 text-sm">
          Ainda não há ingredientes nem fichas técnicas cadastrados, então o custo dos
          produtos aparece como zero. Comece pelo passo{' '}
          <Link
            to="/admin/custos/ingredientes"
            className="font-semibold text-ember underline"
          >
            1. Ingredientes
          </Link>
          .
        </p>
      )}

      {fin.loaded && (
        <>
          <div className="mb-6 grid grid-cols-2 gap-3 lg:grid-cols-4">
            <Kpi
              label="Faturamento"
              value={formatPrice(sum.revenue)}
              hint={`${sum.orders} pedidos no mês`}
            />
            <Kpi
              label="Custos totais"
              value={formatPrice(sum.totalCosts)}
              hint={
                sum.revenue > 0
                  ? `${pct(sum.totalCosts / sum.revenue)} do faturamento`
                  : 'Sem vendas ainda'
              }
            />
            <Kpi
              label="Lucro do mês"
              value={formatPrice(sum.profit)}
              hint={`Margem líquida: ${pct(sum.margin)}`}
              tone={sum.profit >= 0 ? 'good' : 'bad'}
            />
            <Kpi
              label="Ponto de equilíbrio"
              value={sum.breakEven === null ? '—' : formatPrice(sum.breakEven)}
              hint={
                sum.breakEven === null
                  ? 'Precisa de vendas e fichas'
                  : reached
                    ? 'Já passou: a partir daqui é lucro'
                    : `Faltam ${formatPrice(sum.breakEven - sum.revenue)} em vendas`
              }
              tone={sum.breakEven === null ? undefined : reached ? 'good' : undefined}
            />
          </div>

          <div className="mb-6 grid gap-4 lg:grid-cols-5">
            <div className="lg:col-span-3">
              <Card
                title="Para onde foi o dinheiro"
                description="Cada faixa é uma parte dos custos do mês."
              >
                {sum.totalCosts === 0 ? (
                  <p className="text-sm text-muted">Nenhum custo registrado ainda.</p>
                ) : (
                  <>
                    <div
                      className="flex h-5 overflow-hidden rounded-full bg-white/10"
                      role="img"
                      aria-label={`Custos: ${sum.breakdown.map((b) => `${b.label} ${formatPrice(b.value)}`).join(', ')}`}
                    >
                      {sum.breakdown.map((b, i) => (
                        <span
                          key={b.label}
                          style={{
                            width: `${(b.value / totalBar) * 100}%`,
                            background: COLORS[i],
                          }}
                        />
                      ))}
                    </div>
                    <ul className="mt-5 space-y-2.5">
                      {sum.breakdown.map((b, i) => (
                        <li key={b.label} className="flex items-center gap-3 text-sm">
                          <span
                            className="h-3 w-3 shrink-0 rounded-full"
                            style={{ background: COLORS[i] }}
                          />
                          <span className="flex-1">{b.label}</span>
                          <span className="text-muted">
                            {sum.revenue > 0 ? pct(b.value / sum.revenue) : '—'}
                          </span>
                          <span className="w-28 text-right font-semibold">
                            {formatPrice(b.value)}
                          </span>
                        </li>
                      ))}
                    </ul>
                  </>
                )}
              </Card>
            </div>
            <div className="space-y-4 lg:col-span-2">
              <Card title="Atenção" description="O que pode estar distorcendo o lucro.">
                <ul className="space-y-2 text-sm">
                  {sum.unitsWithoutRecipe > 0 && (
                    <li className="rounded-xl border border-ember/40 bg-ember/10 p-3">
                      <strong>
                        {sum.unitsWithoutRecipe} unidades vendidas sem ficha técnica
                      </strong>
                      : o custo delas não entrou na conta.{' '}
                      <Link
                        to="/admin/custos/fichas"
                        className="font-semibold text-ember underline"
                      >
                        Montar fichas
                      </Link>
                    </li>
                  )}
                  {low.length > 0 && (
                    <li className="rounded-xl border border-brand/40 bg-brand/10 p-3">
                      <strong>{low.length} ingredientes com estoque baixo</strong> (
                      {low
                        .slice(0, 3)
                        .map((i) => i.nome)
                        .join(', ')}
                      {low.length > 3 ? '…' : ''}).{' '}
                      <Link
                        to="/admin/custos/ingredientes"
                        className="font-semibold text-ember underline"
                      >
                        Ver estoque
                      </Link>
                    </li>
                  )}
                  {sum.profit < 0 && sum.orders > 0 && (
                    <li className="rounded-xl border border-brand/40 bg-brand/10 p-3">
                      <strong>Lucro negativo no período.</strong> Veja se os preços cobrem
                      o custo em{' '}
                      <Link
                        to="/admin/custos/fichas"
                        className="font-semibold text-ember underline"
                      >
                        Fichas técnicas
                      </Link>
                      .
                    </li>
                  )}
                  {sum.unitsWithoutRecipe === 0 &&
                    low.length === 0 &&
                    !(sum.profit < 0 && sum.orders > 0) && (
                      <li className="text-muted">Tudo certo por aqui.</li>
                    )}
                </ul>
              </Card>
              <Card
                title="Produtos que mais deram lucro"
                description="Vendas menos o custo de ingredientes."
              >
                {sum.topProfit.length === 0 ? (
                  <p className="text-sm text-muted">Sem vendas no mês.</p>
                ) : (
                  <ol className="space-y-2 text-sm">
                    {sum.topProfit.map((t) => (
                      <li key={t.nome} className="flex justify-between gap-2">
                        <span className="truncate">
                          {t.nome} <span className="text-muted">· {t.qtd} un.</span>
                        </span>
                        <span className="font-semibold">{formatPrice(t.profit)}</span>
                      </li>
                    ))}
                  </ol>
                )}
              </Card>
            </div>
          </div>

          <Card
            title="Demonstrativo do mês (DRE simples)"
            description="É a conta que o contador faz: tudo que entrou menos tudo que saiu."
          >
            <dl className="divide-y divide-line text-sm">
              <Row label="Vendas dos itens" value={sum.itemsRevenue} />
              <Row
                label="Taxa de entrega recebida dos clientes"
                value={sum.deliveryIncome}
              />
              <Row label="Faturamento total" value={sum.revenue} strong />
              {sum.breakdown.map((b) => (
                <Row key={b.label} label={`(−) ${b.label}`} value={-b.value} muted />
              ))}
              <Row
                label="Lucro do mês"
                value={sum.profit}
                strong
                tone={sum.profit >= 0 ? 'good' : 'bad'}
              />
            </dl>
            <p className="mt-3 text-xs text-muted">
              Custos fixos do mês cheio: {formatPrice(sum.fixedMonthly)}.{' '}
              {sum.prorate < 1 && sum.prorate > 0
                ? `Aqui entram ${(sum.prorate * 100).toFixed(0)}% (dias já passados).`
                : ''}
            </p>
          </Card>
        </>
      )}
    </>
  )
}

function Row({
  label,
  value,
  strong,
  muted,
  tone,
}: {
  label: string
  value: number
  strong?: boolean
  muted?: boolean
  tone?: 'good' | 'bad'
}) {
  return (
    <div
      className={`flex justify-between gap-3 py-2.5 ${strong ? 'font-bold' : ''} ${muted ? 'text-muted' : ''}`}
    >
      <dt>{label}</dt>
      <dd
        className={
          tone === 'good' ? 'text-[#4ADE80]' : tone === 'bad' ? 'text-[#FF8A8A]' : ''
        }
      >
        {formatPrice(value)}
      </dd>
    </div>
  )
}
