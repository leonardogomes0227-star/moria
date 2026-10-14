import { repo } from '@/lib/data'
import { applyStock, orderIngredientUse } from '@/lib/finance/stock'
import type { Order, OrderStatus } from '@/lib/types'

/**
 * Depois de mudar o status de um pedido, acerta o estoque (se o dono ligou a baixa automática):
 * concluir desconta os insumos da ficha técnica; cancelar um pedido já concluído devolve.
 * Devolve um aviso curto para mostrar ao dono, ou `null` se nada mudou.
 */
export async function syncStock(order: Order, status: OrderStatus): Promise<string | null> {
  const settings = await repo.finance.settings.get()
  if (!settings.baixa_estoque) return null
  const dar = status === 'concluido' && !order.estoque_baixado
  const devolver = status === 'cancelado' && order.estoque_baixado === true
  if (!dar && !devolver) return null

  const [recipes, ingredients] = await Promise.all([repo.finance.recipes.list(), repo.finance.ingredients.list()])
  const { use, semFicha } = orderIngredientUse(order, recipes)
  const changed = applyStock(ingredients, use, dar ? -1 : 1)
  for (const ing of changed) await repo.finance.ingredients.save(ing)
  await repo.orders.markStock(order.id, dar)
  const nota = semFicha.length ? ` Sem ficha técnica (não descontou): ${semFicha.join(', ')}.` : ''
  return `${dar ? 'Estoque atualizado' : 'Estoque devolvido'} (${changed.length} ingredientes).${nota}`
}
