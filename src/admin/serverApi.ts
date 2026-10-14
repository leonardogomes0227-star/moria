import { getSupabase } from '@/lib/supabase'

/** Cabeçalho com o login do painel, para as chamadas ao servidor (/api). */
export async function authHeader(): Promise<Record<string, string>> {
  const sb = await getSupabase()
  const token = (await sb?.auth.getSession())?.data.session?.access_token
  return token ? { Authorization: `Bearer ${token}` } : {}
}
