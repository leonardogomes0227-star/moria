import type { SupabaseClient } from '@supabase/supabase-js'

const url = import.meta.env.VITE_SUPABASE_URL
const key = import.meta.env.VITE_SUPABASE_ANON_KEY

export const isSupabaseConfigured = Boolean(url && key)

let clientPromise: Promise<SupabaseClient> | null = null

/** Cliente carregado sob demanda (fica fora do bundle inicial). `null` se não houver variáveis de ambiente. */
export function getSupabase(): Promise<SupabaseClient | null> {
  if (!url || !key) return Promise.resolve(null)
  clientPromise ??= import('@supabase/supabase-js').then((m) => m.createClient(url, key))
  return clientPromise
}
