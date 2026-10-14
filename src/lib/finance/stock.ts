import type { Ingredient, Order, Recipe } from '../types.ts'

export interface StockUse {
  /** Quantidade consumida de cada insumo (na unidade do cadastro). */
  use: Map<string, number>
  /** Itens do pedido sem ficha técnica (não descontam nada). */
  semFicha: string[]
}

/** Quanto de cada insumo o pedido consome, pela ficha técnica (combos somam os itens). Adicionais não entram. */
export function orderIngredientUse(order: Pick<Order, 'itens'>, recipes: Recipe[]): StockUse {
  const byItem = new Map(recipes.map((r) => [r.item_id, r]))
  const use = new Map<string, number>()
  const semFicha = new Set<string>()

  const add = (itemId: string, qty: number, depth: number): boolean => {
    const recipe = byItem.get(itemId)
    if (!recipe || recipe.linhas.length === 0 || depth > 3) return false
    let ok = true
    for (const line of recipe.linhas) {
      if (line.tipo === 'ingrediente') use.set(line.ref, (use.get(line.ref) ?? 0) + line.qtd * qty)
      else ok = add(line.ref, qty * line.qtd, depth + 1) && ok
    }
    return ok
  }

  for (const line of order.itens) {
    if (!line.item_id || !add(line.item_id, line.qtd, 0)) semFicha.add(line.nome)
  }
  return { use, semFicha: [...semFicha] }
}

/** Novos registros dos insumos afetados. `sign` = -1 dá baixa; +1 devolve. Nunca deixa o estoque negativo. */
export function applyStock(ingredients: Ingredient[], use: Map<string, number>, sign: 1 | -1): Ingredient[] {
  const changed: Ingredient[] = []
  for (const ing of ingredients) {
    const qty = use.get(ing.id)
    if (!qty) continue
    const next = Math.max(0, Math.round((ing.estoque + sign * qty) * 10000) / 10000)
    changed.push({ ...ing, estoque: next })
  }
  return changed
}
