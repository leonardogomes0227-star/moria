// Testa comandos do dono, resumo do dia e mensagens de status. Rode: npx tsx scripts/test-owner.ts
import assert from 'node:assert/strict'
import { seedIngredients, seedRecipes } from '../src/data/financeSeed.ts'
import { menuItems } from '../src/data/menu.ts'
import { buildContext } from '../src/lib/finance/calc.ts'
import { dailySummary, formatDailySummary } from '../src/lib/finance/dailySummary.ts'
import { ownerCommand, type OwnerPorts } from '../src/lib/ownerCommands.ts'
import { statusMessage } from '../src/lib/statusMessages.ts'
import type { MenuItem, Order } from '../src/lib/types.ts'

const TZ = 'America/Campo_Grande'
const NOW = new Date('2026-10-13T20:00:00Z') // 16h em Campo Grande

const order = (n: number, iso: string, itens: { id?: string; nome: string; qtd: number; preco: number }[], extra: Partial<Order> = {}): Order => {
  const subtotal = itens.reduce((s, i) => s + i.preco * i.qtd, 0)
  return {
    id: String(n), numero: n, criado_em: iso, origem: 'site', status: 'concluido', tipo: 'entrega', cliente_nome: `Cliente ${n}`, cliente_telefone: '', endereco: '', pagamento: 'Pix', troco: '', obs: '',
    itens: itens.map((i) => ({ item_id: i.id, nome: i.nome, qtd: i.qtd, preco: i.preco, adicionais: [], obs: '' })), subtotal, entrega: 5, total: subtotal + 5, ...extra,
  }
}
const orders: Order[] = [
  order(1, '2026-10-13T12:00:00Z', [{ id: 't4', nome: 'X-Bacon', qtd: 2, preco: 22 }, { id: 'd1', nome: 'Coca-Cola 350ml', qtd: 2, preco: 6 }]),
  order(2, '2026-10-13T14:00:00Z', [{ id: 'h8', nome: 'Clássico Moriá', qtd: 1, preco: 28 }], { origem: 'whatsapp', status: 'preparo' }),
  order(3, '2026-10-13T15:00:00Z', [{ id: 'h8', nome: 'Clássico Moriá', qtd: 1, preco: 28 }], { status: 'cancelado' }),
  order(4, '2026-10-12T15:00:00Z', [{ id: 't1', nome: 'X Burguer', qtd: 1, preco: 16 }]),
  order(5, '2026-10-13T16:00:00Z', [{ nome: 'Item antigo', qtd: 1, preco: 10 }]),
]

// ── resumo do dia ──
{
  const ctx = buildContext(seedIngredients, seedRecipes)
  const s = dailySummary(orders, ctx, TZ, NOW)
  assert.equal(s.pedidos, 3) // cancelado e outro dia ficam de fora
  assert.equal(s.faturamento, 2 * 22 + 2 * 6 + 5 + 28 + 5 + 10 + 5)
  assert.equal(s.pedidosWhatsapp, 1)
  assert.equal(s.top[0].nome, 'X-Bacon')
  assert.deepEqual(s.semFicha, ['Item antigo'])
  assert.ok(s.cmv > 0 && s.lucroBruto < s.faturamento)
  const txt = formatDailySummary(s)
  assert.match(txt, /Pedidos: 3/)
  assert.match(txt, /Sem ficha técnica/)
  assert.match(formatDailySummary(dailySummary([], ctx, TZ, NOW)), /nenhum pedido/)
  // dia visto no fuso da loja: 03h UTC de 14/10 ainda é 13/10 em Campo Grande
  const late = dailySummary([order(9, '2026-10-14T02:30:00Z', [{ id: 't1', nome: 'X Burguer', qtd: 1, preco: 16 }])], ctx, TZ, NOW)
  assert.equal(late.pedidos, 1)
}

// ── mensagens de status ──
{
  const o = { numero: 12, tipo: 'entrega' as const, cliente_nome: 'Ana Souza' }
  assert.equal(statusMessage(o, 'novo'), null)
  assert.match(statusMessage(o, 'preparo')!, /^Ana, seu pedido #12 já está na brasa/)
  assert.match(statusMessage(o, 'entrega')!, /saiu para entrega/)
  assert.match(statusMessage({ ...o, tipo: 'retirada' }, 'entrega')!, /pronto para retirada/)
  assert.match(statusMessage(o, 'concluido')!, /Bom apetite/)
  assert.match(statusMessage(o, 'cancelado')!, /cancelado/)
  assert.match(statusMessage({ ...o, cliente_nome: '' }, 'preparo')!, /^seu pedido/)
}

// ── comandos do dono ──
function ports() {
  let menu: MenuItem[] = menuItems.map((m) => ({ ...m }))
  const state = { paused: false, calls: 0 }
  const p: OwnerPorts = {
    menu: async () => menu,
    setAvailable: async (ids, v) => {
      state.calls++
      menu = menu.map((m) => (ids.includes(m.id) ? { ...m, disponivel: v } : m))
    },
    setPaused: async (v) => {
      state.paused = v
    },
    orders: async () => orders,
    finance: async () => ({ ingredients: seedIngredients, recipes: seedRecipes }),
    now: () => NOW,
    timeZone: TZ,
  }
  return { p, state, menu: () => menu }
}
{
  const { p, state, menu } = ports()
  assert.match((await ownerCommand('ajuda', p))!, /Comandos do dono/)
  assert.match((await ownerCommand('quanto vendi hoje?', p))!, /Resumo de hoje/)
  assert.match((await ownerCommand('Resumo ontem', p))!, /Resumo de ontem/)
  assert.match((await ownerCommand('pedidos', p))!, /#2 Cliente 2 — preparo/)
  // pausa por ingrediente (descrição) e por nome do item
  const r = (await ownerCommand('acabou o bacon', p))!
  assert.match(r, /Pausei \d+ itens/)
  assert.match(r, /voltou bacon/)
  assert.ok(menu().filter((m) => /bacon/i.test(m.descricao)).every((m) => !m.disponivel))
  assert.ok(menu().find((m) => m.nome === 'Clássico Moriá')!.disponivel)
  assert.match((await ownerCommand('acabou o bacon', p))!, /já estão pausados/)
  assert.match((await ownerCommand('voltou bacon', p))!, /Liberei \d+ itens/)
  assert.ok(menu().every((m) => m.disponivel))
  assert.match((await ownerCommand('pausa o X-Tudo', p))!, /Pausei 1 item: X-Tudo/)
  assert.equal(menu().find((m) => m.nome === 'X-Tudo')!.disponivel, false)
  assert.match((await ownerCommand('sem unicórnio', p))!, /Não achei/)
  // loja
  assert.match((await ownerCommand('fecha a loja', p))!, /parou de receber/)
  assert.equal(state.paused, true)
  assert.match((await ownerCommand('abre a loja', p))!, /voltou a receber/)
  assert.equal(state.paused, false)
  // conversa normal NÃO é comando
  for (const t of ['oi, quero um x-bacon', 'qual o horário?', 'tem sem cebola?', 'pedido pra entrega', '', 'a'.repeat(200)]) assert.equal(await ownerCommand(t, p), null, t)
}
console.log('dono, resumo e status: tudo certo')
