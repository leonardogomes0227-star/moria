import type { Order } from '../types.ts'
import { itemCost, type CostContext } from './calc.ts'

export interface DailySummary {
  /** AAAA-MM-DD no fuso da loja. */
  day: string
  pedidos: number
  faturamento: number
  ticket: number
  pedidosWhatsapp: number
  faturamentoWhatsapp: number
  top: { nome: string; qtd: number }[]
  /** Custo dos ingredientes dos itens vendidos. */
  cmv: number
  /** Faturamento menos custo dos ingredientes (ainda sem equipe, aluguel, impostos…). */
  lucroBruto: number
  /** Itens vendidos sem ficha técnica (o custo deles não entra na conta). */
  semFicha: string[]
}

const dayKey = (d: Date | string, timeZone: string): string =>
  new Intl.DateTimeFormat('en-CA', { timeZone, year: 'numeric', month: '2-digit', day: '2-digit' }).format(new Date(d))

/** Resume um dia de vendas (pedidos cancelados não contam). */
export function dailySummary(orders: Order[], ctx: CostContext, timeZone: string, date: Date): DailySummary {
  const day = dayKey(date, timeZone)
  const list = orders.filter((o) => o.status !== 'cancelado' && dayKey(o.criado_em, timeZone) === day)
  const faturamento = list.reduce((n, o) => n + o.total, 0)
  const wa = list.filter((o) => o.origem === 'whatsapp')
  const qtyByName = new Map<string, number>()
  const semFicha = new Set<string>()
  let cmv = 0
  for (const o of list) {
    for (const l of o.itens) {
      qtyByName.set(l.nome, (qtyByName.get(l.nome) ?? 0) + l.qtd)
      const c = l.item_id ? itemCost(l.item_id, ctx) : { cost: 0, complete: false }
      if (c.complete) cmv += c.cost * l.qtd
      else semFicha.add(l.nome)
    }
  }
  const top = [...qtyByName.entries()]
    .sort((a, b) => b[1] - a[1])
    .slice(0, 3)
    .map(([nome, qtd]) => ({ nome, qtd }))
  return {
    day,
    pedidos: list.length,
    faturamento,
    ticket: list.length ? faturamento / list.length : 0,
    pedidosWhatsapp: wa.length,
    faturamentoWhatsapp: wa.reduce((n, o) => n + o.total, 0),
    top,
    cmv,
    lucroBruto: faturamento - cmv,
    semFicha: [...semFicha],
  }
}

const brl = (n: number) => `R$ ${n.toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`

/** Texto do resumo, pronto para mandar no WhatsApp do dono. */
export function formatDailySummary(s: DailySummary, label = 'hoje'): string {
  if (s.pedidos === 0) return `📊 Resumo de ${label}: nenhum pedido registrado.`
  const lines = [
    `📊 *Resumo de ${label}*`,
    `Pedidos: ${s.pedidos} · Faturamento: ${brl(s.faturamento)}`,
    `Ticket médio: ${brl(s.ticket)}`,
    `Pelo WhatsApp: ${s.pedidosWhatsapp} pedidos (${brl(s.faturamentoWhatsapp)})`,
    `Lucro bruto: ${brl(s.lucroBruto)} (faturamento menos ingredientes; ainda sem equipe, aluguel e impostos)`,
  ]
  if (s.top.length) lines.push(`Mais vendidos: ${s.top.map((t) => `${t.qtd}x ${t.nome}`).join(', ')}`)
  if (s.semFicha.length) lines.push(`⚠️ Sem ficha técnica (custo não contado): ${s.semFicha.slice(0, 3).join(', ')}${s.semFicha.length > 3 ? '…' : ''}`)
  return lines.join('\n')
}
