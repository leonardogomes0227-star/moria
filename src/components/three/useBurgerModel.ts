import { useEffect, useState } from 'react'

export const MODEL_URL = '/models/burger.glb'

/** Detecta se existe /public/models/burger.glb (o dev server devolve HTML quando não existe). */
export function useHasModel(): boolean {
  const [has, setHas] = useState(false)
  useEffect(() => {
    const ctrl = new AbortController()
    fetch(MODEL_URL, { method: 'HEAD', signal: ctrl.signal })
      .then((res) =>
        setHas(res.ok && !(res.headers.get('content-type') ?? '').includes('text/html')),
      )
      .catch(() => setHas(false))
    return () => ctrl.abort()
  }, [])
  return has
}
