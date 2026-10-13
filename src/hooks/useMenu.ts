import { useCallback, useEffect, useState } from 'react'
import { fetchMenu, type MenuResult } from '@/lib/api'

export function useMenu() {
  const [result, setResult] = useState<MenuResult | null>(null)
  const [attempt, setAttempt] = useState(0)

  useEffect(() => {
    let cancelled = false
    void fetchMenu().then((r) => {
      if (!cancelled) setResult(r)
    })
    return () => {
      cancelled = true
    }
  }, [attempt])

  const reload = useCallback(() => {
    setResult(null)
    setAttempt((n) => n + 1)
  }, [])

  return {
    items: result?.items ?? [],
    loading: result === null,
    degraded: result?.degraded ?? false,
    reload,
  }
}
