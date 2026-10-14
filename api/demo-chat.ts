import { pickModel, runAgent, sdkClient } from './_lib/agent.js'
import { env } from './_lib/env.js'
import { header, json, rawBody, type Req, type Res } from './_lib/http.js'
import { splitReply } from './_lib/split.js'
import { createStaticStore } from './_lib/staticStore.js'
import { createSupabaseStore } from './_lib/supabaseStore.js'
import type { ChatTurn } from './_lib/types.js'

export const config = { maxDuration: 60 }

/**
 * Chat de teste PÚBLICO (página /teste), para o dono experimentar sem login. Só funciona com DEMO_PUBLIC=1.
 * Funciona só com a chave da IA (cardápio de exemplo) ou, com Supabase configurado, com o cardápio real.
 * Os limites abaixo ficam na memória da função (reiniciam em cada "partida a frio"): são um freio básico.
 * A proteção de verdade é o limite de gasto configurado no console da Anthropic.
 */
const PER_IP_HOUR = 30
const PER_DAY = Number(process.env.DEMO_DAILY_LIMIT ?? 300)
const ips = new Map<string, number[]>()
let day = { key: '', count: 0 }

export default async function handler(req: Req, res: Res): Promise<void> {
  if (req.method !== 'POST') return json(res, 405, { error: 'método não permitido' })
  if (process.env.DEMO_PUBLIC !== '1') return json(res, 404, { error: 'teste público desligado' })
  if (!env.anthropicKey()) return json(res, 503, { error: 'servidor não configurado' })

  const now = Date.now()
  const today = new Date(now).toISOString().slice(0, 10)
  if (day.key !== today) day = { key: today, count: 0 }
  if (day.count >= PER_DAY) return json(res, 429, { error: 'O teste de hoje chegou ao limite. Volte amanhã!' })
  const ip = (header(req, 'x-forwarded-for') ?? req.socket.remoteAddress ?? 'x').split(',')[0].trim()
  const recent = (ips.get(ip) ?? []).filter((t) => now - t < 3_600_000)
  if (recent.length >= PER_IP_HOUR) return json(res, 429, { error: 'Muitas mensagens em pouco tempo. Tente de novo mais tarde.' })
  ips.set(ip, [...recent, now])
  day.count++

  let body: { text?: unknown; history?: unknown }
  try {
    body = JSON.parse(await rawBody(req, 50_000))
  } catch {
    return json(res, 400, { error: 'json inválido' })
  }
  const text = typeof body.text === 'string' ? body.text.slice(0, 400) : ''
  if (!text.trim()) return json(res, 400, { error: 'mensagem vazia' })
  const history: ChatTurn[] = Array.isArray(body.history)
    ? (body.history as ChatTurn[])
        .filter((t) => (t?.role === 'user' || t?.role === 'assistant') && typeof t.content === 'string')
        .slice(-16)
        .map((t) => ({ role: t.role, content: t.content.slice(0, 1500) }))
    : []

  try {
    // Com banco configurado usa o cardápio real da loja; senão, o cardápio de exemplo do site.
    const store = env.supabaseUrl() && env.supabaseServiceKey() ? createSupabaseStore() : createStaticStore()
    const info = await store.loadStore()
    info.bot = { ...info.bot, modelo: pickModel(info.bot.modelo) }
    // O site que está servindo a demonstração (se STORE_SITE_URL não estiver definida).
    const host = header(req, 'x-forwarded-host') ?? header(req, 'host')
    info.site = info.site ?? (host ? `https://${host}` : undefined)
    const r = await runAgent({ client: sdkClient(env.anthropicKey()), store, phone: 'teste-publico', customerName: 'Visitante', text, now: new Date(), history, info, dryRun: true })
    json(res, 200, { reply: r.reply, parts: splitReply(r.reply), handoff: r.handoff, orderCreated: r.toolCalls.includes('criar_pedido') })
  } catch (err) {
    console.error('teste público: falha', err instanceof Error ? err.name : 'erro')
    json(res, 502, { error: 'Não consegui responder agora. Tente de novo em instantes.' })
  }
}
