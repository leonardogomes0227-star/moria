import { phoneVariants } from '../../src/lib/phone.ts'
import { statusMessage } from '../../src/lib/statusMessages.ts'
import type { OrderStatus } from '../../src/lib/types.ts'
import type { ServerStore } from './webhook.js'

export interface NotifyResult {
  sent: boolean
  reason?: string
  message?: string
}

/** A Meta só permite texto livre até 24 h depois da última mensagem do cliente. */
const WINDOW_MS = 24 * 3_600_000

/** Avisa o cliente de uma mudança de etapa do pedido, respeitando a configuração, o telefone e a janela de 24 h. */
export async function notifyStatus(
  store: ServerStore,
  orderId: string,
  status: OrderStatus,
  send: (to: string, text: string) => Promise<void>,
  now: Date,
): Promise<NotifyResult> {
  const info = await store.loadStore()
  if (!info.bot.ativo || !info.bot.avisos_status) return { sent: false, reason: 'Avisos de status desligados' }
  const order = await store.getOrder(orderId)
  if (!order) return { sent: false, reason: 'Pedido não encontrado' }
  const message = statusMessage(order, status)
  if (!message) return { sent: false, reason: 'Esta etapa não gera aviso' }
  const variants = phoneVariants(order.cliente_telefone)
  if (!variants.length) return { sent: false, reason: 'Pedido sem telefone do cliente', message }
  const last = await store.lastCustomerMessage(variants)
  if (!last || now.getTime() - new Date(last.criado_em).getTime() > WINDOW_MS)
    return { sent: false, reason: 'O cliente não falou com a loja nas últimas 24 horas (limite da Meta)', message }
  await send(last.telefone, message)
  await store.saveReply(last.telefone, message, { tokens_in: 0, tokens_out: 0, tokens_cache: 0 })
  return { sent: true, message }
}
