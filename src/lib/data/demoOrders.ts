import { menuItems } from '../../data/menu.ts'
import type { MenuItem, Order, OrderLine, OrderStatus, PaymentMethod } from '../types.ts'

/**
 * Histórico FICTÍCIO (só do modo demonstração) para o painel não nascer vazio:
 * ~6 semanas de pedidos com a loja fechada às segundas. Determinístico (mesma semente = mesmos pedidos).
 */

const DAY = 24 * 60 * 60 * 1000
const byId = new Map(menuItems.map((m) => [m.id, m]))

function rng(seed: number) {
  let a = seed >>> 0
  return () => {
    a = (a + 0x6d2b79f5) >>> 0
    let t = a
    t = Math.imul(t ^ (t >>> 15), t | 1)
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61)
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296
  }
}

const pickWeighted = (r: () => number, entries: [string, number][]): string => {
  const total = entries.reduce((n, [, w]) => n + w, 0)
  let x = r() * total
  for (const [id, w] of entries) {
    x -= w
    if (x <= 0) return id
  }
  return entries[0][0]
}

const MAINS: [string, number][] = [
  ['h1', 18],
  ['h2', 14],
  ['h3', 9],
  ['h4', 7],
  ['h5', 6],
  ['h6', 2],
  ['b1', 8],
  ['b2', 4],
  ['b3', 4],
  ['b4', 5],
]
const COMBOS: [string, number][] = [
  ['c1', 10],
  ['c2', 4],
  ['c3', 4],
]
const SIDES: [string, number][] = [
  ['a1', 10],
  ['a2', 9],
  ['a3', 4],
]
const DRINKS: [string, number][] = [
  ['d1', 16],
  ['d2', 6],
  ['d3', 5],
]
const SAUCES: [string, number][] = [
  ['m1', 3],
  ['m2', 3],
  ['m3', 3],
]

const ORDERS_PER_DAY = [22, 0, 14, 15, 19, 31, 38] // domingo..sábado (segunda fechada)

function line(item: MenuItem, qtd: number, r: () => number): OrderLine {
  const addon =
    item.adicionais.length > 0 && r() < 0.28
      ? item.adicionais[Math.floor(r() * Math.min(2, item.adicionais.length))]
      : undefined
  return {
    item_id: item.id,
    nome: item.nome,
    qtd,
    preco: item.preco + (addon?.preco ?? 0),
    adicionais: addon ? [addon.nome] : [],
    obs: '',
  }
}

const paymentFor = (r: () => number): PaymentMethod => {
  const x = r()
  return x < 0.55 ? 'Pix' : x < 0.85 ? 'Cartão' : 'Dinheiro'
}

export function buildDemoOrders(now = Date.now()): Order[] {
  const draft: Omit<Order, 'id' | 'numero'>[] = []

  for (let back = 42; back >= 0; back--) {
    const dayStart = new Date(now - back * DAY)
    dayStart.setUTCHours(0, 0, 0, 0)
    const weekday = new Date(now - back * DAY).getUTCDay()
    const r = rng(1000 + back * 7)
    const count = Math.round(ORDERS_PER_DAY[weekday] * (0.85 + r() * 0.3))
    for (let n = 0; n < count; n++) {
      // pedidos entre 18h30 e 23h (horário de Campo Grande ≈ UTC−4): 22h30 a 03h UTC
      const minutesAfter18 = 30 + Math.floor(r() * 270)
      const when = dayStart.getTime() + (22 * 60 + 30 + minutesAfter18) * 60_000
      if (when > now - 20 * 60_000) continue

      const itens: OrderLine[] = []
      if (r() < 0.25) {
        itens.push(line(byId.get(pickWeighted(r, COMBOS))!, 1, r))
      } else {
        itens.push(line(byId.get(pickWeighted(r, MAINS))!, 1, r))
        if (r() < 0.3) itens.push(line(byId.get(pickWeighted(r, MAINS))!, 1, r))
        if (r() < 0.45) itens.push(line(byId.get(pickWeighted(r, SIDES))!, 1, r))
        if (r() < 0.55) itens.push(line(byId.get(pickWeighted(r, DRINKS))!, 1, r))
        if (r() < 0.15) itens.push(line(byId.get(pickWeighted(r, SAUCES))!, 1, r))
      }
      const delivery = r() < 0.7
      const subtotal = itens.reduce((s, l) => s + l.preco * l.qtd, 0)
      const entrega = delivery ? 5 : 0
      const cancelled = r() < 0.03
      draft.push({
        criado_em: new Date(when).toISOString(),
        origem: r() < 0.22 ? 'whatsapp' : 'site',
        status: cancelled ? 'cancelado' : 'concluido',
        tipo: delivery ? 'entrega' : 'retirada',
        cliente_nome: `Cliente Exemplo ${1 + Math.floor(r() * 180)}`,
        cliente_telefone: '',
        endereco: delivery ? 'Rua Exemplo, 123 - Centro' : '',
        pagamento: paymentFor(r),
        troco: '',
        obs: '',
        itens,
        subtotal,
        entrega,
        total: subtotal + entrega,
      })
    }
  }

  // Pedidos "ao vivo" (últimos minutos) para a tela de Pedidos ter o que mostrar.
  const live: {
    ago: number
    status: OrderStatus
    ids: string[]
    delivery: boolean
    origem: Order['origem']
  }[] = [
    { ago: 4, status: 'novo', ids: ['h2', 'a1'], delivery: true, origem: 'site' },
    { ago: 9, status: 'novo', ids: ['c1'], delivery: false, origem: 'whatsapp' },
    { ago: 21, status: 'preparo', ids: ['b1', 'd1'], delivery: true, origem: 'site' },
    {
      ago: 38,
      status: 'entrega',
      ids: ['h1', 'h3', 'a2'],
      delivery: true,
      origem: 'site',
    },
  ]
  live.forEach((l, i) => {
    const r = rng(77 + i)
    const itens = l.ids.map((id) => line(byId.get(id)!, 1, () => 0.9 + r() * 0))
    const subtotal = itens.reduce((s, x) => s + x.preco * x.qtd, 0)
    const entrega = l.delivery ? 5 : 0
    draft.push({
      criado_em: new Date(now - l.ago * 60_000).toISOString(),
      origem: l.origem,
      status: l.status,
      tipo: l.delivery ? 'entrega' : 'retirada',
      cliente_nome: `Cliente Exemplo ${200 + i}`,
      cliente_telefone: '',
      endereco: l.delivery ? 'Rua Exemplo, 123 - Centro' : '',
      pagamento: i % 2 ? 'Pix' : 'Cartão',
      troco: '',
      obs: '',
      itens,
      subtotal,
      entrega,
      total: subtotal + entrega,
    })
  })

  draft.sort((a, b) => a.criado_em.localeCompare(b.criado_em))
  return draft.map((o, i) => ({ ...o, id: `demo-${i + 1}`, numero: i + 1 })).reverse()
}
