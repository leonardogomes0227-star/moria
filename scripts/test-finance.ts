// Teste dos cálculos financeiros. Rode: node --experimental-strip-types scripts/test-finance.ts
import assert from 'node:assert/strict'
import {
  seedExpenses,
  seedFinanceSettings,
  seedIngredients,
  seedRecipes,
  seedStaff,
} from '../src/data/financeSeed.ts'
import { menuItems } from '../src/data/menu.ts'
import {
  buildContext,
  employeeMonthlyCost,
  itemCost,
  itemEconomics,
  lowStock,
  summarizePeriod,
  unitCost,
} from '../src/lib/finance/calc.ts'
import type { Order } from '../src/lib/types.ts'

const ctx = buildContext(seedIngredients, seedRecipes)
const near = (a: number, b: number, eps = 0.005) =>
  assert.ok(Math.abs(a - b) < eps, `${a} != ${b}`)

// custo unitário = preço ÷ quantidade
near(unitCost({ preco_compra: 130, qtd_compra: 20 }), 6.5)

// Moriá Clássico: blend 6,50 + pão 1,75 + queijo 0,90 + alface 0,24 + tomate 0,21 + molho 0,54 + emb 0,85 + sacola 0,20
const h1 = itemCost('h1', ctx)
assert.ok(h1.complete)
near(h1.cost, 6.5 + 1.75 + 0.9 + 0.24 + 0.21 + 0.54 + 0.85 + 0.2, 0.01)

// combo = soma dos componentes
const c1 = itemCost('c1', ctx)
near(
  c1.cost,
  itemCost('h1', ctx).cost + itemCost('a1', ctx).cost + itemCost('d1', ctx).cost,
)

// item sem ficha → incompleto
assert.equal(itemCost('nao-existe', ctx).complete, false)

// todo item do cardápio de exemplo tem ficha completa
for (const m of menuItems) assert.ok(itemCost(m.id, ctx).complete, `sem ficha: ${m.id}`)

// preço sugerido atinge a meta de lucro
const h1item = menuItems.find((m) => m.id === 'h1')!
const eco = itemEconomics(h1item, ctx, seedFinanceSettings)
assert.ok(eco.suggested !== null)
const check = itemEconomics({ id: 'h1', preco: eco.suggested! }, ctx, seedFinanceSettings)
near(check.margin, seedFinanceSettings.meta_lucro_pct / 100, 0.001)

// folha: diária 90 × 22 dias, sem encargos = 1980; mensal 2200 + 30% = 2860
near(employeeMonthlyCost(seedStaff[2]), 1980)
near(employeeMonthlyCost(seedStaff[0]), 2860)

// DRE de um mês fechado, 2 pedidos + 1 cancelado
const order = (
  n: number,
  total: number,
  tipo: 'entrega' | 'retirada',
  status: Order['status'],
  pagamento: Order['pagamento'],
): Order => ({
  id: String(n),
  numero: n,
  criado_em: '2026-09-10T15:00:00Z',
  origem: 'site',
  status,
  tipo,
  cliente_nome: 'x',
  cliente_telefone: '',
  endereco: '',
  pagamento,
  troco: '',
  obs: '',
  itens: [
    { item_id: 'h1', nome: 'Moriá Clássico', qtd: 1, preco: 28, adicionais: [], obs: '' },
  ],
  subtotal: total - (tipo === 'entrega' ? 5 : 0),
  entrega: tipo === 'entrega' ? 5 : 0,
  total,
})
const orders = [
  order(1, 33, 'entrega', 'concluido', 'Cartão'),
  order(2, 28, 'retirada', 'concluido', 'Pix'),
  order(3, 33, 'entrega', 'cancelado', 'Pix'),
]
const sum = summarizePeriod({
  month: '2026-09',
  now: new Date('2026-10-13T12:00:00Z'),
  timeZone: 'America/Campo_Grande',
  orders,
  menu: menuItems,
  ctx,
  expenses: seedExpenses,
  staff: seedStaff,
  settings: seedFinanceSettings,
})
assert.equal(sum.orders, 2)
near(sum.revenue, 61)
near(sum.deliveryIncome, 5)
near(sum.cmv, h1.cost * 2, 0.01)
near(sum.cardFees, 33 * 0.03)
near(sum.taxes, 61 * 0.06)
near(sum.courier, 6) // 1 entrega × R$ 6
assert.equal(sum.prorate, 1)
near(
  sum.totalCosts,
  sum.cmv + sum.cardFees + sum.taxes + sum.labor + sum.courier + sum.expenses,
)
near(sum.profit, sum.revenue - sum.totalCosts)
assert.ok(sum.breakEven !== null && sum.breakEven > 0)

// mês corrente rateia custos fixos pelos dias passados
const cur = summarizePeriod({
  month: '2026-10',
  now: new Date('2026-10-13T12:00:00Z'),
  timeZone: 'America/Campo_Grande',
  orders: [],
  menu: menuItems,
  ctx,
  expenses: seedExpenses,
  staff: seedStaff,
  settings: seedFinanceSettings,
})
near(cur.prorate, 13 / 31, 0.001)

// estoque baixo
assert.ok(lowStock(seedIngredients).some((i) => i.id === 'i-bacon'))
console.log('finance: tudo certo')
