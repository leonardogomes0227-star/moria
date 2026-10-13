import { authedUser } from './_lib/auth.js'
import { pickModel, runAgent, sdkClient } from './_lib/agent.js'
import { env } from './_lib/env.js'
import { json, rawBody, type Req, type Res } from './_lib/http.js'
import { createSupabaseStore } from './_lib/supabaseStore.js'
import type { ChatTurn } from './_lib/types.js'

export const config = { maxDuration: 60 }

const hits = new Map<string, number[]>()
const MAX_PER_MIN = 12

/** Simulador do painel: conversa de teste com o assistente (não cria pedidos nem grava conversas). */
export default async function handler(req: Req, res: Res): Promise<void> {
  if (req.method !== 'POST') return json(res, 405, { error: 'método não permitido' })
  const user = await authedUser(req)
  if (!user) return json(res, 401, { error: 'não autorizado' })
  if (!env.anthropicKey()) return json(res, 503, { error: 'ANTHROPIC_API_KEY não configurada no servidor' })

  const now = Date.now()
  const recent = (hits.get(user) ?? []).filter((t) => now - t < 60_000)
  if (recent.length >= MAX_PER_MIN) return json(res, 429, { error: 'muitas mensagens, aguarde um instante' })
  hits.set(user, [...recent, now])

  let body: { text?: unknown; history?: unknown; model?: unknown }
  try {
    body = JSON.parse(await rawBody(req, 100_000))
  } catch {
    return json(res, 400, { error: 'json inválido' })
  }
  const text = typeof body.text === 'string' ? body.text.slice(0, 1000) : ''
  if (!text.trim()) return json(res, 400, { error: 'mensagem vazia' })
  const history: ChatTurn[] = Array.isArray(body.history)
    ? (body.history as ChatTurn[])
        .filter((t) => (t?.role === 'user' || t?.role === 'assistant') && typeof t.content === 'string')
        .slice(-20)
        .map((t) => ({ role: t.role, content: t.content.slice(0, 2000) }))
    : []

  try {
    const store = createSupabaseStore()
    const info = await store.loadStore()
    if (typeof body.model === 'string') info.bot = { ...info.bot, modelo: pickModel(body.model) }
    const r = await runAgent({ client: sdkClient(env.anthropicKey()), store, phone: 'simulador', customerName: 'Teste', text, now: new Date(), history, info, dryRun: true })
    json(res, 200, { reply: r.reply, handoff: r.handoff, usage: r.usage, toolCalls: r.toolCalls, model: pickModel(info.bot.modelo) })
  } catch (err) {
    console.error('simulador: falha', err instanceof Error ? err.name : 'erro')
    json(res, 502, { error: 'Não foi possível falar com a IA agora. Confira a chave e tente de novo.' })
  }
}
