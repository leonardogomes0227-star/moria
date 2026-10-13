import { useEffect, useState } from 'react'
import { isOpenNow, nowInStoreTz } from '@/lib/hours'
import { useSettings } from '@/store/settings'

/** "Aberto agora" calculado no fuso da loja, reavaliado a cada 30 s. */
export function useOpenNow() {
  const hours = useSettings((s) => s.settings.hours)
  const [now, setNow] = useState(() => new Date())
  useEffect(() => {
    const id = window.setInterval(() => setNow(new Date()), 30_000)
    return () => window.clearInterval(id)
  }, [])
  return { open: isOpenNow(hours, now), today: nowInStoreTz(now).day }
}
