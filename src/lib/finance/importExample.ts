import {
  seedExpenses,
  seedFinanceSettings,
  seedIngredients,
  seedRecipes,
  seedStaff,
} from '../../data/financeSeed.ts'
import { menuItems as seedMenu } from '../../data/menu.ts'
import { repo } from '../data/index.ts'
import type { Recipe } from '../types.ts'

/**
 * Importa os dados de exemplo (valores fictícios) para o banco real.
 * As fichas são ligadas aos itens do cardápio pelo NOME, porque os ids do banco são diferentes.
 */
export async function importFinanceExample(): Promise<void> {
  const menu = await repo.menu.list()
  const idByName = new Map(menu.map((m) => [m.nome, m.id]))
  const nameBySeedId = new Map(seedMenu.map((m) => [m.id, m.nome]))
  const realId = (seedId: string) => {
    const name = nameBySeedId.get(seedId)
    return name ? idByName.get(name) : undefined
  }

  // Insumos: o banco gera ids novos, então guardamos o mapa seed → id real.
  const existing = await repo.finance.ingredients.list()
  const ingId = new Map<string, string>()
  for (const ing of seedIngredients) {
    const found = existing.find((e) => e.nome === ing.nome)
    if (found) {
      ingId.set(ing.id, found.id)
      continue
    }
    const { id: _seedId, ...fields } = ing
    void _seedId
    await repo.finance.ingredients.save(fields)
  }
  const saved = await repo.finance.ingredients.list()
  for (const ing of seedIngredients) {
    const match = saved.find((e) => e.nome === ing.nome)
    if (match) ingId.set(ing.id, match.id)
  }

  for (const r of seedRecipes) {
    const itemId = realId(r.item_id)
    if (!itemId) continue
    const linhas: Recipe['linhas'] = r.linhas.flatMap((l) => {
      const ref = l.tipo === 'ingrediente' ? ingId.get(l.ref) : realId(l.ref)
      return ref ? [{ ...l, ref }] : []
    })
    await repo.finance.recipes.save({ item_id: itemId, linhas })
  }
  for (const e of seedExpenses) {
    const { id: _e, ...fields } = e
    void _e
    await repo.finance.expenses.save(fields)
  }
  for (const s of seedStaff) {
    const { id: _s, ...fields } = s
    void _s
    await repo.finance.staff.save(fields)
  }
  await repo.finance.settings.save(seedFinanceSettings)
}
