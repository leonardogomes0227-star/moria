import type { SupabaseClient } from '@supabase/supabase-js'
import { getSupabase } from '../supabase.ts'
import { defaultBotSettings, defaultFinanceSettings } from '../finance/defaults.ts'
import type {
  BotConversation,
  BotMessage,
  BotSettings,
  Employee,
  Expense,
  FinanceSettings,
  GalleryPhoto,
  Ingredient,
  MenuItem,
  Order,
  Recipe,
  Review,
  StoreSettings,
} from '../types.ts'
import type { Crud, Repo } from './repo.ts'

const BUCKET = 'menu-images'
const MAX_IMAGE_BYTES = 3 * 1024 * 1024

interface SettingsRow {
  whatsapp: string
  hours: StoreSettings['hours']
  delivery_fee: StoreSettings['deliveryFee']
  notice: string
  paused: boolean
  pause_message: string
  payments: StoreSettings['payments']
  min_order: number
}

async function client(): Promise<SupabaseClient> {
  const sb = await getSupabase()
  if (!sb) throw new Error('Supabase não configurado.')
  return sb
}

function check(error: { message: string } | null) {
  if (error) throw new Error(error.message)
}

async function rows<T>(table: string, order: string, ascending = true): Promise<T[]> {
  const { data, error } = await (
    await client()
  )
    .from(table)
    .select('*')
    .order(order, { ascending })
  check(error)
  return (data ?? []) as T[]
}

/** CRUD genérico sobre uma tabela com coluna `id`. */
function tableCrud<T extends { id: string }>(table: string, order = 'nome'): Crud<T> {
  return {
    list: () => rows<T>(table, order),
    async save(draft) {
      const { id, ...fields } = draft
      const sb = await client()
      check(
        (id
          ? await sb.from(table).update(fields).eq('id', id)
          : await sb.from(table).insert(fields)
        ).error,
      )
    },
    async remove(id) {
      check((await (await client()).from(table).delete().eq('id', id)).error)
    },
  }
}

/** Linha única (id = 1) com valores padrão quando ainda não existe. */
async function singleRow<T extends object>(table: string, fallback: T): Promise<T> {
  const { data, error } = await (
    await client()
  )
    .from(table)
    .select('*')
    .eq('id', 1)
    .maybeSingle()
  if (error || !data) return fallback
  const { id: _omit, ...rest } = data as Record<string, unknown>
  void _omit
  return { ...fallback, ...(rest as Partial<T>) }
}

const monthStart = (month: string) => `${month}-01T00:00:00Z`
const nextMonth = (month: string) => {
  const [y, m] = month.split('-').map(Number)
  const d = new Date(Date.UTC(y, m, 1))
  return `${d.getUTCFullYear()}-${String(d.getUTCMonth() + 1).padStart(2, '0')}-01T00:00:00Z`
}

