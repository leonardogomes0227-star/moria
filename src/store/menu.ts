import { create } from 'zustand'
import { fetchMenu } from '@/lib/api'
import { CATEGORIES, type Category, type MenuItem } from '@/lib/types'

interface MenuState {
  items: MenuItem[]
  loading: boolean
  degraded: boolean
  requested: boolean
  /** Categoria aberta no cardápio (também escolhida pelos cartões de categoria). */
  category: Category
  setCategory: (c: Category) => void
  load: (force?: boolean) => Promise<void>
}

/** Cardápio compartilhado: hero, destaques, categorias e cardápio usam a mesma busca. */
export const useMenuStore = create<MenuState>((set, get) => ({
  items: [],
  loading: true,
  degraded: false,
  requested: false,
  category: CATEGORIES[0],
  setCategory: (category) => set({ category }),
  load: async (force = false) => {
    if (get().requested && !force) return
    set({ requested: true, loading: true })
    const result = await fetchMenu()
    set({ items: result.items, degraded: result.degraded, loading: false })
  },
}))
