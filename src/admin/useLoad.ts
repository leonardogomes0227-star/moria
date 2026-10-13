import { useCallback, useEffect, useRef, useState } from 'react'

interface LoadState<T> {
  data: T | null
  error: string
  loading: boolean
}

/** Carrega dados do painel; `pollMs` atualiza sozinho (ex.: lista de pedidos). */
export function useLoad<T>(fn: () => Promise<T>, pollMs?: number) {
  const [state, setState] = useState<LoadState<T>>({
    data: null,
    error: '',
    loading: true,
  })
  const latest = useRef(fn)
  useEffect(() => {
    latest.current = fn
  })

  const run = useCallback(async () => {
    try {
      const data = await latest.current()
      setState({ data, error: '', loading: false })
    } catch (err) {
      setState((s) => ({
        ...s,
        error: err instanceof Error ? err.message : 'Falha ao carregar.',
        loading: false,
      }))
    }
  }, [])

  useEffect(() => {
    void run()
    if (!pollMs) return
    const id = window.setInterval(() => void run(), pollMs)
    return () => window.clearInterval(id)
  }, [run, pollMs])

  return { ...state, reload: run }
}
