import { useEffect, useMemo, useState } from 'react'
import { useOutletContext } from 'react-router-dom'
import { PrinterIcon, WhatsappIcon } from '@/components/Icons'
import { config } from '@/lib/config'
import { repo } from '@/lib/data'
import { formatPrice } from '@/lib/format'
import type { Order, OrderStatus } from '@/lib/types'
import { whatsappUrl } from '@/lib/whatsapp'
import { toast } from '@/store/toast'
import type { AdminContext } from './AdminLayout'
import { Comanda } from './Comanda'
import { dayKey, isOpenStatus } from './stats'
import { ErrorBox, HelpBox, PageHeader, StatusBadge } from './ui'

type Filter = 'andamento' | 'concluido' | 'cancelado' | 'todos'
type Period = 'hoje' | '7' | '30' | 'tudo'

const FILTERS: { id: Filter; label: string }[] = [
  { id: 'andamento', label: 'Em andamento' },
  { id: 'concluido', label: 'Concluídos' },
  { id: 'cancelado', label: 'Cancelados' },
  { id: 'todos', label: 'Todos' },
]

const PERIODS: { id: Period; label: string }[] = [
  { id: 'hoje', label: 'Hoje' },
  { id: '7', label: '7 dias' },
  { id: '30', label: '30 dias' },
  { id: 'tudo', label: 'Tudo' },
]

const NEXT: Partial<Record<OrderStatus, OrderStatus>> = {
  novo: 'preparo',
  preparo: 'entrega',
  entrega: 'concluido',
}

const nextLabel = (o: Order): string | null => {
  if (o.status === 'novo') return 'Aceitar e iniciar preparo'
  if (o.status === 'preparo')
    return o.tipo === 'entrega' ? 'Saiu para entrega' : 'Pronto para retirada'
  if (o.status === 'entrega') return 'Concluir pedido'
  return null
}

const time = (iso: string) =>
  new Date(iso).toLocaleString('pt-BR', {
    timeZone: config.timezone,
    day: '2-digit',
    month: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
  })

/** Aceita (67) 99999-9999 ou 5567…; devolve só dígitos com DDI. */
const phoneToWa = (raw: string) => {
  const digits = raw.replace(/\D/g, '')
  return digits.length >= 10 ? (digits.startsWith('55') ? digits : `55${digits}`) : ''
}

