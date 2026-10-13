import { useEffect, useState } from 'react'

/** Começa com o seed (sem layout shift) e troca pela lista do banco/demo quando chega. */
export function useRemoteList<T>(initial: T[], fetcher: () => Promise<T[]>): T[] {
  const [list, setList] = useState<T[]>(initial)
  useEffect(() => {
    let cancelled = false
    void fetcher().then((remote) => {
      if (!cancelled) setList(remote)
    })
    return () => {
      cancelled = true
    }
  }, [fetcher])
  return list
}
