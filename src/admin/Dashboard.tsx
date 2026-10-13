import { Link, useOutletContext } from 'react-router-dom'
import { OpenBadge } from '@/components/OpenBadge'
import { useOpenNow } from '@/hooks/useOpenNow'
import { repo } from '@/lib/data'
import { formatPrice } from '@/lib/format'
import { toast } from '@/store/toast'
import { useSettings } from '@/store/settings'
import type { AdminContext } from './AdminLayout'
import { summarize } from './stats'
import { Tip } from './Tip'
import { Card, ErrorBox, PageHeader, StatusBadge, Toggle } from './ui'

function Metric({
  label,
  value,
  hint,
  to,
}: {
  label: string
  value: string
  hint: string
  to?: string
}) {
  const body = (
    <div className="card h-full p-5 transition-colors hover:border-brand/50">
      <p className="text-sm text-muted">{label}</p>
      <p className="mt-1 font-display text-3xl font-bold">{value}</p>
      <p className="mt-1 text-xs text-muted">{hint}</p>
    </div>
  )
  return to ? <Link to={to}>{body}</Link> : body
}

function WeekChart({ days }: { days: ReturnType<typeof summarize>['last7'] }) {
  const max = Math.max(1, ...days.map((d) => d.total))
  return (
    <div
      role="img"
      aria-label={`Vendas dos últimos 7 dias: ${days.map((d) => `${d.label} ${formatPrice(d.total)}`).join(', ')}`}
    >
      <div className="flex h-44 items-end gap-2 sm:gap-3">
        {days.map((d) => (
          <div
            key={d.key}
            className="flex h-full flex-1 flex-col items-center justify-end gap-1.5"
          >
            <span className="text-[11px] text-muted sm:text-xs">
              {d.total > 0 ? formatPrice(d.total).replace('R$ ', '') : '–'}
            </span>
            <div
              className="w-full rounded-t-lg bg-brand-gradient"
              style={{
                height: `${Math.max(4, (d.total / max) * 100)}%`,
                opacity: d.total > 0 ? 1 : 0.25,
              }}
            />
          </div>
        ))}
      </div>
      <div className="mt-2 flex gap-2 sm:gap-3">
        {days.map((d) => (
          <span key={d.key} className="flex-1 text-center text-xs capitalize text-muted">
            {d.label}
          </span>
        ))}
      </div>
    </div>
  )
}

