import { create } from 'zustand'
import { createJSONStorage, persist } from 'zustand/middleware'
import { useSession } from '@/hooks/useSession'
import { config } from '@/lib/config'
import { getSupabase, isSupabaseConfigured } from '@/lib/supabase'

interface DemoAuth {
  signedIn: boolean
  set: (v: boolean) => void
}

const useDemoAuth = create<DemoAuth>()(
  persist((set) => ({ signedIn: false, set: (signedIn) => set({ signedIn }) }), {
    name: 'moria-demo:auth',
    storage: createJSONStorage(() => localStorage),
  }),
)

export type AdminSession =
  { status: 'loading' } | { status: 'out' } | { status: 'in'; email: string }

/** Sessão do painel: Supabase Auth quando configurado; senão login de demonstração. */
export function useAdminSession(): AdminSession {
  const supabaseSession = useSession()
  const demoIn = useDemoAuth((s) => s.signedIn)
  if (!isSupabaseConfigured)
    return demoIn ? { status: 'in', email: config.demo.email } : { status: 'out' }
  if (supabaseSession === undefined) return { status: 'loading' }
  return supabaseSession
    ? { status: 'in', email: supabaseSession.user.email ?? '' }
    : { status: 'out' }
}

/** Devolve a mensagem de erro, ou `null` se entrou. */
export async function signIn(email: string, password: string): Promise<string | null> {
  if (!isSupabaseConfigured) {
    if (
      email.trim().toLowerCase() === config.demo.email &&
      password === config.demo.password
    ) {
      useDemoAuth.getState().set(true)
      return null
    }
    return 'E-mail ou senha inválidos.'
  }
  const sb = await getSupabase()
  const { error } = (await sb?.auth.signInWithPassword({ email, password })) ?? {
    error: new Error('x'),
  }
  return error ? 'E-mail ou senha inválidos.' : null
}

export async function signOut() {
  if (!isSupabaseConfigured) return useDemoAuth.getState().set(false)
  await (await getSupabase())?.auth.signOut()
}
