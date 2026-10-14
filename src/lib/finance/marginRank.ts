import type { FinanceSettings, MenuItem } from '../types.ts'
import { itemEconomics, type CostContext } from './calc.ts'

/** Itens disponíveis com ficha completa, dos que mais deixam lucro por unidade (em reais) para os que menos deixam. Bebidas ficam de fora. */
export function rankByProfit(menu: MenuItem[], ctx: CostContext, settings: FinanceSettings): { item: MenuItem; profit: number; margin: number }[] {
  return menu
    .filter((m) => m.disponivel && m.categoria !== 'Bebidas')
    .map((item) => ({ item, eco: itemEconomics(item, ctx, settings) }))
    .filter((r) => r.eco.complete && r.eco.profit > 0)
    .map((r) => ({ item: r.item, profit: r.eco.profit, margin: r.eco.margin }))
    .sort((a, b) => b.profit - a.profit)
}
