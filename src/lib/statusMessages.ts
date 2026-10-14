import type { Order, OrderStatus } from './types.ts'

/** Mensagem que o cliente recebe no WhatsApp quando o pedido muda de etapa. `null` = não avisa. */
export function statusMessage(order: Pick<Order, 'numero' | 'tipo' | 'cliente_nome'>, status: OrderStatus): string | null {
  const nome = order.cliente_nome.trim().split(/\s+/)[0] || ''
  const oi = nome ? `${nome}, ` : ''
  const n = order.numero > 0 ? ` #${order.numero}` : ''
  switch (status) {
    case 'preparo':
      return `${oi}seu pedido${n} já está na brasa! 🔥 Estamos preparando com carinho.`
    case 'entrega':
      return order.tipo === 'retirada'
        ? `${oi}seu pedido${n} está pronto para retirada! 🙌 Pode vir buscar quentinho.`
        : `${oi}seu pedido${n} saiu para entrega! 🛵 Já já chega aí.`
    case 'concluido':
      return `${oi}pedido${n} entregue. Bom apetite! 🍔 Se gostou, conta pra gente o que achou: é só responder aqui.`
    case 'cancelado':
      return `${oi}seu pedido${n} foi cancelado. Se tiver qualquer dúvida, é só responder esta mensagem.`
    default:
      return null
  }
}
