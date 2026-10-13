import type {
  Employee,
  Expense,
  FinanceSettings,
  Ingredient,
  MenuItem,
  Order,
  Recipe,
} from '../types.ts'

/**
 * Cálculos financeiros (funções puras). Convenções:
 * - Pedidos cancelados não contam.
 * - Faturamento = total cobrado do cliente (itens + taxa de entrega).
 * - Custos fixos do mês corrente são proporcionais aos dias já passados (`prorate`).
 */

export const unitCost = (i: Pick<Ingredient, 'preco_compra' | 'qtd_compra'>): number =>
  i.qtd_compra > 0 ? i.preco_compra / i.qtd_compra : 0

export interface CostContext {
  ingredients: Map<string, Ingredient>
  recipes: Map<string, Recipe>
}

export const buildContext = (
  ingredients: Ingredient[],
  recipes: Recipe[],
): CostContext => ({
  ingredients: new Map(ingredients.map((i) => [i.id, i])),
  recipes: new Map(recipes.map((r) => [r.item_id, r])),
})

export interface ItemCost {
  cost: number
  /** False quando falta ficha técnica (ou há insumo/combo não encontrado). */
  complete: boolean
}

/** Custo de uma unidade do item, somando os insumos da ficha (combos somam os itens). */
export function itemCost(itemId: string, ctx: CostContext, depth = 0): ItemCost {
  const recipe = ctx.recipes.get(itemId)
  if (!recipe || recipe.linhas.length === 0 || depth > 3)
    return { cost: 0, complete: false }
  let cost = 0
  let complete = true
  for (const line of recipe.linhas) {
    if (line.tipo === 'ingrediente') {
      const ing = ctx.ingredients.get(line.ref)
      if (!ing) {
        complete = false
        continue
      }
      cost += unitCost(ing) * line.qtd
    } else {
      const sub = itemCost(line.ref, ctx, depth + 1)
      cost += sub.cost * line.qtd
      complete = complete && sub.complete
    }
  }
  return { cost, complete }
}

export interface ItemEconomics {
  cost: number
  complete: boolean
  price: number
  /** CMV: custo ÷ preço (0–1). */
  cmv: number
  /** Sobra por unidade depois do custo, impostos e taxa de cartão. */
  profit: number
  /** Lucro ÷ preço (0–1). */
  margin: number
  /** Preço para atingir a meta de lucro. `null` se a meta for impossível. */
  suggested: number | null
}

export function itemEconomics(
  item: Pick<MenuItem, 'id' | 'preco'>,
  ctx: CostContext,
  settings: FinanceSettings,
): ItemEconomics {
  const { cost, complete } = itemCost(item.id, ctx)
  const variable = (settings.imposto_pct + settings.taxa_cartao_pct) / 100
  const profit = item.preco - cost - item.preco * variable
  const divisor = 1 - variable - settings.meta_lucro_pct / 100
  return {
    cost,
    complete,
    price: item.preco,
    cmv: item.preco > 0 ? cost / item.preco : 0,
    profit,
    margin: item.preco > 0 ? profit / item.preco : 0,
    suggested: complete && divisor > 0 ? cost / divisor : null,
  }
}

export const employeeMonthlyCost = (e: Employee): number => {
  const base =
    e.pagamento === 'mensal'
      ? e.valor
      : e.pagamento === 'diaria'
        ? e.valor * e.dias_mes
        : e.valor * e.horas_mes
  return base * (1 + e.encargos_pct / 100)
}

export const monthKey = (iso: string, timeZone: string): string =>
  new Intl.DateTimeFormat('en-CA', { timeZone }).format(new Date(iso)).slice(0, 7)

export interface PeriodInput {
  month: string // AAAA-MM
  now: Date
  timeZone: string
  orders: Order[]
  menu: MenuItem[]
  ctx: CostContext
  expenses: Expense[]
  staff: Employee[]
  settings: FinanceSettings
}

export interface Breakdown {
  label: string
  value: number
}

export interface PeriodSummary {
  month: string
  orders: number
  deliveries: number
  /** Soma de itens + taxas de entrega recebidas. */
  revenue: number
  itemsRevenue: number
  deliveryIncome: number
  cmv: number
  cardFees: number
  taxes: number
  labor: number
  courier: number
  expenses: number
  totalCosts: number
  profit: number
  /** Lucro ÷ faturamento (0–1). */
  margin: number
  /** Faturamento necessário para empatar. `null` se não der para calcular. */
  breakEven: number | null
  /** Fração do mês usada para ratear custos fixos (1 = mês fechado). */
  prorate: number
  /** Unidades vendidas sem ficha técnica (custo desconhecido). */
  unitsWithoutRecipe: number
  /** Custos fixos do mês cheio (antes do rateio). */
  fixedMonthly: number
  breakdown: Breakdown[]
  topProfit: { nome: string; qtd: number; profit: number }[]
}

const daysInMonth = (month: string): number => {
  const [y, m] = month.split('-').map(Number)
  return new Date(y, m, 0).getDate()
}

