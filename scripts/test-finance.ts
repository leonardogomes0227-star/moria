// Teste dos cálculos financeiros. Rode: node --experimental-strip-types scripts/test-finance.ts
import assert from 'node:assert/strict'
import {
  seedExpenses,
  seedFinanceSettings,
  seedIngredients,
  seedRecipes,
  seedStaff,
} from '../src/data/financeSeed.ts'
import { applyStock, orderIngredientUse } from '../src/lib/finance/stock.ts'
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

// Bacon Supremo 1.0: blend 5,00 + pão 1,375 + emb 0,85 + sacola 0,20 + bacon 1,44 + cheddar 1,52 + maionese 0,35 + rúcula 0,75 + tomate 0,21 + cebola 0,15
const h1 = itemCost('h1', ctx)
assert.ok(h1.complete)
near(h1.cost, 5 + 1.375 + 0.85 + 0.2 + 1.44 + 1.52 + 0.35 + 0.75 + 0.21 + 0.15, 0.01)

// combo = soma dos componentes (o cardápio real não tem combo; este é montado só para o teste)
const comboRecipe = { item_id: 'combo-x', linhas: [{ tipo: 'item' as const, ref: 't4', qtd: 1 }, { tipo: 'item' as const, ref: 'd1', qtd: 2 }] }
const comboCtx = buildContext(seedIngredients, [...seedRecipes, comboRecipe])
near(itemCost('combo-x', comboCtx).cost, itemCost('t4', ctx).cost + 2 * itemCost('d1', ctx).cost)

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
// baixa de estoque
{
  const r = seedRecipes[0]
  const itemId = r.item_id
  const order = { itens: [{ item_id: itemId, nome: 'X', qtd: 2, preco: 10, adicionais: [], obs: '' }, { nome: 'Sem ficha', qtd: 1, preco: 5, adicionais: [], obs: '' }] }
  const { use, semFicha } = orderIngredientUse(order, seedRecipes)
  assert.deepEqual(semFicha, ['Sem ficha'])
  for (const l of r.linhas) if (l.tipo === 'ingrediente') near(use.get(l.ref) ?? 0, l.qtd * 2)
  const before = seedIngredients.filter((i) => use.has(i.id))
  const after = applyStock(seedIngredients, use, -1)
  assert.equal(after.length, before.length)
  for (const a of after) assert.ok(a.estoque <= (seedIngredients.find((i) => i.id === a.id)?.estoque ?? 0))
  const back = applyStock(after, use, 1)
  for (const b of back) near(b.estoque, seedIngredients.find((i) => i.id === b.id)?.estoque ?? -1)
  // nunca negativo
  const huge = applyStock(seedIngredients, new Map([[before[0].id, 1e9]]), -1)
  assert.equal(huge[0].estoque, 0)
  // combo soma os itens
  const cu = orderIngredientUse({ itens: [{ item_id: 'combo-x', nome: 'Combo', qtd: 1, preco: 1, adicionais: [], obs: '' }] }, [...seedRecipes, comboRecipe])
  assert.deepEqual(cu.semFicha, [])
  near(cu.use.get('i-lata') ?? 0, 2)
  near(cu.use.get('i-bacon') ?? 0, 30)
}
console.log('finance: tudo certo')
