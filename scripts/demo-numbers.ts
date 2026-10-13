// Mostra os números do histórico fictício. Rode: node --experimental-strip-types scripts/demo-numbers.ts
import {
  seedExpenses,
  seedFinanceSettings,
  seedIngredients,
  seedRecipes,
  seedStaff,
} from '../src/data/financeSeed.ts'
import { menuItems } from '../src/data/menu.ts'
import { buildDemoOrders } from '../src/lib/data/demoOrders.ts'
import { buildContext, summarizePeriod } from '../src/lib/finance/calc.ts'

const now = new Date()
const orders = buildDemoOrders(now.getTime())
const ctx = buildContext(seedIngredients, seedRecipes)
const month = (d: Date) =>
  new Intl.DateTimeFormat('en-CA', { timeZone: 'America/Campo_Grande' })
    .format(d)
    .slice(0, 7)
const prev = new Date(now.getFullYear(), now.getMonth() - 1, 15)
for (const m of [month(prev), month(now)]) {
  const s = summarizePeriod({
    month: m,
    now,
    timeZone: 'America/Campo_Grande',
    orders,
    menu: menuItems,
    ctx,
    expenses: seedExpenses,
    staff: seedStaff,
    settings: seedFinanceSettings,
  })
  console.log(
    m,
    `pedidos=${s.orders} fatur=${s.revenue.toFixed(0)} cmv=${((s.cmv / s.revenue) * 100).toFixed(1)}% custos=${s.totalCosts.toFixed(0)} lucro=${s.profit.toFixed(0)} margem=${(s.margin * 100).toFixed(1)}% eq=${s.breakEven?.toFixed(0)} prorate=${s.prorate.toFixed(2)}`,
  )
}
console.log('total pedidos', orders.length)
