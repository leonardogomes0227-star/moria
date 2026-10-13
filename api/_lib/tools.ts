import type Anthropic from '@anthropic-ai/sdk'
import type { NewOrder, OrderLine, OrderType, PaymentMethod } from '../../src/lib/types.ts'
import { PAYMENT_METHODS } from './constants.js'
import type { BotStore, StoreInfo } from './types.js'

type Tool = Anthropic.Beta.Messages.BetaTool

export const TOOLS: Tool[] = [
  {
    name: 'criar_pedido',
    description:
      'Registra o pedido do cliente na loja. Chame SOMENTE depois de resumir o pedido com o total e o cliente confirmar com clareza. Os preços são conferidos pelo sistema com base no cardápio.',
    input_schema: {
      type: 'object',
      properties: {
        itens: {
          type: 'array',
          description: 'Itens do pedido.',
          items: {
            type: 'object',
            properties: {
              item_id: { type: 'string', description: 'Código do item no cardápio (o valor entre colchetes).' },
              quantidade: { type: 'integer', description: 'Quantidade, de 1 a 20.' },
              adicionais: { type: 'array', items: { type: 'string' }, description: 'Nomes exatos dos adicionais escolhidos (opcional).' },
              observacao: { type: 'string', description: 'Observação do item, ex.: sem cebola (opcional).' },
            },
            required: ['item_id', 'quantidade'],
          },
        },
        tipo: { type: 'string', enum: ['entrega', 'retirada'] },
        nome_cliente: { type: 'string', description: 'Nome do cliente.' },
        endereco: { type: 'string', description: 'Endereço completo com ponto de referência. Obrigatório para entrega.' },
        pagamento: { type: 'string', enum: [...PAYMENT_METHODS] },
        troco_para: { type: 'string', description: 'Valor para o qual o cliente precisa de troco, só se pagar em dinheiro (opcional).' },
        observacao_geral: { type: 'string', description: 'Observação geral do pedido (opcional).' },
      },
      required: ['itens', 'tipo', 'nome_cliente', 'pagamento'],
    },
  },
  {
    name: 'consultar_pedido',
    description: 'Mostra a situação dos pedidos mais recentes DO PRÓPRIO cliente que está conversando (por exemplo, "cadê meu pedido?").',
    input_schema: {
      type: 'object',
      properties: { numero: { type: 'integer', description: 'Número do pedido, se o cliente informou (opcional).' } },
    },
  },
  {
    name: 'chamar_atendente',
    description: 'Passa a conversa para uma pessoa da loja. Use nos casos listados nas regras (reclamação, evento, alergia, dúvida sem resposta, pedido de falar com humano).',
    input_schema: {
      type: 'object',
      properties: { motivo: { type: 'string', description: 'Resumo curto do que o cliente precisa, para a pessoa que vai atender.' } },
      required: ['motivo'],
    },
  },
]

export interface ToolContext {
  store: BotStore
  info: StoreInfo
  phone: string
  customerName: string
  /** Simulador do painel: nada é gravado de verdade. */
  dryRun: boolean
}

export interface ToolResult {
  content: string
  isError?: boolean
}

const fail = (message: string): ToolResult => ({ content: JSON.stringify({ ok: false, erro: message }), isError: true })
const asRecord = (v: unknown): Record<string, unknown> => (typeof v === 'object' && v !== null ? (v as Record<string, unknown>) : {})
const str = (v: unknown, max: number): string => (typeof v === 'string' ? v.trim().slice(0, max) : '')