function OrderCard({
  order,
  onStatus,
  onPrint,
}: {
  order: Order
  onStatus: (o: Order, s: OrderStatus) => void
  onPrint: (o: Order) => void
}) {
  const next = NEXT[order.status]
  const label = nextLabel(order)
  const wa = phoneToWa(order.cliente_telefone)
  return (
    <li
      className={`card p-5 ${order.status === 'novo' ? 'border-brand/70 shadow-glow' : ''}`}
    >
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <p className="text-lg font-bold">
            #{order.numero} · {order.cliente_nome}
          </p>
          <p className="text-sm text-muted">
            {time(order.criado_em)} · {order.tipo === 'entrega' ? 'Entrega' : 'Retirada'}
          </p>
        </div>
        <StatusBadge status={order.status} tipo={order.tipo} />
      </div>

      <ul className="mt-4 space-y-1.5 border-y border-line py-3">
        {order.itens.map((l, i) => (
          <li key={i}>
            <div className="flex justify-between gap-3">
              <span>
                <strong>{l.qtd}x</strong> {l.nome}
              </span>
              <span className="text-muted">{formatPrice(l.preco * l.qtd)}</span>
            </div>
            {l.adicionais.length > 0 && (
              <p className="pl-6 text-sm text-muted">+ {l.adicionais.join(', ')}</p>
            )}
            {l.obs && <p className="pl-6 text-sm italic text-ember">Obs: {l.obs}</p>}
          </li>
        ))}
      </ul>

      <dl className="mt-3 grid gap-x-6 gap-y-1 text-sm sm:grid-cols-2">
        {order.endereco && (
          <>
            <dt className="sr-only">Endereço</dt>
            <dd className="sm:col-span-2">📍 {order.endereco}</dd>
          </>
        )}
        <dd>
          Pagamento: <strong>{order.pagamento}</strong>
          {order.troco && ` (troco para ${order.troco})`}
        </dd>
        <dd>
          {order.tipo === 'retirada'
            ? 'Retirada no local'
            : `Entrega: ${order.entrega === null ? 'a combinar' : formatPrice(order.entrega)}`}
        </dd>
        {order.obs && (
          <dd className="text-ember sm:col-span-2">Obs do pedido: {order.obs}</dd>
        )}
        {order.cliente_telefone && <dd>Contato: {order.cliente_telefone}</dd>}
      </dl>

      <p className="mt-3 text-right text-xl font-bold">
        Total {formatPrice(order.total)}
        {order.entrega === null && (
          <span className="text-sm font-normal text-muted"> + entrega</span>
        )}
      </p>

      <div className="mt-4 flex flex-wrap gap-2">
        {next && label && (
          <button
            type="button"
            onClick={() => onStatus(order, next)}
            className="rounded-pill bg-brand px-5 py-2.5 font-semibold hover:bg-brand-light"
          >
            {label}
          </button>
        )}
        {isOpenStatus(order.status) && (
          <button
            type="button"
            onClick={() =>
              window.confirm(`Cancelar o pedido #${order.numero}?`) &&
              onStatus(order, 'cancelado')
            }
            className="rounded-pill border border-line px-4 py-2.5 text-sm hover:bg-white/5"
          >
            Cancelar
          </button>
        )}
        {!isOpenStatus(order.status) && (
          <button
            type="button"
            onClick={() => onStatus(order, 'novo')}
            className="rounded-pill border border-line px-4 py-2.5 text-sm hover:bg-white/5"
          >
            Reabrir (voltar para Novo)
          </button>
        )}
        <button
          type="button"
          onClick={() => onPrint(order)}
          className="inline-flex items-center gap-2 rounded-pill border border-line px-4 py-2.5 text-sm hover:bg-white/5"
        >
          <PrinterIcon size={18} /> Imprimir comanda
        </button>
        {wa && (
          <a
            href={whatsappUrl(
              wa,
              `Olá, ${order.cliente_nome}! Aqui é da ${config.name} sobre o seu pedido #${order.numero}.`,
            )}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-2 rounded-pill border border-[#1FA855]/50 px-4 py-2.5 text-sm text-[#7BE3A2] hover:bg-[#1FA855]/10"
          >
            <WhatsappIcon size={18} /> Chamar cliente
          </a>
        )}
      </div>
    </li>
  )
}

export default function Orders() {
  const { orders, ordersError, reloadOrders } = useOutletContext<AdminContext>()
  const [filter, setFilter] = useState<Filter>('andamento')
  const [period, setPeriod] = useState<Period>('hoje')
  const [query, setQuery] = useState('')
  const [printing, setPrinting] = useState<Order | null>(null)

  useEffect(() => {
    if (!printing) return
    const done = () => setPrinting(null)
    window.addEventListener('afterprint', done)
    const id = window.setTimeout(() => window.print(), 50)
    return () => {
      window.removeEventListener('afterprint', done)
      window.clearTimeout(id)
    }
  }, [printing])

  const visible = useMemo(() => {
    const now = new Date().getTime()
    const q = query.trim().toLowerCase().replace('#', '')
    return orders.filter((o) => {
      if (filter === 'andamento' && !isOpenStatus(o.status)) return false
      if (filter === 'concluido' && o.status !== 'concluido') return false
      if (filter === 'cancelado' && o.status !== 'cancelado') return false
      // “Em andamento” mostra tudo que está aberto, de qualquer dia: nada pode ficar esquecido.
      if (filter !== 'andamento') {
        if (period === 'hoje' && dayKey(o.criado_em) !== dayKey(new Date())) return false
        if (
          (period === '7' || period === '30') &&
          now - new Date(o.criado_em).getTime() > Number(period) * 86_400_000
        )
          return false
      }
      return !q || o.cliente_nome.toLowerCase().includes(q) || String(o.numero) === q
    })
  }, [orders, filter, period, query])

  const counts = (f: Filter) =>
    orders.filter((o) =>
      f === 'andamento' ? isOpenStatus(o.status) : f === 'todos' ? true : o.status === f,
    ).length

  const changeStatus = async (order: Order, status: OrderStatus) => {
    try {
      await repo.orders.setStatus(order.id, status)
      await reloadOrders()
      toast(
        `Pedido #${order.numero}: ${status === 'cancelado' ? 'cancelado' : 'atualizado'}.`,
      )
    } catch (err) {
      toast(err instanceof Error ? err.message : 'Não foi possível atualizar.', 'error')
    }
  }

  return (
    <>
      <PageHeader
        title="Pedidos"
        description="Acompanhe cada pedido do momento em que chega até a entrega."
      />
      <HelpBox title="Como funciona">
        <p>
          Quando o cliente finaliza no site, o pedido aparece aqui como{' '}
          <strong>Novo</strong> (a lista atualiza sozinha a cada 15 segundos e avisa com
          um bipe).
        </p>
        <p>
          Siga os botões:{' '}
          <strong>
            Aceitar e iniciar preparo → Saiu para entrega (ou Pronto para retirada) →
            Concluir
          </strong>
          . Use <strong>Imprimir comanda</strong> para levar o pedido à cozinha. O
          pagamento e o contato com o cliente continuam acontecendo pelo WhatsApp.
        </p>
      </HelpBox>
      {ordersError && (
        <ErrorBox message={ordersError} onRetry={() => void reloadOrders()} />
      )}

      <div
        className="mb-4 flex flex-wrap items-center gap-2"
        role="tablist"
        aria-label="Filtro por situação"
      >
        {FILTERS.map((f) => (
          <button
            key={f.id}
            role="tab"
            type="button"
            aria-selected={filter === f.id}
            onClick={() => setFilter(f.id)}
            className={`rounded-pill px-4 py-2 text-sm font-semibold ${filter === f.id ? 'bg-brand' : 'bg-white/5 hover:bg-white/10'}`}
          >
            {f.label} <span className="opacity-70">({counts(f.id)})</span>
          </button>
        ))}
      </div>
      <div className="mb-6 flex flex-wrap gap-3">
        <input
          type="search"
          aria-label="Buscar por nome ou número do pedido"
          placeholder="Buscar por nome ou nº"
          className="input max-w-xs"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
        />
        {filter !== 'andamento' && (
          <select
            aria-label="Período"
            className="input w-auto"
            value={period}
            onChange={(e) => setPeriod(e.target.value as Period)}
          >
            {PERIODS.map((p) => (
              <option key={p.id} value={p.id}>
                {p.label}
              </option>
            ))}
          </select>
        )}
      </div>

      {visible.length === 0 ? (
        <p className="card p-8 text-center text-muted">
          {filter === 'andamento'
            ? 'Nenhum pedido em andamento. Tudo em dia! 🎉'
            : 'Nenhum pedido encontrado com esses filtros.'}
        </p>
      ) : (
        <ul className="space-y-4">
          {visible.map((o) => (
            <OrderCard
              key={o.id}
              order={o}
              onStatus={(order, s) => void changeStatus(order, s)}
              onPrint={setPrinting}
            />
          ))}
        </ul>
      )}
      {printing && <Comanda order={printing} />}
    </>
  )
}
