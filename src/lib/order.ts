import { config } from './config'
import { formatPrice } from './format'
import type { CartLine, Checkout } from '@/store/cart'
import { lineTotal, unitPrice } from '@/store/cart'
import type { DeliveryFee } from './types'

export interface Totals {
  subtotal: number
  /** `null` = taxa a combinar. */
  delivery: number | null
  total: number
}

export function computeTotals(
  lines: CartLine[],
  checkout: Checkout,
  fee: DeliveryFee,
): Totals {
  const subtotal = lines.reduce((n, l) => n + lineTotal(l), 0)
  const delivery =
    checkout.tipo === 'retirada' ? 0 : fee.mode === 'fixed' ? fee.amount : null
  return { subtotal, delivery, total: subtotal + (delivery ?? 0) }
}

export type CheckoutErrors = Partial<Record<'carrinho' | 'nome' | 'endereco', string>>

export function validateCheckout(lines: CartLine[], checkout: Checkout): CheckoutErrors {
  const errors: CheckoutErrors = {}
  if (lines.length === 0) errors.carrinho = config.messages.emptyCart
  if (checkout.nome.trim().length < 2) errors.nome = 'Informe seu nome.'
  if (checkout.tipo === 'entrega' && checkout.endereco.trim().length < 5) {
    errors.endereco = 'Informe o endereço completo para entrega.'
  }
  return errors
}

const deliveryLabel = (totals: Totals, tipo: Checkout['tipo']) => {
  if (tipo === 'retirada') return 'Retirada no local (sem taxa)'
  return totals.delivery === null
    ? config.messages.deliveryTbd
    : formatPrice(totals.delivery)
}

export function buildOrderMessage(
  lines: CartLine[],
  checkout: Checkout,
  totals: Totals,
): string {
  const items = lines.flatMap((l) => {
    const extras = l.adicionais.length
      ? ` (${l.adicionais.map((a) => a.nome).join(', ')})`
      : ''
    const row = `${l.qtd}x ${l.nome}${extras} - ${formatPrice(unitPrice(l) * l.qtd)}`
    return l.obs.trim() ? [row, `   Obs: ${l.obs.trim()}`] : [row]
  })

  const totalText =
    totals.delivery === null
      ? `${formatPrice(totals.total)} + entrega ${config.messages.deliveryTbd}`
      : formatPrice(totals.total)

  const payment =
    checkout.pagamento === 'Dinheiro' && checkout.troco.trim()
      ? `Dinheiro (troco para ${checkout.troco.trim()})`
      : checkout.pagamento

  return [
    config.messages.orderTitle,
    '',
    ...items,
    ...(checkout.obs.trim() ? ['', `Obs do pedido: ${checkout.obs.trim()}`] : []),
    '',
    `Subtotal: ${formatPrice(totals.subtotal)}`,
    `Entrega: ${deliveryLabel(totals, checkout.tipo)}`,
    `*Total: ${totalText}*`,
    '',
    `Nome: ${checkout.nome.trim()}`,
    `Tipo: ${checkout.tipo === 'entrega' ? 'Entrega' : 'Retirada'}`,
    ...(checkout.tipo === 'entrega' ? [`Endereço: ${checkout.endereco.trim()}`] : []),
    `Pagamento: ${payment}`,
  ]
    .join('\n')
    .replace(/\u00a0/g, ' ') // Intl usa espaço não separável após "R$"
}
