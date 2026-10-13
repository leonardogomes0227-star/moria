import { useMemo } from 'react'
import { buildContext } from '@/lib/finance/calc'
import { defaultFinanceSettings } from '@/lib/finance/defaults'
import { repo } from '@/lib/data'
import { useLoad } from '../useLoad'

/** Carrega tudo que o financeiro precisa (cardápio, insumos, fichas, despesas, equipe, taxas). */
export function useFinanceData() {
  const menu = useLoad(() => repo.menu.list())
  const ingredients = useLoad(() => repo.finance.ingredients.list())
  const recipes = useLoad(() => repo.finance.recipes.list())
  const expenses = useLoad(() => repo.finance.expenses.list())
  const staff = useLoad(() => repo.finance.staff.list())
  const settings = useLoad(() => repo.finance.settings.get())

  const loaded = [menu, ingredients, recipes, expenses, staff, settings].every(
    (r) => r.data !== null,
  )
  const error =
    [menu, ingredients, recipes, expenses, staff, settings].find((r) => r.error)?.error ??
    ''

  const data = useMemo(
    () => ({
      menu: menu.data ?? [],
      ingredients: ingredients.data ?? [],
      recipes: recipes.data ?? [],
      expenses: expenses.data ?? [],
      staff: staff.data ?? [],
      settings: settings.data ?? defaultFinanceSettings,
    }),
    [menu.data, ingredients.data, recipes.data, expenses.data, staff.data, settings.data],
  )
  const ctx = useMemo(
    () => buildContext(data.ingredients, data.recipes),
    [data.ingredients, data.recipes],
  )

  const reload = async () => {
    await Promise.all([
      menu.reload(),
      ingredients.reload(),
      recipes.reload(),
      expenses.reload(),
      staff.reload(),
      settings.reload(),
    ])
  }

  return { ...data, ctx, loaded, error, reload }
}