export function summarizePeriod(input: PeriodInput): PeriodSummary {
  const { month, now, timeZone, orders, menu, ctx, expenses, staff, settings } = input
  const nowMonth = new Intl.DateTimeFormat('en-CA', { timeZone }).format(now).slice(0, 7)
  const dim = daysInMonth(month)
  const today = Number(
    new Intl.DateTimeFormat('en-CA', { timeZone }).format(now).slice(8, 10),
  )
  const prorate = month === nowMonth ? Math.min(1, today / dim) : month > nowMonth ? 0 : 1

  const valid = orders.filter(
    (o) => o.status !== 'cancelado' && monthKey(o.criado_em, timeZone) === month,
  )
  const itemsRevenue = valid.reduce((n, o) => n + o.subtotal, 0)
  const deliveryIncome = valid.reduce(
    (n, o) => n + (o.tipo === 'entrega' ? (o.entrega ?? 0) : 0),
    0,
  )
  const revenue = itemsRevenue + deliveryIncome
  const deliveries = valid.filter((o) => o.tipo === 'entrega').length

  const menuById = new Map(menu.map((m) => [m.id, m]))
  const menuByName = new Map(menu.map((m) => [m.nome.toLowerCase(), m]))
  let cmv = 0
  let unitsWithoutRecipe = 0
  const perItem = new Map<string, { qtd: number; revenue: number; cost: number }>()

  for (const o of valid) {
    for (const line of o.itens) {
      const item =
        (line.item_id ? menuById.get(line.item_id) : undefined) ??
        menuByName.get(line.nome.toLowerCase())
      const base = item ? itemCost(item.id, ctx) : { cost: 0, complete: false }
      if (!base.complete) unitsWithoutRecipe += line.qtd
      const addonCost = line.adicionais.reduce(
        (n, name) => n + (item?.adicionais.find((a) => a.nome === name)?.custo ?? 0),
        0,
      )
      const lineCost = (base.cost + addonCost) * line.qtd
      cmv += lineCost
      const acc = perItem.get(line.nome) ?? { qtd: 0, revenue: 0, cost: 0 }
      acc.qtd += line.qtd
      acc.revenue += line.preco * line.qtd
      acc.cost += lineCost
      perItem.set(line.nome, acc)
    }
  }

  const cardRevenue = valid
    .filter((o) => o.pagamento === 'Cartão')
    .reduce((n, o) => n + o.total, 0)
  const cardFees = (cardRevenue * settings.taxa_cartao_pct) / 100
  const taxes = (revenue * settings.imposto_pct) / 100

  const laborMonthly = staff
    .filter((e) => e.ativo)
    .reduce((n, e) => n + employeeMonthlyCost(e), 0)
  const expensesMonthly = expenses
    .filter((e) => (e.recorrencia === 'mensal' ? true : e.mes === month))
    .reduce((n, e) => n + e.valor, 0)
  const courierFixedMonthly =
    settings.courier_modo === 'diaria'
      ? settings.courier_valor * settings.courier_dias
      : settings.courier_modo === 'mensal'
        ? settings.courier_valor
        : 0

  const labor = laborMonthly * prorate
  const expensesTotal = expensesMonthly * prorate
  const courier =
    settings.courier_modo === 'por_entrega'
      ? deliveries * settings.courier_valor
      : courierFixedMonthly * prorate

  const totalCosts = cmv + cardFees + taxes + labor + courier + expensesTotal
  const profit = revenue - totalCosts

  // Ponto de equilíbrio: custos fixos ÷ margem de contribuição (receita menos custos variáveis).
  const fixedMonthly =
    laborMonthly +
    expensesMonthly +
    (settings.courier_modo === 'por_entrega' ? 0 : courierFixedMonthly)
  const variableCosts =
    cmv + cardFees + taxes + (settings.courier_modo === 'por_entrega' ? courier : 0)
  const contribution = revenue > 0 ? (revenue - variableCosts) / revenue : 0
  const breakEven = contribution > 0 ? fixedMonthly / contribution : null

  const top = [...perItem.entries()]
    .map(([nome, v]) => ({ nome, qtd: v.qtd, profit: v.revenue - v.cost }))
    .sort((a, b) => b.profit - a.profit)
    .slice(0, 5)

  return {
    month,
    orders: valid.length,
    deliveries,
    revenue,
    itemsRevenue,
    deliveryIncome,
    cmv,
    cardFees,
    taxes,
    labor,
    courier,
    expenses: expensesTotal,
    totalCosts,
    profit,
    margin: revenue > 0 ? profit / revenue : 0,
    breakEven,
    prorate,
    unitsWithoutRecipe,
    fixedMonthly,
    breakdown: [
      { label: 'Ingredientes e embalagens (CMV)', value: cmv },
      { label: 'Equipe (mão de obra)', value: labor },
      { label: 'Motoboy', value: courier },
      { label: 'Despesas fixas e variáveis', value: expensesTotal },
      { label: 'Impostos', value: taxes },
      { label: 'Taxa de cartão', value: cardFees },
    ],
    topProfit: top,
  }
}

/** Itens com estoque abaixo do mínimo (ou zerado). */
export const lowStock = (ingredients: Ingredient[]): Ingredient[] =>
  ingredients.filter((i) => i.estoque_min > 0 && i.estoque <= i.estoque_min)

/** Meses (AAAA-MM) dos últimos `count` meses, do mais recente ao mais antigo. */
export function recentMonths(now: Date, timeZone: string, count = 6): string[] {
  const cur = new Intl.DateTimeFormat('en-CA', { timeZone }).format(now).slice(0, 7)
  const [y, m] = cur.split('-').map(Number)
  return Array.from({ length: count }, (_, i) => {
    const d = new Date(y, m - 1 - i, 1)
    return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`
  })
}
