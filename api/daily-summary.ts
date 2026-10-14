import { header, json, type Req, type Res } from './_lib/http.js'
import { env, readiness } from './_lib/env.js'
import { sendDailySummary } from './_lib/summary.js'
import { createSupabaseStore } from './_lib/supabaseStore.js'
import { sendTemplate, sendText } from './_lib/whatsapp.js'

export const config = { maxDuration: 60 }

/** Chamado todo dia pelo agendador da Vercel (cron): manda o resumo do dia para o WhatsApp do dono. */
export default async function handler(req: Req, res: Res): Promise<void> {
  // A Vercel envia "Authorization: Bearer <CRON_SECRET>" quando a variável existe. Sem ela, recusa tudo.
  if (!env.cronSecret() || header(req, 'authorization') !== `Bearer ${env.cronSecret()}`) return json(res, 401, { error: 'não autorizado' })
  const ready = readiness()
  if (!ready.supabase || !ready.whatsapp) return json(res, 200, { sent: false, reason: 'servidor não configurado' })
  try {
    const template = env.summaryTemplate()
    json(res, 200, await sendDailySummary(createSupabaseStore(), {
      sendText,
      sendTemplate: template ? (to, text) => sendTemplate(to, template, [text]) : undefined,
      now: new Date(),
    }))
  } catch (err) {
    console.error('resumo diário: falha', err instanceof Error ? err.name : 'erro')
    json(res, 200, { sent: false, reason: 'falha ao enviar o resumo' })
  }
}
