import type { Session } from '@supabase/supabase-js'
import { useEffect, useState } from 'react'
import { getSupabase } from '@/lib/supabase'

/** `undefined` = carregando; `null` = deslogado. */
export function useSession(): Session | null | undefined {
  const [session, setSession] = useState<Session | null | undefined>(undefined)
  useEffect(() => {
    let unsubscribe = () => {}
    let cancelled = false
    void getSupabase().then(async (sb) => {
      if (!sb || cancelled) return
      const { data } = await sb.auth.getSession()
      if (cancelled) return
      setSession(data.session)
      unsubscribe = sb.auth.onAuthStateChange((_event, next) => setSession(next)).data
        .subscription.unsubscribe
    })
    return () => {
      cancelled = true
      unsubscribe()
    }
  }, [])
  return session
}
