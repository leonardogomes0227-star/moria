import { sdkClient } from './_lib/agent.js'
import { env, readiness } from './_lib/env.js'
import { header, json, rawBody, type Req, type Res } from './_lib/http.js'
import { createSupabaseStore } from './_lib/supabaseStore.js'
import { handleIncoming } from './_lib/webhook.js'
import { extractMessages, sendText, verifySignature } from './_lib/whatsapp.js'

export const config = { maxDuration: 60 }

/** Webhook do WhatsApp Cloud API: GET = verificação da Meta; POST = mensagens recebidas. */
export default async function handler(req: Req, res: Res): Promise<void> {
  if (req.method === 'GET') {
    const url = new URL(req.url ?? '', 'http://localhost')
    const ok = url.searchParams.get('hub.mode') === 'subscribe' && env.waVerifyToken() !== '' && url.searchParams.get('hub.verify_token') === env.waVerifyToken()
    if (!ok) return json(res, 403, { error: 'verificação recusada' })
    res.statusCode = 200
    res.setHeader('Content-Type', 'text/plain')
    res.end(url.searchParams.get('hub.challenge') ?? '')
    return
  }
  if (req.method !== 'POST') return json(res, 405, { error: 'método não permitido' })

  const ready = readiness()
  if (!ready.signature) return json(res, 503, { error: 'META_APP_SECRET não configurado' })
  let raw: string
  try {
    raw = await rawBody(req)
  } catch {
    return json(res, 413, { error: 'corpo inválido' })
  }
  if (!verifySignature(raw, header(req, 'x-hub-signature-256'), env.waAppSecret())) return json(res, 401, { error: 'assinatura inválida' })
  if (!ready.anthropic || !ready.supabase || !ready.whatsapp) return json(res, 503, { error: 'servidor não configurado' })

  let payload: unknown
  try {
    payload = JSON.parse(raw)
  } catch {
    return json(res, 400, { error: 'json inválido' })
  }

  const store = createSupabaseStore()
  const llm = sdkClient(env.anthropicKey())
  // Processa dentro da função (a Vercel encerra a execução após a resposta) e sempre devolve 200 para a Meta não reenviar.
  for (const msg of extractMessages(payload)) {
    await handleIncoming(msg, { store, llm, send: sendText, now: () => new Date() })
  }
  json(res, 200, { ok: true })
}
