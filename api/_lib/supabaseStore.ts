import { createClient, type SupabaseClient } from '@supabase/supabase-js'
import { defaultSettings } from '../../src/lib/config.ts'
import { defaultBotSettings } from '../../src/lib/finance/defaults.ts'
import type { MenuItem, NewOrder, StoreSettings } from '../../src/lib/types.ts'
import { env } from './env.js'
import { isOpenAt } from './hours.js'
import type { BotStore, ChatTurn, StoreInfo, Usage } from './types.js'
import { sendText, type Incoming } from './whatsapp.js'
import type { WebhookStore } from './webhook.js'

let cached: SupabaseClient | null = null

/** Cliente com a chave de serviço (ignora RLS). Só existe no servidor. */
export function serviceClient(): SupabaseClient {
  if (!cached) cached = createClient(env.supabaseUrl(), env.supabaseServiceKey(), { auth: { persistSession: false } })
  return cached
}

const ok = (error: { message: string } | null) => {
  if (error) throw new Error(error.message)
}

const HOURS = 3_600_000

export function createSupabaseStore(sb: SupabaseClient = serviceClient()): WebhookStore {
  const store: WebhookStore = {
    async loadStore(): Promise<StoreInfo> {
      const [menu, settings, bot] = await Promise.all([
        sb.from('menu_items').select('*').order('ordem'),
        sb.from('store_settings').select('*').eq('id', 1).maybeSingle(),
        sb.from('bot_settings').select('*').eq('id', 1).maybeSingle(),
      ])
      ok(menu.error)
      ok(settings.error)
      ok(bot.error)
      const r = settings.data as Record<string, unknown> | null
      const s: StoreSettings = r
        ? {
            whatsapp: r.whatsapp as string,
            hours: r.hours as StoreSettings['hours'],
            deliveryFee: r.delivery_fee as StoreSettings['deliveryFee'],
            notice: (r.notice as string) ?? '',
            paused: Boolean(r.paused),
            pauseMessage: (r.pause_message as string) ?? defaultSettings.pauseMessage,
            payments: (r.payments as StoreSettings['payments']) ?? defaultSettings.payments,
            minOrder: Number(r.min_order ?? 0),
          }
        : defaultSettings
      const { id: _id, ...botRest } = (bot.data ?? {}) as Record<string, unknown>
      void _id
      const tz = env.timezone()
      return {
        name: env.storeName(),
        address: env.storeAddress(),
        instagram: env.storeInstagram(),
        timezone: tz,
        settings: s,
        bot: { ...defaultBotSettings, ...botRest },
        menu: ((menu.data ?? []) as MenuItem[]).map((m) => ({ ...m, preco: Number(m.preco) })),
        open: isOpenAt(s.hours, new Date(), tz),
      }
    },

    async history(phone, limit) {
      const { data, error } = await sb.from('bot_messages').select('papel,texto').eq('telefone', phone).order('criado_em', { ascending: false }).limit(limit)
      ok(error)
      return toTurns((data ?? []).reverse())
    },

    async historyBefore(phone, waId, limit) {
      const { data, error } = await sb.from('bot_messages').select('papel,texto,wa_id').eq('telefone', phone).order('criado_em', { ascending: false }).limit(limit + 1)
      ok(error)
      const rows = (data ?? []).filter((m) => m.wa_id !== waId).slice(0, limit).reverse()
      return toTurns(rows)
    },

    async createOrder(order: NewOrder) {
      const { data, error } = await sb.from('orders').insert({ ...order, status: 'novo' }).select('numero').single()
      ok(error)
      return { numero: Number((data as { numero: number }).numero) }
    },

    async ordersOf(phone, limit) {
      const { data, error } = await sb
        .from('orders')
        .select('numero,status,tipo,total,criado_em,itens,cliente_nome,endereco')
        .eq('cliente_telefone', phone)
        .order('criado_em', { ascending: false })
        .limit(limit)
      ok(error)
      return (data ?? []) as Awaited<ReturnType<BotStore['ordersOf']>>
    },

    async requestHuman(phone, customerName, reason, hours) {
      const until = new Date(Date.now() + hours * HOURS).toISOString()
      const res = await sb.from('bot_sessions').upsert({ telefone: phone, nome: customerName, humano_ate: until, atualizado_em: new Date().toISOString() })
      ok(res.error)
      const { data } = await sb.from('bot_settings').select('telefone_dono').eq('id', 1).maybeSingle()
      const owner = ((data as { telefone_dono?: string } | null)?.telefone_dono ?? '').replace(/\D/g, '')
      if (owner) {
        await sendText(owner, `🔔 Cliente pediu atendimento humano\n${customerName || phone} (${phone})\nMotivo: ${reason}\nO robô fica em silêncio por ${hours}h para esse cliente.`).catch(() => undefined)
      }
    },

    async claimMessage(msg: Incoming) {
      const { error } = await sb.from('bot_messages').insert({ wa_id: msg.id, telefone: msg.from, papel: 'cliente', texto: (msg.text || `[${msg.type}]`).slice(0, 2000) })
      if (error) {
        if (error.code === '23505') return false
        throw new Error(error.message)
      }
      if (msg.name) {
        const res = await sb.from('bot_sessions').upsert({ telefone: msg.from, nome: msg.name, atualizado_em: new Date().toISOString() }, { ignoreDuplicates: false })
        ok(res.error)
      }
      return true
    },

    async setMessageText(waId, text) {
      const res = await sb.from('bot_messages').update({ texto: text.slice(0, 2000) }).eq('wa_id', waId)
      ok(res.error)
    },

    async humanUntil(phone) {
      const { data, error } = await sb.from('bot_sessions').select('humano_ate').eq('telefone', phone).maybeSingle()
      ok(error)
      const v = (data as { humano_ate: string | null } | null)?.humano_ate
      return v ? new Date(v) : null
    },

    async recentCustomerMessages(phone, minutes) {
      const since = new Date(Date.now() - minutes * 60_000).toISOString()
      const { count, error } = await sb.from('bot_messages').select('id', { count: 'exact', head: true }).eq('telefone', phone).eq('papel', 'cliente').gte('criado_em', since)
      ok(error)
      return count ?? 0
    },

    async monthUsage(now) {
      const start = new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), 1)).toISOString()
      const { data, error } = await sb.from('bot_messages').select('tokens_in,tokens_out,tokens_cache').gte('criado_em', start)
      ok(error)
      const rows = (data ?? []) as Usage[]
      return {
        tokens_in: rows.reduce((n, m) => n + m.tokens_in, 0),
        tokens_out: rows.reduce((n, m) => n + m.tokens_out, 0),
        tokens_cache: rows.reduce((n, m) => n + m.tokens_cache, 0),
      }
    },

    async saveReply(phone: string, text: string, usage: Usage) {
      const res = await sb.from('bot_messages').insert({ telefone: phone, papel: 'assistente', texto: text.slice(0, 4000), ...usage })
      ok(res.error)
    },
  }
  return store
}

/** cliente→user; assistente/atendente→assistant; a conversa precisa começar por uma fala do cliente. */
function toTurns(rows: { papel: string; texto: string }[]): ChatTurn[] {
  const turns: ChatTurn[] = rows.map((m) => ({ role: m.papel === 'cliente' ? 'user' : 'assistant', content: m.texto }))
  while (turns.length && turns[0].role !== 'user') turns.shift()
  return turns
}
