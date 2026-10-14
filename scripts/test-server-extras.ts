// Testa avisos de status, resumo diário e telefone (sem rede). Rode: npx tsx scripts/test-server-extras.ts
import assert from 'node:assert/strict'
import { notifyStatus } from '../api/_lib/notify.ts'
import { sendDailySummary } from '../api/_lib/summary.ts'
import type { ServerStore } from '../api/_lib/webhook.ts'
import { menuItems } from '../src/data/menu.ts'
import { seedIngredients, seedRecipes } from '../src/data/financeSeed.ts'
import { defaultSettings } from '../src/lib/config.ts'
import { defaultBotSettings } from '../src/lib/finance/defaults.ts'
import { phoneVariants, samePhone, toWaPhone } from '../src/lib/phone.ts'
import type { Order } from '../src/lib/types.ts'

// ── telefone ──
assert.equal(toWaPhone('(67) 99802-2571'), '5567998022571')
assert.equal(toWaPhone('5567998022571'), '5567998022571')
assert.equal(toWaPhone('123'), null)
assert.deepEqual(phoneVariants('67998022571'), ['5567998022571', '556798022571'])
assert.deepEqual(phoneVariants('556798022571'), ['556798022571', '5567998022571'])
assert.ok(samePhone('5567998022571', '556798022571'))
assert.ok(!samePhone('5567998022571', '5567911112222'))
assert.ok(!samePhone('', '5567998022571'))

const NOW = new Date('2026-10-13T20:00:00Z')
const order: Order = {
  id: 'o1', numero: 12, criado_em: NOW.toISOString(), origem: 'site', status: 'preparo', tipo: 'entrega', cliente_nome: 'Ana Souza', cliente_telefone: '(67) 99802-2571', endereco: 'x', pagamento: 'Pix', troco: '', obs: '',
  itens: [{ item_id: 't4', nome: 'X-Bacon', qtd: 1, preco: 22, adicionais: [], obs: '' }], subtotal: 22, entrega: 5, total: 27,
}

function fakeStore(over: { bot?: Partial<typeof defaultBotSettings>; order?: Order | null; last?: { telefone: string; criado_em: string } | null }) {
  const saved: string[] = []
  const store = {
    loadStore: async () => ({ name: 'M', address: 'x', instagram: 'm', timezone: 'America/Campo_Grande', settings: defaultSettings, bot: { ...defaultBotSettings, ativo: true, ...over.bot }, menu: menuItems, open: true }),
    getOrder: async () => (over.order === undefined ? order : over.order),
    lastCustomerMessage: async () => (over.last === undefined ? { telefone: '556798022571', criado_em: new Date(NOW.getTime() - 3_600_000).toISOString() } : over.last),
    saveReply: async (_p: string, t: string) => { saved.push(t) },
    ordersSince: async () => [order],
    ownerPorts: () => ({ menu: async () => menuItems, setAvailable: async () => undefined, setPaused: async () => undefined, orders: async () => [order], finance: async () => ({ ingredients: seedIngredients, recipes: seedRecipes }), now: () => NOW, timeZone: 'America/Campo_Grande' }),
  } as unknown as ServerStore
  return { store, saved }
}

// ── aviso de status ──
{
  const sent: [string, string][] = []
  const send = async (to: string, t: string) => { sent.push([to, t]) }
  let r = await notifyStatus(fakeStore({}).store, 'o1', 'entrega', send, NOW)
  assert.equal(r.sent, true)
  assert.deepEqual(sent[0][0], '556798022571') // usa o número exato que falou com a loja
  assert.match(sent[0][1], /saiu para entrega/)
  r = await notifyStatus(fakeStore({}).store, 'o1', 'novo', send, NOW)
  assert.equal(r.sent, false)
  r = await notifyStatus(fakeStore({ bot: { avisos_status: false } }).store, 'o1', 'entrega', send, NOW)
  assert.match(r.reason!, /desligados/)
  r = await notifyStatus(fakeStore({ bot: { ativo: false } }).store, 'o1', 'entrega', send, NOW)
  assert.equal(r.sent, false)
  r = await notifyStatus(fakeStore({ order: { ...order, cliente_telefone: '' } }).store, 'o1', 'entrega', send, NOW)
  assert.match(r.reason!, /sem telefone/)
  r = await notifyStatus(fakeStore({ last: null }).store, 'o1', 'entrega', send, NOW)
  assert.match(r.reason!, /24 horas/)
  r = await notifyStatus(fakeStore({ last: { telefone: '556798022571', criado_em: new Date(NOW.getTime() - 25 * 3_600_000).toISOString() } }).store, 'o1', 'entrega', send, NOW)
  assert.match(r.reason!, /24 horas/)
  r = await notifyStatus(fakeStore({ order: null }).store, 'zz', 'entrega', send, NOW)
  assert.match(r.reason!, /não encontrado/)
  assert.equal(sent.length, 1)
}

// ── resumo diário ──
{
  const texts: string[] = []
  const templ: string[] = []
  const deps = { sendText: async (_t: string, x: string) => { texts.push(x) }, now: NOW }
  const first = await sendDailySummary(fakeStore({ bot: { telefone_dono: '67998022571' } }).store, deps)
  assert.equal(first.sent, true)
  assert.match(texts[0], /Resumo de hoje/)
  assert.match(texts[0], /Pedidos: 1/)
  await sendDailySummary(fakeStore({ bot: { telefone_dono: '67998022571' } }).store, { ...deps, sendTemplate: async (_t, x) => { templ.push(x) } })
  assert.equal(templ.length, 1)
  assert.equal(texts.length, 1)
  let r = await sendDailySummary(fakeStore({ bot: { telefone_dono: '' } }).store, deps)
  assert.match(r.reason!, /dono/)
  r = await sendDailySummary(fakeStore({ bot: { telefone_dono: '67998022571', resumo_diario: false } }).store, deps)
  assert.match(r.reason!, /desligado/)
  r = await sendDailySummary(fakeStore({ bot: { telefone_dono: '67998022571', ativo: false } }).store, deps)
  assert.equal(r.sent, false)
}
console.log('avisos, resumo e telefone: tudo certo')
