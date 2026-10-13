import { createClient } from '@supabase/supabase-js'
import { env } from './env.js'
import { header, type Req } from './http.js'

/** Confere se o token (login do painel) pertence a um usuário autenticado do Supabase. Devolve o id ou null. */
export async function authedUser(req: Req): Promise<string | null> {
  const token = header(req, 'authorization')?.replace(/^Bearer\s+/i, '')
  if (!token || !env.supabaseUrl() || !env.supabaseServiceKey()) return null
  const sb = createClient(env.supabaseUrl(), env.supabaseServiceKey(), { auth: { persistSession: false } })
  const { data, error } = await sb.auth.getUser(token)
  return error || !data.user ? null : data.user.id
}