export const supabaseRepo: Repo = {
  mode: 'supabase',

  menu: {
    list: () => rows<MenuItem>('menu_items', 'ordem'),
    async save(draft, nextOrder) {
      const { id, ...fields } = draft
      const sb = await client()
      const res = id
        ? await sb.from('menu_items').update(fields).eq('id', id)
        : await sb.from('menu_items').insert({ ...fields, ordem: nextOrder })
      check(res.error)
    },
    async patch(id, patch) {
      check((await (await client()).from('menu_items').update(patch).eq('id', id)).error)
    },
    async remove(id) {
      check((await (await client()).from('menu_items').delete().eq('id', id)).error)
    },
    async swap(a, b) {
      const sb = await client()
      const results = await Promise.all([
        sb
          .from('menu_items')
          .update({ ordem: b.ordem ?? 0 })
          .eq('id', a.id),
        sb
          .from('menu_items')
          .update({ ordem: a.ordem ?? 0 })
          .eq('id', b.id),
      ])
      check(results.find((r) => r.error)?.error ?? null)
    },
    async importMany(items) {
      const payload = items.map((i, index) => ({
        categoria: i.categoria,
        nome: i.nome,
        descricao: i.descricao,
        preco: i.preco,
        imagem: i.imagem,
        destaque: i.destaque,
        disponivel: i.disponivel,
        adicionais: i.adicionais,
        ordem: index,
      }))
      check((await (await client()).from('menu_items').insert(payload)).error)
    },
  },

  settings: {
    async get() {
      const { data, error } = await (
        await client()
      )
        .from('store_settings')
        .select('*')
        .eq('id', 1)
        .maybeSingle()
      if (error || !data) return null
      const r = data as SettingsRow
      return {
        whatsapp: r.whatsapp,
        hours: r.hours,
        deliveryFee: r.delivery_fee,
        notice: r.notice,
        paused: r.paused,
        pauseMessage: r.pause_message,
        payments: r.payments,
        minOrder: Number(r.min_order),
      }
    },
    async save(s) {
      const res = await (await client()).from('store_settings').upsert({
        id: 1,
        whatsapp: s.whatsapp,
        hours: s.hours,
        delivery_fee: s.deliveryFee,
        notice: s.notice,
        paused: s.paused,
        pause_message: s.pauseMessage,
        payments: s.payments,
        min_order: s.minOrder,
        updated_at: new Date().toISOString(),
      })
      check(res.error)
    },
  },

  orders: {
    async create(order) {
      check(
        (await (await client()).from('orders').insert({ ...order, status: 'novo' }))
          .error,
      )
    },
    list: async () => {
      const { data, error } = await (
        await client()
      )
        .from('orders')
        .select('*')
        .order('criado_em', { ascending: false })
        .limit(500)
      check(error)
      return (data ?? []) as Order[]
    },
    async setStatus(id, status) {
      check((await (await client()).from('orders').update({ status }).eq('id', id)).error)
    },
    async markStock(id, baixado) {
      check(
        (await (await client()).from('orders').update({ estoque_baixado: baixado }).eq('id', id))
          .error,
      )
    },
  },

  reviews: {
    list: () => rows<Review>('reviews', 'criado_em', false),
    async save(draft) {
      const { id, ...fields } = draft
      const sb = await client()
      check(
        (id
          ? await sb.from('reviews').update(fields).eq('id', id)
          : await sb.from('reviews').insert(fields)
        ).error,
      )
    },
    async remove(id) {
      check((await (await client()).from('reviews').delete().eq('id', id)).error)
    },
  },

  gallery: {
    list: () => rows<GalleryPhoto>('gallery_photos', 'criado_em'),
    async save(draft) {
      const { id, ...fields } = draft
      const sb = await client()
      check(
        (id
          ? await sb.from('gallery_photos').update(fields).eq('id', id)
          : await sb.from('gallery_photos').insert(fields)
        ).error,
      )
    },
    async remove(id) {
      check((await (await client()).from('gallery_photos').delete().eq('id', id)).error)
    },
  },

  finance: {
    ingredients: tableCrud<Ingredient>('ingredients'),
    expenses: tableCrud<Expense>('expenses'),
    staff: tableCrud<Employee>('employees'),
    recipes: {
      list: () => rows<Recipe>('recipes', 'item_id'),
      async save(recipe) {
        check((await (await client()).from('recipes').upsert(recipe)).error)
      },
      async remove(itemId) {
        check(
          (await (await client()).from('recipes').delete().eq('item_id', itemId)).error,
        )
      },
    },
    settings: {
      get: () => singleRow<FinanceSettings>('finance_settings', defaultFinanceSettings),
      async save(s) {
        check(
          (await (await client()).from('finance_settings').upsert({ id: 1, ...s })).error,
        )
      },
    },
  },

  bot: {
    settings: {
      get: () => singleRow<BotSettings>('bot_settings', defaultBotSettings),
      async save(s) {
        check((await (await client()).from('bot_settings').upsert({ id: 1, ...s })).error)
      },
    },
    async conversations() {
      const sb = await client()
      const [msgs, sessions] = await Promise.all([
        sb
          .from('bot_messages')
          .select('*')
          .order('criado_em', { ascending: false })
          .limit(400),
        sb.from('bot_sessions').select('*'),
      ])
      check(msgs.error)
      check(sessions.error)
      const byPhone = new Map<string, BotConversation>()
      const meta = new Map(
        (sessions.data ?? []).map(
          (r: { telefone: string; nome: string; humano_ate: string | null }) => [
            r.telefone,
            r,
          ],
        ),
      )
      for (const m of ((msgs.data ?? []) as BotMessage[]).reverse()) {
        const s = meta.get(m.telefone)
        const conv = byPhone.get(m.telefone) ?? {
          telefone: m.telefone,
          nome: s?.nome || m.telefone,
          ultima_em: m.criado_em,
          humano_ate: s?.humano_ate ?? null,
          mensagens: [],
        }
        conv.mensagens.push(m)
        conv.ultima_em = m.criado_em
        byPhone.set(m.telefone, conv)
      }
      return [...byPhone.values()].sort((a, b) => b.ultima_em.localeCompare(a.ultima_em))
    },
    async setHuman(telefone, ate) {
      const res = await (
        await client()
      )
        .from('bot_sessions')
        .upsert({ telefone, humano_ate: ate })
      check(res.error)
    },
    async usage(month) {
      const { data, error } = await (
        await client()
      )
        .from('bot_messages')
        .select('tokens_in,tokens_out,tokens_cache')
        .gte('criado_em', monthStart(month))
        .lt('criado_em', nextMonth(month))
      check(error)
      const list = (data ?? []) as Pick<
        BotMessage,
        'tokens_in' | 'tokens_out' | 'tokens_cache'
      >[]
      return {
        mensagens: list.length,
        tokens_in: list.reduce((n, m) => n + m.tokens_in, 0),
        tokens_out: list.reduce((n, m) => n + m.tokens_out, 0),
        tokens_cache: list.reduce((n, m) => n + m.tokens_cache, 0),
      }
    },
  },

  async uploadImage(file) {
    if (!file.type.startsWith('image/')) throw new Error('Envie um arquivo de imagem.')
    if (file.size > MAX_IMAGE_BYTES) throw new Error('A imagem deve ter no máximo 3 MB.')
    const ext =
      file.name
        .split('.')
        .pop()
        ?.toLowerCase()
        .replace(/[^a-z0-9]/g, '') || 'jpg'
    const path = `${crypto.randomUUID()}.${ext}`
    const sb = await client()
    const { error } = await sb.storage
      .from(BUCKET)
      .upload(path, file, { cacheControl: '31536000', contentType: file.type })
    check(error)
    return sb.storage.from(BUCKET).getPublicUrl(path).data.publicUrl
  },
}
