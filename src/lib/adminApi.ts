import { MENU_TABLE, SETTINGS_TABLE } from './api'
import { getSupabase } from './supabase'
import type { MenuItem, StoreSettings } from './types'

const BUCKET = 'menu-images'
const MAX_IMAGE_BYTES = 3 * 1024 * 1024

async function client() {
  const sb = await getSupabase()
  if (!sb) throw new Error('Supabase não configurado.')
  return sb
}

function unwrap<T>(res: { data: T | null; error: { message: string } | null }): T {
  if (res.error) throw new Error(res.error.message)
  return res.data as T
}

export type MenuDraft = Omit<MenuItem, 'id' | 'ordem'> & { id?: string }

export async function listMenu(): Promise<MenuItem[]> {
  const res = await (
    await client()
  )
    .from(MENU_TABLE)
    .select('*')
    .order('ordem', { ascending: true })
  return unwrap(res) ?? []
}

export async function saveItem(draft: MenuDraft, nextOrder: number): Promise<void> {
  const { id, ...fields } = draft
  const sb = await client()
  const res = id
    ? await sb.from(MENU_TABLE).update(fields).eq('id', id)
    : await sb.from(MENU_TABLE).insert({ ...fields, ordem: nextOrder })
  if (res.error) throw new Error(res.error.message)
}

export async function patchItem(
  id: string,
  patch: Partial<Pick<MenuItem, 'disponivel' | 'destaque'>>,
): Promise<void> {
  const res = await (await client()).from(MENU_TABLE).update(patch).eq('id', id)
  if (res.error) throw new Error(res.error.message)
}

export async function deleteItem(id: string): Promise<void> {
  const res = await (await client()).from(MENU_TABLE).delete().eq('id', id)
  if (res.error) throw new Error(res.error.message)
}

/** Troca a posição de dois itens. */
export async function swapOrder(a: MenuItem, b: MenuItem): Promise<void> {
  const sb = await client()
  const results = await Promise.all([
    sb
      .from(MENU_TABLE)
      .update({ ordem: b.ordem ?? 0 })
      .eq('id', a.id),
    sb
      .from(MENU_TABLE)
      .update({ ordem: a.ordem ?? 0 })
      .eq('id', b.id),
  ])
  const failed = results.find((r) => r.error)
  if (failed?.error) throw new Error(failed.error.message)
}

export async function importItems(items: MenuItem[]): Promise<void> {
  const rows = items.map((item, index) => ({
    categoria: item.categoria,
    nome: item.nome,
    descricao: item.descricao,
    preco: item.preco,
    imagem: item.imagem,
    destaque: item.destaque,
    disponivel: item.disponivel,
    adicionais: item.adicionais,
    ordem: index,
  }))
  const res = await (await client()).from(MENU_TABLE).insert(rows)
  if (res.error) throw new Error(res.error.message)
}

export async function uploadImage(file: File): Promise<string> {
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
  if (error) throw new Error(error.message)
  return sb.storage.from(BUCKET).getPublicUrl(path).data.publicUrl
}

export async function saveSettings(s: StoreSettings): Promise<void> {
  const res = await (await client()).from(SETTINGS_TABLE).upsert({
    id: 1,
    whatsapp: s.whatsapp,
    hours: s.hours,
    delivery_fee: s.deliveryFee,
    notice: s.notice,
    updated_at: new Date().toISOString(),
  })
  if (res.error) throw new Error(res.error.message)
}
