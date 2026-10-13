import type { OrderStatus, OrderType } from '@/lib/types'

export const STATUS_LABEL: Record<OrderStatus, string> = {
  novo: 'Novo',
  preparo: 'Em preparo',
  entrega: 'Saiu para entrega',
  concluido: 'Concluído',
  cancelado: 'Cancelado',
}

export const statusLabel = (status: OrderStatus, tipo: OrderType) =>
  status === 'entrega' && tipo === 'retirada'
    ? 'Pronto para retirada'
    : STATUS_LABEL[status]