/** Valida a entrada do modelo e monta o pedido com preços calculados no servidor. */
export function buildOrder(input: unknown, ctx: Pick<ToolContext, 'info' | 'phone'>): { order: NewOrder } | { error: string } {
  const { info } = ctx
  const raw = asRecord(input)
  if (info.settings.paused) return { error: `Os pedidos estão pausados agora: ${info.settings.pauseMessage}` }

  const rawItems = Array.isArray(raw.itens) ? raw.itens : []
  if (rawItems.length === 0 || rawItems.length > 20) return { error: 'O pedido precisa ter de 1 a 20 itens.' }

  const lines: OrderLine[] = []
  for (const entry of rawItems) {
    const e = asRecord(entry)
    const item = info.menu.find((m) => m.id === e.item_id)
    if (!item) return { error: `Item não encontrado no cardápio: ${String(e.item_id)}. Use o código entre colchetes.` }
    if (!item.disponivel) return { error: `${item.nome} está indisponível hoje.` }
    const qtd = Number(e.quantidade)
    if (!Number.isInteger(qtd) || qtd < 1 || qtd > 20) return { error: `Quantidade inválida para ${item.nome}.` }
    const names = Array.isArray(e.adicionais) ? e.adicionais.filter((a): a is string => typeof a === 'string') : []
    const addons = []
    for (const name of names) {
      const addon = item.adicionais.find((a) => a.nome.toLowerCase() === name.trim().toLowerCase())
      if (!addon) return { error: `${item.nome} não tem o adicional “${name}”. Adicionais disponíveis: ${item.adicionais.map((a) => a.nome).join(', ') || 'nenhum'}.` }
      addons.push(addon)
    }
    lines.push({
      item_id: item.id,
      nome: item.nome,
      qtd,
      preco: item.preco + addons.reduce((n, a) => n + a.preco, 0),
      adicionais: addons.map((a) => a.nome),
      obs: str(e.observacao, 200),
    })
  }

  const tipo = raw.tipo === 'entrega' || raw.tipo === 'retirada' ? (raw.tipo as OrderType) : null
  if (!tipo) return { error: 'Informe se é entrega ou retirada.' }
  const nome = str(raw.nome_cliente, 80)
  if (nome.length < 2) return { error: 'Falta o nome do cliente.' }
  const endereco = str(raw.endereco, 300)
  if (tipo === 'entrega' && endereco.length < 5) return { error: 'Falta o endereço completo para entrega.' }
  const pagamento = PAYMENT_METHODS.find((p) => p === raw.pagamento) as PaymentMethod | undefined
  if (!pagamento) return { error: 'Forma de pagamento inválida.' }
  if (!info.settings.payments.includes(pagamento)) return { error: `Não aceitamos ${pagamento}. Aceitamos: ${info.settings.payments.join(', ')}.` }

  const subtotal = lines.reduce((n, l) => n + l.preco * l.qtd, 0)
  if (subtotal < info.settings.minOrder) return { error: `Pedido mínimo de R$ ${info.settings.minOrder.toFixed(2).replace('.', ',')}. O subtotal atual é R$ ${subtotal.toFixed(2).replace('.', ',')}.` }
  const fee = info.settings.deliveryFee
  const entrega = tipo === 'retirada' ? 0 : fee.mode === 'fixed' ? fee.amount : null

  return {
    order: {
      origem: 'whatsapp',
      tipo,
      cliente_nome: nome,
      cliente_telefone: ctx.phone,
      endereco: tipo === 'entrega' ? endereco : '',
      pagamento,
      troco: pagamento === 'Dinheiro' ? str(raw.troco_para, 40) : '',
      obs: str(raw.observacao_geral, 300),
      itens: lines,
      subtotal,
      entrega,
      total: subtotal + (entrega ?? 0),
    },
  }
}

export async function runTool(name: string, input: unknown, ctx: ToolContext): Promise<ToolResult> {
  try {
    if (name === 'criar_pedido') {
      const built = buildOrder(input, ctx)
      if ('error' in built) return fail(built.error)
      const { order } = built
      const created = ctx.dryRun ? { numero: 0 } : await ctx.store.createOrder(order)
      return {
        content: JSON.stringify({
          ok: true,
          numero: created.numero,
          modo_teste: ctx.dryRun,
          subtotal: order.subtotal,
          entrega: order.entrega === null ? 'a combinar' : order.entrega,
          total: order.total,
          loja_aberta_agora: ctx.info.open,
        }),
      }
    }
    if (name === 'consultar_pedido') {
      const wanted = Number(asRecord(input).numero)
      const orders = ctx.dryRun ? [] : await ctx.store.ordersOf(ctx.phone, 5)
      const list = Number.isInteger(wanted) && wanted > 0 ? orders.filter((o) => o.numero === wanted) : orders
      return { content: JSON.stringify({ ok: true, pedidos: list.map((o) => ({ numero: o.numero, situacao: o.status, tipo: o.tipo, total: o.total, itens: o.itens.map((l) => `${l.qtd}x ${l.nome}`) })) }) }
    }
    if (name === 'chamar_atendente') {
      const motivo = str(asRecord(input).motivo, 300) || 'Cliente pediu atendimento'
      if (!ctx.dryRun) await ctx.store.requestHuman(ctx.phone, ctx.customerName, motivo, 2)
      return { content: JSON.stringify({ ok: true, aviso: 'Um atendente foi acionado e assume a conversa em breve. Avise o cliente.' }) }
    }
    return fail(`Ferramenta desconhecida: ${name}`)
  } catch {
    return fail('Não foi possível concluir agora. Peça desculpas e chame um atendente.')
  }
}
