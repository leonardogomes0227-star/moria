import { createClient, type SupabaseClient } from '@supabase/supabase-js'
import { buildContext } from '../../src/lib/finance/calc.ts'
import { defaultFinanceSettings } from '../../src/lib/finance/defaults.ts'
import { rankByProfit } from '../../src/lib/finance/marginRank.ts'
import type { OwnerPorts } from '../../src/lib/ownerCommands.ts'
import type { Ingredient, Order, Recipe } from '../../src/lib/types.ts'
import { defaultSettings } from '../../src/lib/config.ts'
import { defaultBotSettings } from '../../src/lib/finance/defaults.ts'
import type { MenuItem, NewOrder, StoreSettings } from '../../src/lib/types.ts'
import { env } from './env.js'
import { isOpenAt } from './hours.js'
import type { BotStore, ChatTurn, StoreInfo, Usage } from './types.js'
import { sendText, type Incoming } from './whatsapp.js'
import type { ServerStore } from './webhook.js'

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

/** O Postgres pode devolver numéricos como texto: converte os campos que são números. */
const numbers = (rows: unknown): Record<string, unknown>[] =>
  ((rows ?? []) as Record<string, unknown>[]).map((r) => Object.fromEntries(Object.entries(r).map(([k, v]) => [k, typeof v === 'string' && v.trim() !== '' && !Number.isNaN(Number(v)) && !/(id|nome|ref|grupo|unidade|tipo|modo)$/.test(k) ? Number(v) : v])))

export function createSupabaseStore(sb: SupabaseClient = serviceClient()): ServerStore {
  const store: ServerStore = {
    async loadStore(): Promise<StoreInfo> {
      const [menu, settings, bot, ings, recs, fin] = await Promise.all([
        sb.from('menu_items').select('*').order('ordem'),
        sb.from('store_settings').select('*').eq('id', 1).maybeSingle(),
        sb.from('bot_settings').select('*').eq('id', 1).maybeSingle(),
        sb.from('ingredients').select('*'),
        sb.from('recipes').select('*'),
        sb.from('finance_settings').select('*').eq('id', 1).maybeSingle(),
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
      const items = ((menu.data ?? []) as MenuItem[]).map((m) => ({ ...m, preco: Number(m.preco) }))
      // Itens que mais deixam lucro (só com fichas técnicas cadastradas): o robô os sugere primeiro quando faz sentido.
      const ctx = buildContext(numbers(ings.data) as unknown as Ingredient[], (recs.data ?? []) as Recipe[])
      const { id: _fid, ...finRest } = (fin.data ?? {}) as Record<string, unknown>
      void _fid
      const topProfit = rankByProfit(items, ctx, { ...defaultFinanceSettings, ...numbers([finRest])[0] }).slice(0, 5).map((r) => r.item.nome)
      return {
        name: env.storeName(),
        address: env.storeAddress(),
        instagram: env.storeInstagram(),
        timezone: tz,
        settings: s,
        bot: { ...defaultBotSettings, ...botRest },
        menu: items,
        site: env.storeSite() || undefined,
        open: isOpenAt(s.hours, new Date(), tz),
        topProfit,
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

    ownerPorts(timeZone, now): OwnerPorts {
      return {
        menu: async () => {
          const { data, error } = await sb.from('menu_items').select('*').order('ordem')
          ok(error)
          return ((data ?? []) as MenuItem[]).map((m) => ({ ...m, preco: Number(m.preco) }))
        },
        setAvailable: async (ids, available) => {
          const res = await sb.from('menu_items').update({ disponivel: available }).in('id', ids)
          ok(res.error)
        },
        setPaused: async (paused) => {
          const res = await sb.from('store_settings').update({ paused }).eq('id', 1)
          ok(res.error)
        },
        orders: async () => store.ordersSince(new Date(now().getTime() - 3 * 86_400_000).toISOString()),
        finance: async () => {
          const [ings, recs] = await Promise.all([sb.from('ingredients').select('*'), sb.from('recipes').select('*')])
          ok(ings.error)
          ok(recs.error)
          return { ingredients: numbers(ings.data) as unknown as Ingredient[], recipes: (recs.data ?? []) as Recipe[] }
        },
        now,
        timeZone,
      }
    },

    async ordersSince(iso: string): Promise<Order[]> {
      const { data, error } = await sb.from('orders').select('*').gte('criado_em', iso).order('criado_em', { ascending: false }).limit(1000)
      ok(error)
      return (numbers(data) as unknown as Order[])
    },

    async lastCustomerMessage(variants: string[]) {
      const { data, error } = await sb.from('bot_messages').select('telefone,criado_em').in('telefone', variants).eq('papel', 'cliente').order('criado_em', { ascending: false }).limit(1)
      ok(error)
      const row = (data ?? [])[0] as { telefone: string; criado_em: string } | undefined
      return row ? { telefone: row.telefone, criado_em: row.criado_em } : null
    },

    async getOrder(id: string): Promise<Order | null> {
      const { data, error } = await sb.from('orders').select('*').eq('id', id).maybeSingle()
      ok(error)
      return data ? (numbers([data])[0] as unknown as Order) : null
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
