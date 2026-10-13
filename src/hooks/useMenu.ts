import { useEffect } from 'react'
import { useMenuStore } from '@/store/menu'

/** Dispara a busca do cardápio (uma vez) e devolve o estado compartilhado. */
export function useMenu() {
  const { items, loading, degraded, load } = useMenuStore()
  useEffect(() => {
    void load()
  }, [load])
  return { items, loading, degraded, reload: () => void load(true) }
}
