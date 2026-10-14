import { authedUser } from './_lib/auth.js'
import { json, rawBody, type Req, type Res } from './_lib/http.js'
import { readiness } from './_lib/env.js'
import { createSupabaseStore } from './_lib/supabaseStore.js'
import { notifyStatus } from './_lib/notify.js'
import { sendText } from './_lib/whatsapp.js'
import type { OrderStatus } from '../src/lib/types.ts'

const STATUSES: OrderStatus[] = ['novo', 'preparo', 'entrega', 'concluido', 'cancelado']

/** O painel chama aqui quando o dono muda a etapa de um pedido: o cliente é avisado no WhatsApp. */
export default async function handler(req: Req, res: Res): Promise<void> {
  if (req.method !== 'POST') return json(res, 405, { error: 'método não permitido' })
  if (!(await authedUser(req))) return json(res, 401, { error: 'não autorizado' })
  const ready = readiness()
  if (!ready.supabase || !ready.whatsapp) return json(res, 200, { sent: false, reason: 'WhatsApp não configurado no servidor' })

  let body: { orderId?: unknown; status?: unknown }
  try {
    body = JSON.parse(await rawBody(req, 10_000))
  } catch {
    return json(res, 400, { error: 'json inválido' })
  }
  const status = STATUSES.find((s) => s === body.status)
  if (typeof body.orderId !== 'string' || !status) return json(res, 400, { error: 'pedido ou status inválido' })

  try {
    json(res, 200, await notifyStatus(createSupabaseStore(), body.orderId, status, sendText, new Date()))
  } catch (err) {
    console.error('aviso de status: falha', err instanceof Error ? err.name : 'erro')
    json(res, 200, { sent: false, reason: 'Não foi possível avisar o cliente agora' })
  }
}
