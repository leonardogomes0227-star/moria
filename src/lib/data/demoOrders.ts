import { menuItems } from '../../data/menu.ts'
import type { Order, OrderLine, OrderStatus } from '../types.ts'

const NAMES = [
  'Cliente Exemplo A',
  'Cliente Exemplo B',
  'Cliente Exemplo C',
  'Cliente Exemplo D',
  'Cliente Exemplo E',
]
const DAY = 24 * 60 * 60 * 1000

const price = (id: string) => menuItems.find((i) => i.id === id)

function line(id: string, qtd: number, extras: string[] = []): OrderLine {
  const item = price(id)
  const addons = (item?.adicionais ?? []).filter((a) => extras.includes(a.nome))
  return {
    nome: item?.nome ?? id,
    qtd,
    preco: (item?.preco ?? 0) + addons.reduce((n, a) => n + a.preco, 0),
    adicionais: addons.map((a) => a.nome),
    obs: '',
  }
}

/** Pedidos fictícios (só do modo demonstração) para o painel não nascer vazio. */
export function buildDemoOrders(now = Date.now()): Order[] {
  const plans: {
    ago: number
    status: OrderStatus
    itens: OrderLine[]
    tipo: 'entrega' | 'retirada'
    pay: Order['pagamento']
  }[] = [
    {
      ago: 6 * 60 * 1000,
      status: 'novo',
      itens: [line('h2', 1, ['Bacon crocante']), line('a1', 1)],
      tipo: 'entrega',
      pay: 'Pix',
    },
    {
      ago: 22 * 60 * 1000,
      status: 'preparo',
      itens: [line('c1', 2)],
      tipo: 'retirada',
      pay: 'Cartão',
    },
    {
      ago: 55 * 60 * 1000,
      status: 'entrega',
      itens: [line('b1', 1), line('d1', 2)],
      tipo: 'entrega',
      pay: 'Dinheiro',
    },
    {
      ago: 3 * 60 * 60 * 1000,
      status: 'concluido',
      itens: [line('h1', 2), line('a2', 1)],
      tipo: 'entrega',
      pay: 'Pix',
    },
    {
      ago: 1 * DAY + 3600e3,
      status: 'concluido',
      itens: [line('c2', 1)],
      tipo: 'entrega',
      pay: 'Pix',
    },
    {
      ago: 1 * DAY + 5 * 3600e3,
      status: 'concluido',
      itens: [line('h4', 1), line('d2', 1)],
      tipo: 'retirada',
      pay: 'Cartão',
    },
    {
      ago: 2 * DAY + 2 * 3600e3,
      status: 'concluido',
      itens: [line('h1', 1), line('h3', 1), line('a1', 1)],
      tipo: 'entrega',
      pay: 'Pix',
    },
    {
      ago: 2 * DAY + 4 * 3600e3,
      status: 'cancelado',
      itens: [line('h5', 1)],
      tipo: 'entrega',
      pay: 'Dinheiro',
    },
    {
      ago: 3 * DAY + 3 * 3600e3,
      status: 'concluido',
      itens: [line('b2', 2), line('d1', 2)],
      tipo: 'entrega',
      pay: 'Pix',
    },
    {
      ago: 4 * DAY + 2 * 3600e3,
      status: 'concluido',
      itens: [line('c1', 1), line('m1', 2)],
      tipo: 'retirada',
      pay: 'Pix',
    },
    {
      ago: 4 * DAY + 6 * 3600e3,
      status: 'concluido',
      itens: [line('h2', 2)],
      tipo: 'entrega',
      pay: 'Cartão',
    },
    {
      ago: 5 * DAY + 3 * 3600e3,
      status: 'concluido',
      itens: [line('b1', 1), line('a2', 1)],
      tipo: 'entrega',
      pay: 'Pix',
    },
    {
      ago: 6 * DAY + 4 * 3600e3,
      status: 'concluido',
      itens: [line('h1', 3), line('d2', 1)],
      tipo: 'entrega',
      pay: 'Pix',
    },
  ]
  return plans.map((p, i): Order => {
    const subtotal = p.itens.reduce((n, l) => n + l.preco * l.qtd, 0)
    const entrega = p.tipo === 'retirada' ? 0 : 5
    return {
      id: `demo-${i + 1}`,
      numero: plans.length - i,
      criado_em: new Date(now - p.ago).toISOString(),
      status: p.status,
      tipo: p.tipo,
      cliente_nome: NAMES[i % NAMES.length],
      cliente_telefone: '',
      endereco: p.tipo === 'entrega' ? 'Rua Exemplo, 123 - Centro' : '',
      pagamento: p.pay,
      troco: '',
      obs: '',
      itens: p.itens,
      subtotal,
      entrega,
      total: subtotal + entrega,
    }
  })
}
