import { repo } from '@/lib/data'
import { isSupabaseConfigured } from '@/lib/supabase'
import { statusMessage } from '@/lib/statusMessages'
import type { Order, OrderStatus } from '@/lib/types'
import { authHeader } from './serverApi'

/**
 * Avisa o cliente no WhatsApp que o pedido mudou de etapa. Devolve um texto curto para o aviso na tela, ou `null`.
 * Na demonstração só mostra o que o cliente receberia.
 */
export async function notifyCustomer(order: Order, status: OrderStatus): Promise<string | null> {
  const preview = statusMessage(order, status)
  if (!preview) return null
  if (!isSupabaseConfigured) {
    const bot = await repo.bot.settings.get()
    return bot.avisos_status ? `Demonstração — o cliente receberia no WhatsApp: “${preview}”` : null
  }
  try {
    const res = await fetch('/api/order-notify', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', ...(await authHeader()) },
      body: JSON.stringify({ orderId: order.id, status }),
    })
    const data = (await res.json()) as { sent?: boolean; reason?: string }
    if (data.sent) return 'Cliente avisado no WhatsApp ✅'
    // Avisos desligados é uma escolha do dono: não precisa lembrar a cada clique.
    return data.reason && !/desligados|WhatsApp não configurado/.test(data.reason) ? `Cliente não avisado: ${data.reason}.` : null
  } catch {
    return null
  }
}