export default function Dashboard() {
  const { orders, ordersError, reloadOrders } = useOutletContext<AdminContext>()
  const settings = useSettings((s) => s.settings)
  const setSettings = useSettings((s) => s.setSettings)
  const { open } = useOpenNow()
  const stats = summarize(orders)
  const recent = orders.slice(0, 5)

  const togglePause = async (receiving: boolean) => {
    const next = { ...settings, paused: !receiving }
    try {
      await repo.settings.save(next)
      setSettings({ paused: next.paused })
      toast(receiving ? 'Pedidos pelo site liberados.' : 'Pedidos pelo site pausados.')
    } catch (err) {
      toast(err instanceof Error ? err.message : 'Não foi possível salvar.', 'error')
    }
  }

  return (
    <>
      <PageHeader
        title="Visão geral"
        description="Resumo do dia da sua hamburgueria: pedidos, faturamento e o que mais está saindo."
      />
      {ordersError && (
        <ErrorBox message={ordersError} onRetry={() => void reloadOrders()} />
      )}

      <div className="mb-6 flex flex-wrap items-center justify-between gap-4 rounded-card border border-line bg-surface p-5">
        <div className="space-y-1">
          <p className="flex items-center gap-3 text-lg font-semibold">
            Loja <OpenBadge />
          </p>
          <p className="max-w-lg text-sm text-muted">
            {settings.paused
              ? 'Os pedidos pelo site estão PAUSADOS: os clientes veem um aviso e não conseguem finalizar.'
              : open
                ? 'Dentro do horário de funcionamento. Os clientes conseguem fazer pedidos normalmente.'
                : 'Fora do horário configurado. O site mostra “Fechado”, mas ainda aceita pedidos (você decide se atende).'}
          </p>
        </div>
        <Tip
          text="Desligue para pausar os pedidos pelo site na hora (ex.: cozinha lotada). O cliente vê um aviso. Ligue de novo quando normalizar."
          side="bottom"
        >
          <label className="flex items-center gap-3 text-sm font-medium">
            Receber pedidos pelo site
            <Toggle
              label="Receber pedidos pelo site"
              checked={!settings.paused}
              onChange={(v) => void togglePause(v)}
            />
          </label>
        </Tip>
      </div>

      <div className="mb-6 grid grid-cols-2 gap-3 lg:grid-cols-4">
        <Metric
          label="Pedidos hoje"
          value={String(stats.todayCount)}
          hint="Sem contar os cancelados"
        />
        <Metric
          label="Faturamento hoje"
          value={formatPrice(stats.todayRevenue)}
          hint="Soma dos pedidos de hoje"
        />
        <Metric
          label="Ticket médio"
          value={formatPrice(stats.todayAvg)}
          hint="Faturamento ÷ pedidos de hoje"
        />
        <Metric
          label="Em andamento"
          value={String(stats.openCount)}
          hint="Novos, em preparo e a caminho"
          to="/admin/pedidos"
        />
      </div>

      <div className="mb-6 grid gap-4 lg:grid-cols-5">
        <div className="lg:col-span-3">
          <Card
            title="Vendas dos últimos 7 dias"
            description={`Total no período: ${formatPrice(stats.weekRevenue)} (cancelados não entram).`}
          >
            <WeekChart days={stats.last7} />
          </Card>
        </div>
        <div className="lg:col-span-2">
          <Card
            title="Mais vendidos"
            description="Itens com mais unidades nos últimos 30 dias."
          >
            {stats.top.length === 0 ? (
              <p className="text-sm text-muted">Ainda não há pedidos para mostrar.</p>
            ) : (
              <ol className="space-y-3">
                {stats.top.map((t, i) => (
                  <li key={t.nome} className="flex items-center gap-3">
                    <span className="grid h-7 w-7 shrink-0 place-items-center rounded-full bg-brand/20 text-sm font-bold text-ember">
                      {i + 1}
                    </span>
                    <span className="flex-1 truncate">{t.nome}</span>
                    <span className="text-sm text-muted">{t.qtd} un.</span>
                  </li>
                ))}
              </ol>
            )}
          </Card>
        </div>
      </div>

      <Card
        title="Últimos pedidos"
        description="Os 5 mais recentes. Abra “Pedidos” para aceitar, preparar e entregar."
      >
        {recent.length === 0 ? (
          <p className="text-sm text-muted">
            Nenhum pedido ainda. Quando um cliente finalizar pelo site, ele aparece aqui.
          </p>
        ) : (
          <ul className="divide-y divide-line">
            {recent.map((o) => (
              <li
                key={o.id}
                className="flex flex-wrap items-center justify-between gap-2 py-3"
              >
                <div>
                  <p className="font-semibold">
                    #{o.numero} · {o.cliente_nome}
                  </p>
                  <p className="text-sm text-muted">
                    {o.itens.map((l) => `${l.qtd}x ${l.nome}`).join(', ')}
                  </p>
                </div>
                <div className="flex items-center gap-3">
                  <span className="font-semibold">{formatPrice(o.total)}</span>
                  <StatusBadge status={o.status} tipo={o.tipo} />
                </div>
              </li>
            ))}
          </ul>
        )}
        <Link
          to="/admin/pedidos"
          className="mt-4 inline-block font-semibold text-ember underline"
        >
          Ver todos os pedidos →
        </Link>
      </Card>
    </>
  )
}
