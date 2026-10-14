import { buildContext } from '../../src/lib/finance/calc.ts'
import { dailySummary, formatDailySummary } from '../../src/lib/finance/dailySummary.ts'
import { toWaPhone } from '../../src/lib/phone.ts'
import type { ServerStore } from './webhook.js'

export interface SummaryDeps {
  sendText: (to: string, text: string) => Promise<void>
  /** Se existir, é usado (permite mandar mesmo fora da janela de 24 h). */
  sendTemplate?: (to: string, text: string) => Promise<void>
  now: Date
}

/** Monta e envia o resumo do dia ao dono (se o robô e o resumo estiverem ligados e houver telefone). */
export async function sendDailySummary(store: ServerStore, deps: SummaryDeps): Promise<{ sent: boolean; reason?: string; text?: string }> {
  const info = await store.loadStore()
  if (!info.bot.ativo || !info.bot.resumo_diario) return { sent: false, reason: 'Resumo diário desligado' }
  const owner = toWaPhone(info.bot.telefone_dono)
  if (!owner) return { sent: false, reason: 'Falta o WhatsApp do dono' }
  const ports = store.ownerPorts(info.timezone, () => deps.now)
  const [orders, fin] = await Promise.all([ports.orders(), ports.finance()])
  const text = formatDailySummary(dailySummary(orders, buildContext(fin.ingredients, fin.recipes), info.timezone, deps.now))
  if (deps.sendTemplate) await deps.sendTemplate(owner, text)
  else await deps.sendText(owner, text)
  return { sent: true, text }
}
