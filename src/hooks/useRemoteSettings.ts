import { useEffect } from 'react'
import { fetchSettings } from '@/lib/api'
import { useSettings } from '@/store/settings'

/** Carrega horários, WhatsApp, taxa e aviso do Supabase (se configurado) por cima do config.ts. */
export function useRemoteSettings() {
  const setSettings = useSettings((s) => s.setSettings)
  useEffect(() => {
    let cancelled = false
    void fetchSettings().then((remote) => {
      if (remote && !cancelled) setSettings(remote)
    })
    return () => {
      cancelled = true
    }
  }, [setSettings])
}
