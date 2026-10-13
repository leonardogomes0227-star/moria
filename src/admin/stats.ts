import { config } from '@/lib/config'
import type { Order } from '@/lib/types'

const dayFmt = new Intl.DateTimeFormat('en-CA', { timeZone: config.timezone })
const weekdayFmt = new Intl.DateTimeFormat('pt-BR', {
  timeZone: config.timezone,
  weekday: 'short',
})

/** Chave AAAA-MM-DD no fuso da loja. */
export const dayKey = (d: Date | string): string => dayFmt.format(new Date(d))

export const isOpenStatus = (s: Order['status']) =>
  s === 'novo' || s === 'preparo' || s === 'entrega'

export interface DayTotal {
  key: string
  label: string
  total: number
  count: number
}

export interface TopItem {
  nome: string
  qtd: number
}

export interface Summary {
  todayCount: number
  todayRevenue: number
  todayAvg: number
  openCount: number
  last7: DayTotal[]
  weekRevenue: number
  top: TopItem[]
}

/** Pedidos cancelados não entram em faturamento nem em ranking. */
export function summarize(orders: Order[], now = new Date()): Summary {
  const valid = orders.filter((o) => o.status !== 'cancelado')
  const today = dayKey(now)

  const last7: DayTotal[] = Array.from({ length: 7 }, (_, i) => {
    const d = new Date(now.getTime() - (6 - i) * 24 * 60 * 60 * 1000)
    const key = dayKey(d)
    const day = valid.filter((o) => dayKey(o.criado_em) === key)
    return {
      key,
      label: weekdayFmt.format(d).replace('.', ''),
      total: day.reduce((n, o) => n + o.total, 0),
      count: day.length,
    }
  })

  const todayOrders = valid.filter((o) => dayKey(o.criado_em) === today)
  const todayRevenue = todayOrders.reduce((n, o) => n + o.total, 0)

  const cutoff = now.getTime() - 30 * 24 * 60 * 60 * 1000
  const tally = new Map<string, number>()
  valid
    .filter((o) => new Date(o.criado_em).getTime() >= cutoff)
    .forEach((o) =>
      o.itens.forEach((l) => tally.set(l.nome, (tally.get(l.nome) ?? 0) + l.qtd)),
    )

  return {
    todayCount: todayOrders.length,
    todayRevenue,
    todayAvg: todayOrders.length ? todayRevenue / todayOrders.length : 0,
    openCount: orders.filter((o) => isOpenStatus(o.status)).length,
    last7,
    weekRevenue: last7.reduce((n, d) => n + d.total, 0),
    top: [...tally.entries()]
      .map(([nome, qtd]) => ({ nome, qtd }))
      .sort((a, b) => b.qtd - a.qtd)
      .slice(0, 5),
  }
}
